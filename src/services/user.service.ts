import { AppDataSource } from '../data-source.js'; // Database connection using TypeORM
import { User } from '../entities/user.js';
import { CreateUserZod, UpdateUserZod, GetUserZod } from '../schemas/user.schema.js';

const userRepository = AppDataSource.getRepository(User);

// Convert the Entity to the UserResponse type
const toUserResponse = (user: User): GetUserZod => {
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
    // LOGIN
    // Security: Basic Auth & JSON Web Tokens (JWT)
    async findByEmail(email: string): Promise<User | null> {
        return userRepository.findOne({ where: { email } });
    }

    // CREATE
    async createFromRepository(create: CreateUserZod): Promise<GetUserZod> {
        const user = userRepository.create(create); // .create() is a safe way to map input to an entity

        const newUser = await userRepository.save(user);
        return toUserResponse(newUser);
    }

    // READ
    async getAllFromRepository(): Promise<GetUserZod[]> {
        const users = await userRepository.find();
        return users.map(toUserResponse);
    }

    async getByIdFromRepository(id: number): Promise<GetUserZod | null> {
        const user = await userRepository.findOneBy({ userId: id });
        if (user) {
            return toUserResponse(user);
        }
        return null;
    }

    // UPDATE
    async updateFromRepository(id: number, update: UpdateUserZod): Promise<GetUserZod | null> {
        const user = await userRepository.findOneBy({ userId: id });
        if (!user) return null;

        // Merge the updates into the existing user entity
        Object.assign(user, update);

        const updatedUser = await userRepository.save(user);
        return toUserResponse(updatedUser);
    }

    // DELETE
    async deleteFromRepository(id: number) {
        const result = await userRepository.delete(id);
        return result;
    }
}