import { Column, Entity, JoinColumn, JoinTable, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Company } from "./company";
import { FileUpload } from "./fileUploads";

@Entity()
export class Employee {
    @PrimaryGeneratedColumn()
    employeeId!: number;

    @Column()
    isAdmin!: boolean;

    @Column({ unique: true })
    username!: string;

    @Column({ default: '' })
    password!: string;

    @Column({ default: '' })
    email!: string;

    @Column({ default: false })
    isActivated!: boolean;

    @ManyToOne(() => Company, company => company.employees)
    @JoinColumn({ name: "companyId" })
    company!: Company;

    @OneToMany(() => FileUpload, file => file.author, { onUpdate: "CASCADE", onDelete: "SET NULL" })
    files!: FileUpload[]
}