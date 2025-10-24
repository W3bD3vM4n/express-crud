import { AppDataSource } from '../data-source.js';
import { Post } from '../entities/post.js';
import { UserRole, PostStatus } from '../entities/user.js';
import { CreatePostZod, GetPostZod } from '../schemas/post.schema.js';

const postZod = AppDataSource.getRepository(Post);

// Convert the Entity to the PostResponse type
const toPostResponse = (post: Post): GetPostZod => {
    return {
        postId: post.postId,
        title: post.title,
        body: post.body,
        status: post.status,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        user: post.user ? {
            userId: post.user.userId,
            firstName: post.user.firstName,
            lastName: post.user.lastName,
        } : null,
        category: {
            categoryId: post.category.categoryId,
            name: post.category.name,
        },
    };
};

export class PostService {
    // CREATE
    async createFromZod(create: CreatePostZod, userId: number): Promise<GetPostZod> {
        const post = postZod.create({
            // Status defaults to PENDING for Admin review
            ...create,
            userId: userId,
            status: PostStatus.PENDING,
        });

        const newPost = await postZod.save(post);

        // We need to refetch to get relations
        try {
            return await this.getByIdFromZod(newPost.postId);
        } catch (error) {
            throw new Error('Post created but could not be retrieved');
        }
    }

    // READ
    async getAllFromZod(options: { categoryId?: number } = {}): Promise<GetPostZod[]> {
        const queryOptions: any = {
            // Finds all publicly visible posts (status = APPROVED)
            where: { status: PostStatus.APPROVED },
            relations: ['user', 'category'],
            order: { createdAt: 'DESC' },
        };

        if (options.categoryId) {
            queryOptions.where.categoryId = options.categoryId;
        }

        const posts = await postZod.find(queryOptions);
        return posts.map(toPostResponse);
    }

    // Finds all posts by user, regardless of status
    async getSpecificUserPostsFromZod(userId: number): Promise<GetPostZod[]> {
        const posts = await postZod.find({
            where: { userId },
            relations: ['user', 'category'],
            order: { createdAt: 'DESC' },
        });
        return posts.map(toPostResponse);
    }

    // Finds a single post by its ID, ensuring relations are loaded
    async getByIdFromZod(postId: number): Promise<GetPostZod> {
        const post = await postZod.findOne({
            where: { postId },
            relations: ['user', 'category'],
        });
        if (!post) {
            throw new Error('Post not found');
        }
        return toPostResponse(post);
    }

    // DELETE
    async deleteFromZod(postId: number, currentUserId: number, currentUserRole: UserRole): Promise<boolean> {
        // The author can be the User or the Administrator
        const post = await postZod.findOneBy({ postId });
        if (!post) {
            throw new Error('Post not found');
        }

        if (currentUserRole !== UserRole.ADMIN && post.userId !== currentUserId) {
            throw new Error('Forbidden: You do not have permission to delete this post.');
        }

        const result = await postZod.delete(postId);
        return result.affected !== 0;
    }

    // Admin: Finds all posts pending review
    async findPending(): Promise<GetPostZod[]> {
        const posts = await postZod.find({
            where: { status: PostStatus.PENDING },
            relations: ['user', 'category'],
            order: { createdAt: 'ASC' },
        });
        return posts.map(toPostResponse);
    }

    // Admin: Approves or rejects a post
    async moderate(postId: number, newStatus: PostStatus.APPROVED | PostStatus.REJECTED): Promise<GetPostZod> {
        const post = await postZod.findOneBy({ postId });
        if (!post) {
            throw new Error('Post not found');
        }

        post.status = newStatus;
        const updatedPost = await postZod.save(post);
        return this.getByIdFromZod(updatedPost.postId);
    }
}