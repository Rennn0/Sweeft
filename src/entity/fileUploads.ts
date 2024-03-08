import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
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

    @ManyToOne(() => Employee, emp => emp.files, { eager: false })
    @JoinColumn({ name: "employeeId" })
    author!: Employee;
}