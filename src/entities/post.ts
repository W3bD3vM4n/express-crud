import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn
} from 'typeorm';
import { User, PostStatus } from './user.js';
// import { Category } from './category.js';

@Entity('posts')
export class Post {
    @PrimaryGeneratedColumn({ name: 'post_id' })
    postId!: number;

    @Column({ type: 'varchar', length: 100 })
    title!: string;

    @Column({ type: 'text' })
    body!: string;

    @Column({ type: 'enum', enum: PostStatus, default: PostStatus.PENDING })
    status!: PostStatus;

    @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', name: 'created_at' })
    createdAt!: Date;

    @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', name: 'updated_at' })
    updatedAt!: Date;

    // Relationships
    @Column({ type: 'int', name: 'user_id', nullable: true })
    userId!: number | null;

    @ManyToOne('User', (user: User) => user.posts, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'user_id' })
    user!: User;

    @Column({ type: 'int', name: 'category_id' })
    categoryId!: number;

    @ManyToOne('Category', (category: any) => category.posts, { onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'category_id' })
    category!: any;
}