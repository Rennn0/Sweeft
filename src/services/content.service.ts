import { Repository } from "typeorm";
import { DbContext } from "..";
import { Company } from "../entity/company";
import { SubscriptionTier } from "../entity/subscriptionTier";
import { SubscriptionType } from "../entity/subscriptionType";
import { AuthService } from "./auth.service";

export class ContentService extends AuthService {
    constructor() {
        super();
    }

    public async ChangePassword(companyId: number, newPass: string): Promise<void> {
        return new Promise<void>(async (resolve) => {
            const hashedPassword = await this.GetHashedPassword(newPass);
            await DbContext.createQueryBuilder()
                .update(Company)
                .set({ password: hashedPassword })
                .where("companyId=:id", { id: companyId })
                .execute();
            console.log("CHANGED PASSWORD");
            resolve()
        })
    }

    public static async ChangeSubscription(companyId: number, plan: string): Promise<void> {
        return new Promise<void>(async (resolve) => {
            const repoCompany = DbContext.getRepository(Company);
            const repoSubTier = DbContext.getRepository(SubscriptionTier);
            const repoSubType = DbContext.getRepository(SubscriptionType);

            const company = (await repoCompany.findOneBy({ companyId: companyId }))!;

            await ContentService.DeactivateOldSubscription(repoSubTier, company).catch(error => console.error(error));
            await ContentService.ActivateNewSubscription(repoSubTier, repoSubType, company, plan).catch(error => console.error(error));
            resolve();
        })
    }

    private static async DeactivateOldSubscription(repoSubTier: Repository<SubscriptionTier>, company: Company): Promise<void> {
        return new Promise<void>(async (resolve) => {
            await repoSubTier.findOneBy({ company: company, isActive: true })
                .then(async (unit) => {
                    if (unit) {
                        unit.isActive = false;
                        unit.deactivationDate = Date.now();
                        /**
                         *  HERE MAY BE PRICE COMPUTAION LOGIC, BUT LATER
                         */
                        await repoSubTier.save(unit);
                    }
                })
                .finally(() => resolve());
        })
    }

    private static async ActivateNewSubscription(repoSubTier: Repository<SubscriptionTier>, repoSubType: Repository<SubscriptionType>, company: Company, newPlan: string): Promise<void> {
        return new Promise<void>(async (resolve) => {
            const sub = new SubscriptionTier();
            sub.activationDate = Date.now();
            sub.company = company;
            sub.isActive = true;

            const type = await repoSubType.findOneBy({ tierName: newPlan }).catch(error => console.error(error));
            if (type instanceof SubscriptionType) {
                sub.subscriptionType = type
                await repoSubTier.save(sub);
            }
            resolve();
        })
    }
}