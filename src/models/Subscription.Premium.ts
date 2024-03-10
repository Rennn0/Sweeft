import { SubscriptionTier } from "../entity/subscriptionTier";
import { SubscriptionBase } from "./Subscription.Base";

export class PremiumSubscription extends SubscriptionBase {
    private _sub: SubscriptionTier;

    constructor(private sub: SubscriptionTier) {
        super(sub.activationDate, "Premium");
        this._sub = sub;
    }

    public ComputePrice(): number {
        const fixedPrice = this._sub.subscriptionType.fixedPrice;
        const incremnet = this._sub.subscriptionType.priceIncrement;
        const filesUpperBound = this._sub.subscriptionType.fileUpperBound;
        const filesCount = this._sub.company.employees.reduce((prev, curr) => prev + curr.files.length, 0);

        let price = fixedPrice;

        if (filesCount > filesUpperBound) {
            price += filesCount * incremnet;
        }

        return price;
    }
}