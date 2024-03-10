export abstract class SubscriptionBase {
    private _startedAt: number;
    private _tier: string;
    constructor(start: number, tier: string) {
        this._startedAt = start;
        this._tier = tier;
    }

    abstract ComputePrice(): number;
}