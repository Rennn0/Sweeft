import { Column, Entity, JoinColumn, JoinTable, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Company } from "./company";
import { FileUpload } from "./fileUploads";

@Entity()
export class Employee {
    @PrimaryGeneratedColumn()
    employeeId!: number;

    @Column()
    isAdmin!: boolean;

    @Column()
    username!: string;

    @Column()
    password!: string;

    @Column()
    mail!: string;

    @ManyToOne(() => Company, company => company.employees, { eager: false })
    @JoinColumn({ name: "companyId" })
    company!: Company;

    @OneToMany(() => FileUpload, file => file.author, { eager: false })
    files!: FileUpload[]
}