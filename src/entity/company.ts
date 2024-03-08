import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm"
import { SubscriptionTier } from "./subscriptionTier";
import { Employee } from "./employee";

@Entity()
export class Company {
    @PrimaryGeneratedColumn()
    companyId!: number;

    @Column({ default: 'new' })
    companyName!: string

    // @Column({ unique: true }) for test env
    @Column()
    email!: string;

    @Column()
    password!: string;

    @Column()
    country!: string;

    @Column()
    industry!: string;

    @Column({ default: false })
    isActivated!: boolean;

    @OneToMany(() => SubscriptionTier, sub => sub.company, { eager: false })
    subscriptions!: SubscriptionTier[];

    @OneToMany(() => Employee, employee => employee.company, { eager: false })
    employees!: Employee[];
}