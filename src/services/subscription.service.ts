import { DbContext, DecodedToken } from "..";
import { SubscriptionTier } from "../entity/subscriptionTier";
import { BasicSubscription } from "../models/Subscription.Basic";
import { FreeSubscription } from "../models/Subscription.Free";
import { PremiumSubscription } from "../models/Subscription.Premium";
import { SubscriptionParameter } from "../models/subParam";

export class SubscriptionService {
    constructor() { }

    public static ComputePrice(companyId: number): Promise<number> {
        return new Promise<number>(async (resolve, reject) => {
            //LOAD ALL RELATIONS
            const sub = await DbContext.getRepository(SubscriptionTier)
                .findOne({ where: { company: { companyId: companyId }, isActive: true }, relations: ['company', 'company.employees', 'company.employees.files', 'subscriptionType'] });

            if (sub) {
                const isMonthPassed = sub.lastPaymentDate == 0 ?
                    SubscriptionService.MonthPassed(sub.activationDate) :
                    SubscriptionService.MonthPassed(sub.lastPaymentDate);
                if (!isMonthPassed)
                    return resolve(0);


                let price = 0;
                switch (sub?.subscriptionType.tierName) {
                    case "Free":
                        const free = new FreeSubscription(sub);
                        price = free.ComputePrice();
                        break;
                    case "Basic":
                        const basic = new BasicSubscription(sub);
                        price = basic.ComputePrice();
                        break;
                    case "Premium":
                        const premium = new PremiumSubscription(sub);
                        price = premium.ComputePrice();
                        break;
                }

                await SubscriptionService.UpdateSubscription(sub.tierId, price);
                return resolve(price);
            }
            return resolve(0);
        })
    }

    public static async EnabledBySubscription(param: SubscriptionParameter): Promise<boolean> {
        return new Promise<boolean>(async (resolve) => {
            switch (param.type) {
                case "decodedToken": // when /add/employee  (has both company and admin access)
                    break;
                case "employeeId": // when /upload/file (has )
            }

        })
    }

    private static async SubEnablesNewEmployee(): Promise<boolean> {
        return new Promise<boolean>(async (resolve) => {

        })
    }

    private static async SubEnablesNewFile(): Promise<boolean> {
        return new Promise<boolean>(async (resolve) => {

        })
    }

    private static MonthPassed(time: number): boolean {
        const oneMonthMs = 30 * 24 * 360 * 1000;
        const currentTime = Date.now();
        return currentTime >= (time + oneMonthMs);
    }

    private static async UpdateSubscription(tierId: number, amount: number): Promise<void> {
        return new Promise<void>(async (resolve, reject) => {
            await DbContext.getRepository(SubscriptionTier).createQueryBuilder()
                .update(SubscriptionTier)
                .set({ computedPrice: amount, lastPaymentDate: Date.now() })
                .where(`tierId=${tierId}`)
                .execute()
                .then(() => resolve())
                .catch(err => reject())
        })
    }
}