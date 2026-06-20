import { AuthService } from '../services/authService.js';

export class AuthController {
    constructor(pool) {
        this.authService = new AuthService(pool);
    }

    register = async (request, reply) => {
        try {
            const { username, email, password } = request.body;
            
            if (!username || !email || !password) {
                return reply.code(400).send({ error: 'All fields are required' });
            }

            const result = await this.authService.register(username, email, password);
            return reply.code(201).send(result);
        } catch (error) {
            return reply.code(400).send({ error: error.message });
        }
    };

    login = async (request, reply) => {
        try {
            const { email, password } = request.body;
            
            if (!email || !password) {
                return reply.code(400).send({ error: 'Email and password are required' });
            }

            const result = await this.authService.login(email, password);
            return reply.code(200).send(result);
        } catch (error) {
            return reply.code(401).send({ error: error.message });
        }
    };
}