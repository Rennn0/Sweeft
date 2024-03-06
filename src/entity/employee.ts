import { Column, Entity, JoinColumn, JoinTable, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Company } from "./company";
import { FileUpload } from "./fileUploads";

@Entity()
export class Employee {
    @PrimaryGeneratedColumn()
    employeeId: number;

    @Column()
    isAdmin: boolean;

    @Column()
    username: string;

    @Column()
    password: string;

    @Column()
    mail: string;

    @ManyToOne(() => Company, company => company.employees)
    company: Company | null;

    @OneToMany(() => FileUpload, file => file.author)
    files: FileUpload[] | null

    constructor() {
        this.employeeId = 0;
        this.isAdmin = false;
        this.username = '';
        this.password = '';
        this.mail = '';
        this.company = null;
        this.files = null;
    }
}