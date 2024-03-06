import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Company } from "./company";
import { SubscriptionType } from "./subscriptionType";

@Entity()
export class SubscriptionTier {
    @PrimaryGeneratedColumn()
    tierId: number;

    @Column()
    computedPrice: number;

    @Column('decimal', { precision: 18 })
    activationDate: number;

    @OneToOne(() => Company, comp => comp.companyId)
    @JoinColumn()
    company: Company | null;

    @ManyToOne(() => SubscriptionType, type => type.tiers)
    @JoinColumn()
    subscriptionType: SubscriptionType | null;

    constructor() {
        this.tierId = 0;
        this.activationDate = 0;
        this.computedPrice = 0;
        this.company = null;
        this.subscriptionType = null;
    }
}