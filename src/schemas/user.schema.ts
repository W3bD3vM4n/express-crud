import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { UserRole, UserStatus } from '../entities/user.js';

extendZodWithOpenApi(z);

// ID parameter validation
export const IdParamSchema = z.object({
    id: z.string().regex(/^\d+$/, 'ID must be a number').transform(Number)
});

// 1. Base Schema: Mirrors the table `User`
export const UserSchema = z.object({
    userId: z.number().openapi({
        description: 'Auto-generated user ID',
        example: 1
    }),
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
        .min(6, 'Password must be at least 6 characters')
        .max(200)
        .openapi({
            description: 'User password (min 6 characters)',
            example: 'SecurePass123!'
        }),
    role: z.nativeEnum(UserRole).openapi({
        description: 'User role',
        example: UserRole.USER
    }),
    status: z.nativeEnum(UserStatus).openapi({
        description: 'User status',
        example: UserStatus.ACTIVE
    }),
    createdAt: z.date().openapi({
        description: 'Account creation date',
        type: 'string',
        format: 'date-time'
    })
});

// 2. Schema: Login (Input)
export const LoginSchema = UserSchema.pick({
    email: true,
    password: true,
}).openapi('LoginRequest');

// 3. Schema: Create User (Input)
// Derived from the Base Schema, excluding auto-generated fields
export const CreateUserSchema = UserSchema.pick({
    firstName: true,
    lastName: true,
    email: true,
    password: true,
    role: true,
    status: true,
}).openapi('CreateUserRequest');

// 4. Schema: Read User (Output)
// Excludes password from response
export const GetUserSchema = UserSchema.omit({
    password: true,
}).openapi('UserResponse');

// 5. Schema: Update User (Input)
// Fields are made optional because a user might only want to update some
export const UpdateUserSchema = CreateUserSchema.partial().openapi('UpdateUserRequest');

// 6. Type Inference for TypeScript
export type LoginInputZod = z.infer<typeof LoginSchema>;
export type CreateUserZod = z.infer<typeof CreateUserSchema>;
export type GetUserZod = z.infer<typeof GetUserSchema>;
export type UpdateUserZod = z.infer<typeof UpdateUserSchema>;