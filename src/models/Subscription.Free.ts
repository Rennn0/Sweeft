import { SubscriptionTier } from "../entity/subscriptionTier";
import { SubscriptionBase } from "./Subscription.Base";

export class FreeSubscription extends SubscriptionBase {
    private _sub: SubscriptionTier;

    constructor(private sub: SubscriptionTier) {
        super(sub.activationDate, "Free");
        this._sub = sub;
    }

    public ComputePrice(): number {
        return 0;
    }
}