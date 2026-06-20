import { User } from '../models/User.js';
import { generateToken } from '../middleware/auth.js';

export class AuthService {
    constructor(pool) {
        this.userModel = new User(pool);
    }

    async register(username, email, password) {
        // Проверка существования пользователя
        const existingUser = await this.userModel.findByEmail(email);
        if (existingUser) {
            throw new Error('User already exists');
        }

        const user = await this.userModel.create(username, email, password);
        const token = generateToken(user);
        
        return { user, token };
    }

    async login(email, password) {
        const user = await this.userModel.findByEmail(email);
        if (!user) {
            throw new Error('Invalid credentials');
        }

        const isValid = await this.userModel.validatePassword(user, password);
        if (!isValid) {
            throw new Error('Invalid credentials');
        }

        const token = generateToken(user);
        const { password_hash, ...userWithoutPassword } = user;
        
        return { user: userWithoutPassword, token };
    }
}