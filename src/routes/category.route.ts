import { Router } from 'express';
import { CategoryController } from '../controllers/category.controller.js';
import { jwtAuth } from '../middleware/jwt-auth.js';
import { authorize } from '../middleware/authorize.js';
import {validate, validateParams} from '../middleware/validate.js';
import { UserRole } from '../entities/user.js';
import {
    CreateCategorySchema,
    GetCategorySchema,
    UpdateCategorySchema,
    IdParamSchema
} from '../schemas/category.schema.js';

// 1. Import the OpenAPI Registry
import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

// 2. Create a registry for this module
export const categoryRegistry = new OpenAPIRegistry();

// 3. Register the schemas (OpenAPI Documentation)
categoryRegistry.register('CreateCategoryRequest', CreateCategorySchema);
categoryRegistry.register('GetCategoryResponse', GetCategorySchema);
categoryRegistry.register('UpdateCategoryRequest', UpdateCategorySchema);

// The entire router uses the authorize middleware
// to ensure only admins can access these endpoints
const router = Router();
const categoryController = new CategoryController();

// 4. Define routes and documentation

// 4.1 Public routes (no auth required)
// READ
categoryRegistry.registerPath({
    method: 'get',
    path: '/categories',
    summary: 'Get all categories',
    tags: ['Categories'],
    responses: {
        200: {
            description: 'List of all categories',
            content: {
                'application/json': {
                    schema: z.array(GetCategorySchema),
                },
            },
        },
    },
});
router.get('/categories',
    categoryController.getAllCategories.bind(categoryController)
);

categoryRegistry.registerPath({
    method: 'get',
    path: '/categories/{id}',
    summary: 'Get a single category by ID',
    tags: ['Categories'],
    request: {
        params: IdParamSchema,
    },
    responses: {
        200: {
            description: 'Category data',
            content: {
                'application/json': {
                    schema: GetCategorySchema,
                },
            },
        },
        400: {
            description: 'Invalid ID format',
        },
        404: {
            description: 'Category not found',
        },
    },
});
router.get('/categories/:id',
    validateParams(IdParamSchema),
    categoryController.getCategoryById.bind(categoryController)
);


// 4.2 Protected routes (auth required)

// Apply authentication and authorization middleware
// to all routes below this point
router.use(jwtAuth, authorize(UserRole.ADMIN));

// CREATE
categoryRegistry.registerPath({
    method: 'post',
    path: '/categories',
    summary: 'Create a new category',
    tags: ['Categories'],
    security: [{ bearerAuth: [] }],
    request: {
        body: {
            content: {
                'application/json': {
                    schema: CreateCategorySchema,
                },
            },
        },
    },
    responses: {
        201: {
            description: 'Category created successfully',
            content: {
                'application/json': {
                    schema: GetCategorySchema,
                },
            },
        },
        400: {
            description: 'Invalid request data',
        },
        401: {
            description: 'Unauthorized - Authentication required',
        },
        403: {
            description: 'Forbidden - Admin access required',
        },
        409: {
            description: 'Conflict - Category with this name already exists',
        },
    },
});
router.post('/categories',
    validate(CreateCategorySchema),
    categoryController.createCategory.bind(categoryController)
);

// UPDATE
categoryRegistry.registerPath({
    method: 'put',
    path: '/categories/{id}',
    summary: 'Update a category',
    tags: ['Categories'],
    security: [{ bearerAuth: [] }],
    request: {
        params: IdParamSchema,
        body: {
            content: {
                'application/json': {
                    schema: UpdateCategorySchema,
                },
            },
        },
    },
    responses: {
        200: {
            description: 'Category updated successfully',
            content: {
                'application/json': {
                    schema: GetCategorySchema,
                },
            },
        },
        400: {
            description: 'Invalid request data',
        },
        401: {
            description: 'Unauthorized - Authentication required',
        },
        403: {
            description: 'Forbidden - Admin access required',
        },
        404: {
            description: 'Category not found',
        },
        409: {
            description: 'Conflict - Another category with this name already exists',
        },
    },
});
router.put('/categories/:id',
    validateParams(IdParamSchema),
    validate(UpdateCategorySchema),
    categoryController.updateCategory.bind(categoryController)
);

// DELETE
categoryRegistry.registerPath({
    method: 'delete',
    path: '/categories/{id}',
    summary: 'Delete a category',
    tags: ['Categories'],
    security: [{ bearerAuth: [] }],
    request: {
        params: IdParamSchema,
    },
    responses: {
        204: {
            description: 'Category deleted successfully',
        },
        400: {
            description: 'Invalid ID format',
        },
        401: {
            description: 'Unauthorized - Authentication required',
        },
        403: {
            description: 'Forbidden - Admin access required',
        },
        404: {
            description: 'Category not found',
        },
    },
});
router.delete('/categories/:id',
    validateParams(IdParamSchema),
    categoryController.deleteCategory.bind(categoryController)
);

export default router;