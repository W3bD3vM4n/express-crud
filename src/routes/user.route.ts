import { Router } from 'express';
import { UserController } from '../controllers/user.controller.js';
// import { basicAuth } from '../middleware/auth.js';
import { jwtAuth } from '../middleware/jwt-auth.js';
import { validate, validateParams } from '../middleware/validate.js';
import {
    CreateUserSchema,
    UpdateUserSchema,
    LoginSchema,
    IdParamSchema,
    UserResponseSchema,
} from '../schemas/user.schema.js';

// Import the OpenAPI Registry
import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

// Create a registry for this module
export const userRegistry = new OpenAPIRegistry();

// Register your schemas
userRegistry.register('CreateUserRequest', CreateUserSchema);
userRegistry.register('UpdateUserRequest', UpdateUserSchema);
userRegistry.register('LoginRequest', LoginSchema);
userRegistry.register('UserResponse', UserResponseSchema);

const router = Router();
const userController = new UserController();

// DEFINE ROUTES AND DOCUMENTATION

// Public routes (no auth required)
// READ
userRegistry.registerPath({
    method: 'get',
    path: '/users',
    summary: 'Get all users',
    tags: ['Users'],
    responses: {
        200: {
            description: 'List of all users',
            content: {
                'application/json': {
                    schema: z.array(UserResponseSchema),
                },
            },
        },
    },
});
router.get('/users', userController.getAllUsers.bind(userController));

userRegistry.registerPath({
    method: 'get',
    path: '/users/{id}',
    summary: 'Get a single user by ID',
    tags: ['Users'],
    request: {
        params: IdParamSchema,
    },
    responses: {
        200: {
            description: 'User data',
            content: {
                'application/json': {
                    schema: UserResponseSchema,
                },
            },
        },
        404: {
            description: 'User not found',
        },
    },
});
router.get('/users/:id',
    validateParams(IdParamSchema),
    userController.getUserById.bind(userController)
);

// CREATE
userRegistry.registerPath({
    method: 'post',
    path: '/users',
    summary: 'Create a new user',
    tags: ['Users'],
    request: {
        body: {
            content: {
                'application/json': {
                    schema: CreateUserSchema,
                },
            },
        },
    },
    responses: {
        201: {
            description: 'User created successfully',
            content: {
                'application/json': {
                    schema: UserResponseSchema,
                },
            },
        },
    },
});
router.post('/users',
    validate(CreateUserSchema),
    userController.createUser.bind(userController)
);

// Security: JSON Web Tokens (JWT)
userRegistry.registerPath({
    method: 'post',
    path: '/users/login',
    summary: 'User login',
    tags: ['Users'],
    request: {
        body: {
            content: {
                'application/json': {
                    schema: LoginSchema,
                },
            },
        },
    },
    responses: {
        200: {
            description: 'Login successfully',
            content: {
                'application/json': {
                    schema: z.object({
                        message: z.string(),
                        token: z.string(),
                    }),
                },
            },
        },
    },
});
router.post('/users/login',
    validate(LoginSchema),
    userController.login.bind(userController)
);

// Protected routes (auth required)
// UPDATE
userRegistry.registerPath({
    method: 'put',
    path: '/users/{id}',
    summary: 'Update a user',
    tags: ['Users'],
    security: [{ bearerAuth: [] }], // This marks the route as protected
    request: {
        params: IdParamSchema,
        body: {
            content: {
                'application/json': {
                    schema: UpdateUserSchema,
                },
            },
        },
    },
    responses: {
        200: {
            description: 'User updated successfully',
            content: {
                'application/json': {
                    schema: UserResponseSchema,
                },
            },
        },
        401: {
            description: 'Unauthorized',
        },
        404: {
            description: 'User not found',
        },
    },
});
// router.put('/users/:id', userController.updateUser.bind(userController));
// router.put('/users/:id', basicAuth, userController.updateUser.bind(userController));
router.put('/users/:id',
    jwtAuth,
    validateParams(IdParamSchema),
    validate(UpdateUserSchema),
    userController.updateUser.bind(userController)
);

//DELETE
userRegistry.registerPath({
    method: 'delete',
    path: '/users/{id}',
    summary: 'Delete a user',
    tags: ['Users'],
    security: [{ bearerAuth: [] }],
    request: {
        params: IdParamSchema,
    },
    responses: {
        204: {
            description: 'User deleted successfully',
        },
        401: {
            description: 'Unauthorized',
        },
        404: {
            description: 'User not found',
        },
    },
});
// router.delete('/users/:id', userController.deleteUser.bind(userController));
// router.delete('/users/:id', basicAuth, userController.deleteUser.bind(userController));
router.delete('/users/:id',
    jwtAuth,
    validateParams(IdParamSchema),
    userController.deleteUser.bind(userController)
);

export default router;