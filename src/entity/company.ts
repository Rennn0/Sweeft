import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm"
import { SubscriptionTier } from "./subscriptionTier";
import { Employee } from "./employee";

@Entity()
export class Company {
    @PrimaryGeneratedColumn()
    companyId: number;

    @Column({ default: 'new' })
    companyName: string

    // @Column({ unique: true }) for test env
    @Column()
    email: string;

    @Column()
    password: string;

    @Column()
    country: string;

    @Column()
    industry: string;

    @Column({ default: false })
    isActivated: boolean;

    @OneToOne(() => SubscriptionTier, sub => sub.tierId)
    @JoinColumn()
    subscription: SubscriptionTier | null;

    @OneToMany(() => Employee, employee => employee.company)
    employees: Employee[] | null;

    constructor() {
        this.companyId = 0;
        this.companyName = '';
        this.email = '';
        this.password = '';
        this.country = '';
        this.industry = '';
        this.isActivated = false;
        this.employees = null;
        this.subscription = null;
    }
}