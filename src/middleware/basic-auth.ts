import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service.js';
import bcrypt from 'bcrypt';

/*
* Basic Auth: displays a (temporary) login pop-up in the browser's
* address bar, and an open padlock icon (until the email/password is entered).
* To make it permanent, enter the credentials in the
* "Authorization" button in the upper right corner to
* enable the Update/Delete Endpoints.
* */

const userService = new UserService();

export const basicAuth = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    // 1. Check if the Authorization header exists
    if (!authHeader) {
        res.setHeader('WWW-Authenticate', 'Basic');
        return res.status(401).json({ message: 'Authorization header is required' });
    }

    // 2. Check if the scheme is "Basic"
    const [scheme, credentials] = authHeader.split(' ');
    if (scheme !== 'Basic' || !credentials) {
        res.setHeader('WWW-Authenticate', 'Basic');
        return res.status(401).json({ message: 'Malformed Authorization header. Must be "Basic <credentials>"' });
    }

    // 3. Decode the Base64 credentials
    const decoded = Buffer.from(credentials, 'base64').toString('utf8');
    const [email, password] = decoded.split(':');

    if (!email || !password) {
        return res.status(401).json({ message: 'Invalid credentials format' });
    }

    try {
        // 4. Validate the credentials against the database
        const user = await userService.findByEmail(email);

        if (!user) {
            return res.status(401).json({ message: 'Authentication failed: Invalid credentials' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Authentication failed: Invalid credentials' });
        }

        // 5. If everything is valid, proceed to the next middleware or route handler
        next();

    } catch (error) {
        return res.status(500).json({ message: 'Internal server error during authentication' });
    }
};