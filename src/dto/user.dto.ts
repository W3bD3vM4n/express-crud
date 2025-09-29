import { UserRole } from '../entities/user.js';

// DTO for creating a new user
export type CreateUserDto = {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: UserRole;
};

// DTO for updating an existing user
export type UpdateUserDto = Partial<CreateUserDto>;

// DTO for data sent back to the client
export type UserResponseDto = {
    userId: number;
    firstName: string;
    lastName: string;
    email: string;
    role: UserRole;
    createdAt: Date;
};