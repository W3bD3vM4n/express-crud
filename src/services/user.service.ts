import { AppDataSource } from '../data-source.js';
import { User } from '../entities/user.js';
import { CreateUserDto, UpdateUserDto, UserResponseDto } from '../dto/user.dto.js';

const userRepository = AppDataSource.getRepository(User);

// Helper function to convert User entity to UserResponse
const toUserResponseDto = (user: User): UserResponseDto => {
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
    async getAllFromRepository(): Promise<UserResponseDto[]> {
        const users = await userRepository.find();
        return users.map(toUserResponseDto);
    }

    async getByIdFromRepository(id: number): Promise<UserResponseDto | null> {
        const user = await userRepository.findOneBy({ userId: id });
        if (user) {
            return toUserResponseDto(user);
        }
        return null;
    }

    async createFromRepository(create: CreateUserDto): Promise<UserResponseDto> {
        const user = new User();
        user.firstName = create.firstName;
        user.lastName = create.lastName;
        user.email = create.email;
        user.password = create.password;
        user.role = create.role;

        const newUser = await userRepository.save(user);
        return toUserResponseDto(newUser);
    }


    // Security: Basic Auth & JSON Web Tokens (JWT)
    async findByEmail(email: string): Promise<User | null> {
        return userRepository.findOne({ where: { email } });
    }


    async updateFromRepository(id: number, update: UpdateUserDto): Promise<UserResponseDto | null> {
        const user = await userRepository.findOneBy({ userId: id });
        if (!user) return null;

        Object.assign(user, update);
        const updatedUser = await userRepository.save(user);
        return toUserResponseDto(updatedUser);
    }

    async deleteFromRepository(id: number) {
        const result = await userRepository.delete(id);
        return result;
    }
}