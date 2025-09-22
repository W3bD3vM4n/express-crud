import { Request, Response } from 'express';
import { UserService } from '../services/UserService.js';

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
            const users = await userService.getAll();
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

            const user = await userService.getById(id);
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
            const newUser = await userService.create(req.body);
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

            const updatedUser = await userService.update(id, req.body);
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

            await userService.delete(id);
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ message: 'Error deleting user', error });
        }
    }
}