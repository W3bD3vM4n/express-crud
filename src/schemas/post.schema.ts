import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { PostStatus } from '../entities/user.js';
import { UserResponseSchema } from './user.schema.js';
import { GetCategorySchema } from './category.schema.js';

extendZodWithOpenApi(z);

// 1. Base Schema: Mirrors the table `Post`
export const PostSchema = z.object({
    postId: z.number().openapi({
        description: 'Auto-generated post ID',
        example: 1,
    }),
    title: z.string().min(1, 'Title is required').max(255).openapi({
        description: 'The title of the post',
        example: 'Selling Calculus Textbook',
    }),
    body: z.string().min(1, 'Body is required').openapi({
        description: 'The main content of the post',
        example: 'Slightly used, 10th edition. Contact me for details.',
    }),
    status: z.nativeEnum(PostStatus).openapi({
        description: 'The moderation status of the post',
        example: PostStatus.PENDING,
    }),
    createdAt: z.date().openapi({
        description: 'Post creation date',
        type: 'string',
        format: 'date-time',
    }),
    updatedAt: z.date().openapi({
        description: 'Post last updated date',
        type: 'string',
        format: 'date-time',
    }),
});

// 2. Schema: Create Post (Input)
// Derived from the Base Schema, only including fields the user provides
export const CreatePostSchema = PostSchema.pick({
    title: true,
    body: true,
}).extend({
    categoryId: z.number().openapi({
        description: 'The ID this post belongs to',
        example: 1,
    }),
}).openapi('CreatePostRequest');

// 3. Schema: Read Post (Output)
// Extends the Base Schema to include related data for a rich response
export const GetPostSchema = PostSchema.extend({
    // Nest a simplified user object
    // Nullable in case the author's account is deleted
    user: UserResponseSchema.pick({
        userId: true,
        firstName: true,
        lastName: true,
    }).nullable().openapi({ description: "The post's author" }),

    // Nest a simplified category object
    category: GetCategorySchema.pick({
        categoryId: true,
        name: true,
    }).openapi({ description: "The post's category" }),
}).openapi('PostResponse');

// 4. Schema: Update Post (Input)
// Fields are made optional because a user might only want to update some
// It's not used unless you want to add admin editing later
// export const UpdatePostSchema = CreatePostSchema.partial().openapi('UpdatePostRequest');

// ID parameter validation
export const IdParamSchema = z.object({
    id: z.string().regex(/^\d+$/, 'ID must be a number').transform(Number)
});

// 5. Type Inference for TypeScript
export type CreatePostZod = z.infer<typeof CreatePostSchema>;
export type GetPostZod = z.infer<typeof GetPostSchema>;
// export type UpdatePostZod = z.infer<typeof UpdatePostSchema>;