import { AppDataSource } from '../data-source.js';
import { User, UserRole } from '../entities/User.js';

// DTO for creating users
type UserCreatePayload = {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: UserRole;
};

// DTO for returning users (without password and methods)
type UserResponse = {
    userId: number;
    firstName: string;
    lastName: string;
    email: string;
    role: UserRole;
    createdAt: Date;
};

const userRepository = AppDataSource.getRepository(User);

// Helper function to convert User entity to UserResponse
const toUserResponse = (user: User): UserResponse => {
    return {
        userId: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
    };
};

export class UserService {
    async getAll(): Promise<UserResponse[]> {
        const users = await userRepository.find();
        return users.map(toUserResponse);
    }

    async getById(id: number): Promise<UserResponse | null> {
        const user = await userRepository.findOneBy({ userId: id });
        if (user) {
            return toUserResponse(user);
        }
        return null;
    }

    async create(payload: UserCreatePayload): Promise<UserResponse> {
        const user = new User();
        user.firstName = payload.firstName;
        user.lastName = payload.lastName;
        user.email = payload.email;
        user.password = payload.password;
        user.role = payload.role;

        const newUser = await userRepository.save(user);
        return toUserResponse(newUser);
    }

    async update(id: number, payload: Partial<UserCreatePayload>): Promise<UserResponse | null> {
        const user = await userRepository.findOneBy({ userId: id });
        if (!user) return null;

        Object.assign(user, payload);
        const updatedUser = await userRepository.save(user);
        return toUserResponse(updatedUser);
    }

    async delete(id: number) {
        const result = await userRepository.delete(id);
        return result;
    }
}