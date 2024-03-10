import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Employee } from "./employee";

@Entity()
export class FileUpload {
    @PrimaryGeneratedColumn()
    fileId!: number;

    @Column()
    extension!: string;

    @Column('decimal', { precision: 18 })
    uploadDate!: number;

    @Column()
    visibleForAll!: boolean;

    @Column({ default: '' })
    filePath!: string;

    @Column({ default: '' })
    fileName!: string;

    @Column("decimal", { default: 0, precision: 10 })
    size!: number;

    @ManyToOne(() => Employee, emp => emp.files, { nullable: true })
    @JoinColumn({ name: "employeeId" })
    author!: Employee | null; // NULL means_ authhor employee got deleted from company

    @ManyToMany(() => Employee)
    @JoinTable()
    visibleFor!: Employee[]
}