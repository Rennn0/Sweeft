import { Column, Double, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm"
import { SubscriptionTier } from "./subscriptionTier";

@Entity()
export class SubscriptionType {
    @PrimaryGeneratedColumn()
    subscriptionTypeId!: number;

    @Column()
    tier!: number;

    @Column()
    tierName!: string;

    @Column()
    fileUpperBound!: number;

    @Column()
    fileLowerBound!: number;

    @Column()
    employeeUpperBound!: number;

    @Column()
    employeeLowerBound!: number;

    @Column()
    fixedPrice!: number;

    @Column('decimal', { precision: 3, scale: 2 })
    priceIncrement!: number;

    @OneToMany(() => SubscriptionTier, tier => tier.subscriptionType, { onUpdate: "CASCADE", onDelete: "SET NULL" })
    tiers!: SubscriptionTier[];
}