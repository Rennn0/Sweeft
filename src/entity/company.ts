import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm"
import { SubscriptionTier } from "./subscriptionTier";
import { Employee } from "./employee";

@Entity()
export class Company {
    @PrimaryGeneratedColumn()
    companyId!: number;

    @Column({ default: 'new' })
    companyName!: string

    @Column({ unique: true, collation: "SQL_Latin1_General_CP1_CS_AS" })
    email!: string;

    @Column()
    password!: string;

    @Column()
    country!: string;

    @Column()
    industry!: string;

    @Column({ default: false })
    isActivated!: boolean;

    @OneToMany(() => SubscriptionTier, sub => sub.company, { onUpdate: "CASCADE", onDelete: "SET NULL" })
    subscriptions!: SubscriptionTier[];

    @OneToMany(() => Employee, employee => employee.company, { onUpdate: "CASCADE", onDelete: "SET NULL" })
    employees!: Employee[];
}