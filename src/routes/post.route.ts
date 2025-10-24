import { Router } from 'express';
import { PostController } from '../controllers/post.controller.js';
import { jwtAuth } from '../middleware/jwt-auth.js';
import { authorize } from '../middleware/authorize.js';
import { validate, validateParams } from '../middleware/validate.js';
import { UserRole, PostStatus } from '../entities/user.js';
import {
    IdParamSchema,
    CreatePostSchema,
    GetPostSchema
} from '../schemas/post.schema.js';

// 1. Import the OpenAPI Registry
import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

// 2. Create a registry for this module
export const postRegistry = new OpenAPIRegistry();

// 3. Register the schemas (OpenAPI Documentation)
postRegistry.register('CreatePostRequest', CreatePostSchema);
postRegistry.register('GetPostResponse', GetPostSchema);

// The entire router uses the authorize middleware
// to ensure only admins can access these endpoints
const router = Router();
const postController = new PostController();

// 4. Define routes and documentation

// 4.1 Public routes (no auth required)
// READ
postRegistry.registerPath({
    method: 'get',
    path: '/posts',
    summary: 'Get all approved posts',
    tags: ['Posts'],
    request: { // optional category filter
        query: z.object({
            category: z.string().regex(/^\d+$/).optional().openapi({
                description: 'Filter posts by category ID',
                example: '1',
            }),
        }),
    },
    responses: {
        200: {
            description: 'List of approved posts',
            content: {
                'application/json': {
                    schema: z.array(GetPostSchema),
                },
            },
        },
        400: {
            description: 'Invalid category ID format',
        },
    },
});
router.get('/posts',
    postController.getAllPosts.bind(postController)
);

// 4.2 Protected routes (auth required)
// CREATE
postRegistry.registerPath({
    method: 'post',
    path: '/posts',
    summary: 'Create a new post',
    tags: ['Posts'],
    security: [{ bearerAuth: [] }],
    request: {
        body: {
            content: {
                'application/json': {
                    schema: CreatePostSchema,
                },
            },
        },
    },
    responses: {
        201: {
            description: 'Post created successfully (pending admin approval)',
            content: {
                'application/json': {
                    schema: GetPostSchema,
                },
            },
        },
        400: {
            description: 'Invalid request data',
        },
        401: {
            description: 'Unauthorized - Authentication required',
        },
    },
});
router.post('/posts',
    jwtAuth,
    validate(CreatePostSchema),
    postController.createPost.bind(postController)
);

// READ
postRegistry.registerPath({
    method: 'get',
    path: '/posts/my-posts',
    summary: 'Get current user\'s posts',
    tags: ['Posts'],
    security: [{ bearerAuth: [] }],
    responses: {
        200: {
            description: 'List of user\'s posts',
            content: {
                'application/json': {
                    schema: z.array(GetPostSchema),
                },
            },
        },
        401: {
            description: 'Unauthorized - Authentication required',
        },
    },
});
router.get('/posts/my-posts',
    jwtAuth,
    postController.getSpecificUserPosts.bind(postController)
);

// DELETE
// Users can delete their own, Admin can delete any
postRegistry.registerPath({
    method: 'delete',
    path: '/posts/{id}',
    summary: 'Delete a post',
    tags: ['Posts'],
    security: [{ bearerAuth: [] }],
    request: {
        params: IdParamSchema,
    },
    responses: {
        204: {
            description: 'Post deleted successfully',
        },
        400: {
            description: 'Invalid post ID format',
        },
        401: {
            description: 'Unauthorized - Authentication required',
        },
        403: {
            description: 'Forbidden - You can only delete your own posts',
        },
        404: {
            description: 'Post not found',
        },
    },
});
router.delete('/posts/:id',
    jwtAuth,
    validateParams(IdParamSchema),
    postController.deletePost.bind(postController)
);

// 4.3 Admin Routes (Admin role required)
// Apply authentication and authorization middleware
// to all routes below this point
const adminRouter = Router();
adminRouter.use(jwtAuth, authorize(UserRole.ADMIN));

// GET pending posts
postRegistry.registerPath({
    method: 'get',
    path: '/posts/admin/pending',
    summary: 'Get all pending posts',
    description: 'Admin-only: Retrieve all posts awaiting moderation.',
    tags: ['Posts - Admin'],
    security: [{ bearerAuth: [] }],
    responses: {
        200: {
            description: 'List of pending posts',
            content: {
                'application/json': {
                    schema: z.array(GetPostSchema),
                },
            },
        },
        401: {
            description: 'Unauthorized - Authentication required',
        },
        403: {
            description: 'Forbidden - Admin access required',
        },
    },
});
adminRouter.get('/pending',
    postController.getPending.bind(postController)
);

// MODERATE a post (approve or reject)
postRegistry.registerPath({
    method: 'patch',
    path: '/posts/admin/{id}/moderate',
    summary: 'Moderate a post',
    description: 'Admin-only: Approve or reject a pending post.',
    tags: ['Posts - Admin'],
    security: [{ bearerAuth: [] }],
    request: {
        params: IdParamSchema,
        body: {
            content: {
                'application/json': {
                    schema: z.object({
                        status: z.nativeEnum(PostStatus).openapi({
                            description: 'New status for the post',
                            example: PostStatus.APPROVED,
                            enum: [PostStatus.APPROVED, PostStatus.REJECTED],
                        }),
                    }),
                },
            },
        },
    },
    responses: {
        200: {
            description: 'Post moderated successfully',
            content: {
                'application/json': {
                    schema: GetPostSchema,
                },
            },
        },
        400: {
            description: 'Invalid status or post ID',
        },
        401: {
            description: 'Unauthorized - Authentication required',
        },
        403: {
            description: 'Forbidden - Admin access required',
        },
        404: {
            description: 'Post not found',
        },
    },
});
adminRouter.patch('/:id/moderate',
    validateParams(IdParamSchema),
    postController.moderate.bind(postController)
);

// Mount the admin router
router.use('/posts/admin', adminRouter);

export default router;