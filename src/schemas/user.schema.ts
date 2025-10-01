import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { UserRole } from '../entities/user.js';

extendZodWithOpenApi(z);

// Login schema
export const LoginSchema = z.object({
    email: z.string().email('Invalid email format').openapi({
        description: 'User email address',
        example: 'john.doe@example.com'
    }),
    password: z.string().min(1, 'Password is required').openapi({
        description: 'User password',
        example: 'SecurePass123!'
    })
}).openapi('LoginRequest');

// Create user schema
export const CreateUserSchema = z.object({
    firstName: z.string().min(1, 'First name is required').max(100).openapi({
        description: 'User first name',
        example: 'John'
    }),
    lastName: z.string().min(1, 'Last name is required').max(100).openapi({
        description: 'User last name',
        example: 'Doe'
    }),
    email: z.string().email('Invalid email format').max(150).openapi({
        description: 'User email address',
        example: 'john.doe@example.com'
    }),
    password: z.string()
        .min(8, 'Password must be at least 8 characters')
        .max(200)
        .openapi({
            description: 'User password (min 8 characters)',
            example: 'SecurePass123!'
        }),
    role: z.nativeEnum(UserRole).openapi({
        description: 'User role',
        example: UserRole.PARTICIPANT
    })
}).openapi('CreateUserRequest');

// Update user schema (all fields optional)
export const UpdateUserSchema = CreateUserSchema.partial().openapi('UpdateUserRequest');

// User response schema
export const UserResponseSchema = z.object({
    userId: z.number().openapi({
        description: 'Auto-generated user ID',
        example: 1
    }),
    firstName: z.string().openapi({ example: 'John' }),
    lastName: z.string().openapi({ example: 'Doe' }),
    email: z.string().email().openapi({ example: 'john.doe@example.com' }),
    role: z.nativeEnum(UserRole).openapi({ example: UserRole.PARTICIPANT }),
    createdAt: z.date().openapi({
        description: 'Account creation date',
        type: 'string',
        format: 'date-time'
    })
}).openapi('UserResponse');

// ID parameter validation
export const IdParamSchema = z.object({
    id: z.string().regex(/^\d+$/, 'ID must be a number').transform(Number)
});

// Type inference
export type LoginInputZod = z.infer<typeof LoginSchema>;
export type CreateUserZod = z.infer<typeof CreateUserSchema>;
export type UpdateUserZod = z.infer<typeof UpdateUserSchema>;
export type UserResponseZod = z.infer<typeof UserResponseSchema>;