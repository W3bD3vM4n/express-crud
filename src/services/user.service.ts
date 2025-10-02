import { AppDataSource } from '../data-source.js'; // Database connection using TypeORM
import { User } from '../entities/user.js';
import { CreateUserZod, UpdateUserZod, UserResponseZod } from '../schemas/user.schema.js';

const userRepository = AppDataSource.getRepository(User);

/**
 * Helper function to convert a database User entity to the public-facing UserResponse type.
 * This is crucial for hiding sensitive data like the password.
 * @param user The User entity from the database.
 * @returns An object matching the UserResponse Zod schema.
 */
const toUserResponse = (user: User): UserResponseZod => {
    return {
        userId: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt,
    };
};

export class UserService {
    // The return type is now an array of the Zod 'UserResponse' type
    async getAllFromRepository(): Promise<UserResponseZod[]> {
        const users = await userRepository.find();
        return users.map(toUserResponse);
    }

    // The return type is now the Zod 'UserResponse' type
    async getByIdFromRepository(id: number): Promise<UserResponseZod | null> {
        const user = await userRepository.findOneBy({ userId: id });
        if (user) {
            return toUserResponse(user);
        }
        return null;
    }

    // The input 'create' parameter now uses the Zod 'CreateUserInput' type
    async createFromRepository(create: CreateUserZod): Promise<UserResponseZod> {
        const user = userRepository.create(create); // .create() is a safe way to map input to an entity

        const newUser = await userRepository.save(user);
        return toUserResponse(newUser);
    }


    // Security: Basic Auth & JSON Web Tokens (JWT)
    async findByEmail(email: string): Promise<User | null> {
        return userRepository.findOne({ where: { email } });
    }


    // The input 'update' parameter now uses the Zod 'UpdateUserInput' type
    async updateFromRepository(id: number, update: UpdateUserZod): Promise<UserResponseZod | null> {
        const user = await userRepository.findOneBy({ userId: id });
        if (!user) return null;

        // Merge the updates into the existing user entity
        Object.assign(user, update);

        const updatedUser = await userRepository.save(user);
        return toUserResponse(updatedUser);
    }

    async deleteFromRepository(id: number) {
        const result = await userRepository.delete(id);
        return result;
    }
}