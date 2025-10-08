import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../entities/user.js';

export const authorize = (requiredRole: UserRole) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = req.user;

        if (!user || user.role !== requiredRole) {
            return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
        }

        next();
    };
};