import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('users')
export class User {

    @PrimaryGeneratedColumn()
    id: number

    @Column({ length: 100, nullable: true })
    name: string

    @Column({ length: 100, nullable: false, unique: true })
    email: string

    @Column({ length: 255, nullable: false })
    password: string

    @Column({ type: 'enum', nullable: false, enum: ['admin', 'user'], default: 'user' })
    role: 'admin' | 'user'

    // Campos de auditoria 
    // Atualizam automaticamente nas operações (INSERT, UPDATE)
    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date

}