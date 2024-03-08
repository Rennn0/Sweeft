import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Company } from "./company";
import { SubscriptionType } from "./subscriptionType";

@Entity()
export class SubscriptionTier {
    @PrimaryGeneratedColumn()
    tierId!: number;

    @Column({ default: 0 })
    computedPrice!: number;

    @Column('decimal', { precision: 18 })
    activationDate!: number;

    @Column('decimal', { precision: 18, default: 0 })
    deactivationDate!: number;

    @Column({ default: false })
    isActive!: boolean;

    @ManyToOne(() => Company, comp => comp.subscriptions, { nullable: true, eager: false })
    @JoinColumn({ name: "companyId" })
    company!: Company;

    @ManyToOne(() => SubscriptionType, type => type.tiers, { eager: false })
    @JoinColumn({ name: "subTypeId" })
    subscriptionType!: SubscriptionType;
}