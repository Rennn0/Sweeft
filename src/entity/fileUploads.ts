import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Employee } from "./employee";

@Entity()
export class FileUpload {
    @PrimaryGeneratedColumn()
    fileId: number;

    @Column()
    extension: string;

    @Column()
    uploadDate: number;

    @Column()
    visibility: boolean;

    @ManyToOne(() => Employee, emp => emp.files)
    author: Employee | null;

    constructor() {
        this.fileId = 0;
        this.extension = '';
        this.uploadDate = 0;
        this.visibility = false;
        this.author = null;
    }
}