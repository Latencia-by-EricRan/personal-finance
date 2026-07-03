import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { authConfig } from '../../config/auth.config';

export default class AuthService {
    static async verifyCredentials(email: string, password: string): Promise<boolean> {
        if (email !== authConfig.authEmail) return false;
        return bcrypt.compare(password, authConfig.authPasswordHash);
    }

    static signToken(): string {
        return jwt.sign({ sub: authConfig.authEmail }, authConfig.jwtSecret, {
            expiresIn: authConfig.jwtExpiresIn as jwt.SignOptions['expiresIn'],
        });
    }

    static verifyToken(token: string): jwt.JwtPayload | string {
        return jwt.verify(token, authConfig.jwtSecret);
    }
}
