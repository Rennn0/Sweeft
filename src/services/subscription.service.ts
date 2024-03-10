import { DbContext } from "..";
import { SubscriptionTier } from "../entity/subscriptionTier";
import { BasicSubscription } from "../models/Subscription.Basic";
import { FreeSubscription } from "../models/Subscription.Free";
import { PremiumSubscription } from "../models/Subscription.Premium";

export class SubscriptionService {
    constructor() { }

    public static ComputePrice(companyId: number): Promise<number> {
        return new Promise<number>(async (resolve, reject) => {
            //LOAD ALL RELATIONS
            const sub = await DbContext.getRepository(SubscriptionTier)
                .findOne({ where: { company: { companyId: 5 }, isActive: true }, relations: ['company', 'company.employees', 'company.employees.files', 'subscriptionType'] });

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
            return resolve(price);
        })
    }
}