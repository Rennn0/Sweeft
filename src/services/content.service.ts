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
        return new Promise<void>(async () => {
            const hashedPassword = await this.GetHashedPassword(newPass);
            await DbContext.createQueryBuilder()
                .update(Company)
                .set({ password: hashedPassword })
                .where("companyId=:id", { id: companyId })
                .execute();
        })
    }

    public static async ChangeSubscription(companyId: number, plan: string): Promise<void> {
        return new Promise<void>(async () => {
            const subTypeRepo = DbContext.getRepository(SubscriptionType);
            const companyRepo = DbContext.getRepository(Company);
            const subTierRepo = DbContext.getRepository(SubscriptionTier);

            const subType = await subTypeRepo.findOne({ where: { tierName: plan } });
            const company = await companyRepo.findOne({ where: { companyId: companyId } });

            if (!company)
                return;

            let newSub = new SubscriptionTier();
            newSub.activationDate = Date.now();
            newSub.computedPrice = 0;
            newSub.subscriptionType = subType;
            newSub.company = company;

            await subTierRepo.save(newSub);

            company.subscription = newSub;
            await companyRepo.save(company);
        })
    }
}