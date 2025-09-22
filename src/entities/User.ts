import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    BeforeInsert,
    BeforeUpdate
} from 'typeorm';
import * as bcrypt from 'bcrypt';

// Define an enum for the user roles
export enum UserRole {
    PARTICIPANT = 'participant',
    ORGANIZER = 'organizer',
    ADMIN = 'admin',
}

@Entity('users') // Map this entity to the 'users' table
export class User {
    // SERIAL PRIMARY KEY
    // TypeORM handles 'increment' for postgres
    @PrimaryGeneratedColumn({ name: 'user_id' })
    userId!: number;

    @Column({ type: 'varchar', length: 100, name: 'first_name' })
    firstName!: string;

    @Column({ type: 'varchar', length: 100, name: 'last_name' })
    lastName!: string;

    @Column({ type: 'varchar', length: 150, unique: true })
    email!: string;

    @Column({ type: 'varchar', length: 200 })
    password!: string;

    @Column({ type: 'varchar', length: 50 })
    role!: UserRole;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', name: 'created_at' })
    createdAt!: Date;

    // A TypeORM hook to hash password before saving
    @BeforeInsert()
    @BeforeUpdate()
    hashPassword() {
        // Only hash password if it has been changed (or is new)
        if (this.password) {
            this.password = bcrypt.hashSync(this.password, 10);
        }
    }
}