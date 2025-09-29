import { Request, Response } from 'express';
import { UserService } from '../services/user.service.js';
import * as bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const userService = new UserService();

// Helper function to parse and validate ID parameter
const parseIdParam = (idParam: string | undefined): { id: number; error?: string } => {
    if (!idParam) {
        return { id: 0, error: 'User ID is required' };
    }

    const id = parseInt(idParam, 10);
    if (isNaN(id)) {
        return { id: 0, error: 'Invalid user ID format' };
    }

    return { id };
};

export class UserController {
    async getAllUsers(req: Request, res: Response) {
        try {
            const users = await userService.getAllFromRepository();
            res.status(200).json(users);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching users', error })
        }
    }

    async getUserById(req: Request, res: Response) {
        try {
            const { id, error } = parseIdParam(req.params.id);
            if (error) {
                return res.status(400).json({ message: error });
            }

            const user = await userService.getByIdFromRepository(id);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            res.status(200).json(user);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching user', error });
        }
    }

    async createUser(req: Request, res: Response) {
        try {
            const newUser = await userService.createFromRepository(req.body);
            res.status(201).json(newUser);
        } catch (error) {
            res.status(400).json({ message: 'Error creating user', error });
        }
    }

    async updateUser(req: Request, res: Response) {
        try {
            const { id, error } = parseIdParam(req.params.id);
            if (error) {
                return res.status(400).json({ message: error });
            }

            const updatedUser = await userService.updateFromRepository(id, req.body);
            if (!updatedUser) {
                return res.status(404).json({ message: 'User not found' });
            }

            res.status(200).json(updatedUser);
        } catch (error) {
            res.status(500).json({ message: 'Error updating user', error });
        }
    }

    async deleteUser(req: Request, res: Response) {
        try {
            const { id, error } = parseIdParam(req.params.id);
            if (error) {
                return res.status(400).json({ message: error });
            }

            await userService.deleteFromRepository(id);
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ message: 'Error deleting user', error });
        }
    }


    // Security: JSON Web Tokens (JWT)
    async login(req: Request, res: Response) {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        try {
            // We can reuse the findByEmail logic
            const user = await userService.findByEmail(email);

            if (!user || !(await bcrypt.compare(password, user.password))) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            // Create JWT Payload
            const payload = { userId: user.userId, email: user.email };

            // Sign the token
            const token = jwt.sign(
                payload,
                process.env.JWT_SECRET!, // The '!' asserts that this value is not undefined
                { expiresIn: '1h' } // Token expires in 1 hour
            );

            res.status(200).json({ message: 'Login successful', token: token });

        } catch (error) {
            res.status(500).json({ message: 'Internal server error during login' });
        }
    }

}