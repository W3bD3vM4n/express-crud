import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const jwtAuth = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Authorization token is required' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token || '', process.env.JWT_SECRET!);
        next();
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).json({ message: 'Token has expired' });
        }
        return res.status(401).json({ message: 'Invalid token' });
    }
};
