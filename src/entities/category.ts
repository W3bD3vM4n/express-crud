import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany
} from 'typeorm';
// import { Post } from './post.js';

@Entity('categories')
export class Category {
    @PrimaryGeneratedColumn({ name: 'category_id' })
    categoryId!: number;

    @Column({ type: 'varchar', length: 100, unique: true })
    name!: string;

    @Column({ type: 'text', nullable: true })
    description?: string;

    @OneToMany('Post', (post: any) => post.category)
    posts!: any[];
}