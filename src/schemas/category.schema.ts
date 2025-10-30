import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

// ID parameter validation
export const IdParamSchema = z.object({
    id: z.string().regex(/^\d+$/, 'ID must be a number').transform(Number)
});

// 1. Base Schema: Mirrors the table `Category`
export const CategorySchema = z.object({
    categoryId: z.number().openapi({
        description: 'Auto-generated category ID',
        example: 1,
    }),
    name: z.string().min(1, 'Name is required').max(50).openapi({
        description: 'The name of the category',
        example: 'exchange',
    }),
    description: z.string().nullable().optional().openapi({
        description: 'A brief description of the category',
        example: 'Buy and sell university textbooks.',
    }),
});

// 2. Schema: Create Category (Input)
export const CreateCategorySchema = CategorySchema.pick({
    name: true,
    description: true,
}).openapi('CreateCategoryRequest');

// 3. Schema: Read Category (Output)
export const GetCategorySchema = CategorySchema.openapi('CategoryResponse');

// 4. Schema: Update Category (Input)
// Fields are made optional because a user might only want to update some
export const UpdateCategorySchema = CreateCategorySchema.partial().openapi('UpdateCategoryRequest');

// 5. Type Inference for TypeScript
export type CreateCategoryZod = z.infer<typeof CreateCategorySchema>;
export type GetCategoryZod = z.infer<typeof GetCategorySchema>;
export type UpdateCategoryZod = z.infer<typeof UpdateCategorySchema>;