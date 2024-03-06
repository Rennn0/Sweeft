import { Column, Double, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm"
import { SubscriptionTier } from "./subscriptionTier";

@Entity()
export class SubscriptionType {
    @PrimaryGeneratedColumn()
    subscriptionTypeId: number;

    @Column()
    tier: number;

    @Column()
    tierName: string;

    @Column()
    fileUpperBound: number;

    @Column()
    fileLowerBound: number;

    @Column()
    employeeUpperBound: number;

    @Column()
    employeeLowerBound: number;

    @Column()
    fixedPrice: number;

    @Column('decimal', { precision: 3, scale: 2 })
    priceIncrement: number;

    @OneToMany(() => SubscriptionTier, tier => tier.subscriptionType)
    tiers: SubscriptionTier[] | null;

    constructor() {
        this.subscriptionTypeId = 0;
        this.tier = 0;
        this.tierName = '';
        this.fileUpperBound = 0;
        this.fileLowerBound = 0;
        this.employeeUpperBound = 0;
        this.employeeLowerBound = 0;
        this.fixedPrice = 0;
        this.priceIncrement = 0;
        this.tiers = null;
    }
}