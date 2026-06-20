import pg from 'pg';
import bcrypt from 'bcrypt';

export class User {
    constructor(pool) {
        this.pool = pool;
    }

    async findByEmail(email) {
        const result = await this.pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );
        return result.rows[0] || null;
    }

    async findById(id) {
        const result = await this.pool.query(
            'SELECT id, username, email, created_at FROM users WHERE id = $1',
            [id]
        );
        return result.rows[0] || null;
    }

    async create(username, email, password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await this.pool.query(
            'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email, created_at',
            [username, email, hashedPassword]
        );
        return result.rows[0];
    }

    async validatePassword(user, password) {
        return bcrypt.compare(password, user.password_hash);
    }
}