import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    BeforeInsert,
    BeforeUpdate,
    OneToMany,
} from 'typeorm';
// import { Post } from './post.js';
import * as bcrypt from 'bcrypt';

// Define an enum for the user roles
export enum UserRole {
    USER = 'user',
    ADMIN = 'admin',
}

export enum UserStatus {
    ACTIVE = 'active',
    SUSPENDED = 'suspended',
    BANNED= 'banned',
}

// Used for the `posts` table
export enum PostStatus {
    PENDING = 'pending',
    APPROVED = 'approved',
    REJECTED = 'rejected',
}

// Map this entity to the `users` table
@Entity('users')
export class User {
    // SERIAL PRIMARY KEY
    // TypeORM handles 'increment' for postgres
    @PrimaryGeneratedColumn({ name: 'user_id' })
    userId!: number;

    @Column({ type: 'varchar', length: 50, name: 'first_name' })
    firstName!: string;

    @Column({ type: 'varchar', length: 50, name: 'last_name' })
    lastName!: string;

    @Column({ type: 'varchar', length: 100, unique: true })
    email!: string;

    @Column({ type: 'varchar', length: 100 })
    password!: string;

    @Column({ type: 'enum', enum: UserRole })
    role!: UserRole;

    @Column({ type: 'enum', enum: UserStatus })
    status!: UserStatus;

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

    @OneToMany('Post', (post: any) => post.user)
    posts!: any[];
}