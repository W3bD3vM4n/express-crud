import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '../entities/user.js';

/*
* JWT: I need to log in to the login endpoint (User)
* to obtain a token (encrypted string), and enter it in the
* top right button labeled `Authorization` in order to
* enable the Update/Delete endpoints.
* */

export const jwtAuth = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Authorization token is required' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token || '', process.env.JWT_SECRET!);
        req.user = decoded as { userId: number; email: string; role: UserRole };
        next();
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).json({ message: 'Token has expired' });
        }
        return res.status(401).json({ message: 'Invalid token' });
    }
};
