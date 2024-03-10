import { DbContext } from "..";
import { Company } from "../entity/company";
import { SubscriptionTier } from "../entity/subscriptionTier";
import { SubscriptionBase } from "./Subscription.Base";

export class BasicSubscription extends SubscriptionBase {
    private _sub: SubscriptionTier;

    constructor(private sub: SubscriptionTier) {
        super(sub.activationDate, "Basic");
        this._sub = sub;
    }

    public ComputePrice(): number {
        const employeeCount = this._sub.company.employees.length;
        const fixedPrice = this._sub.subscriptionType.fixedPrice;
        const increment = this._sub.subscriptionType.priceIncrement;

        const price = fixedPrice + (employeeCount * increment);
        return price;
    }
}