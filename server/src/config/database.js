import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Дополнительные настройки для подключения к удаленной БД
const sslConfig = process.env.NODE_ENV === 'production' 
    ? { rejectUnauthorized: false } 
    : false;

export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000, // Увеличиваем таймаут для удаленного подключения
    ssl: sslConfig,
});

// Проверка подключения с повторными попытками
export const testConnection = async (retries = 3) => {
    for (let i = 0; i < retries; i++) {
        try {
            const client = await pool.connect();
            console.log(`✅ Database connected successfully (attempt ${i + 1})`);
            client.release();
            return true;
        } catch (err) {
            console.error(`❌ Database connection failed (attempt ${i + 1}):`, err.message);
            if (i < retries - 1) {
                console.log(`⏳ Retrying in 2 seconds...`);
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }
    }
    return false;
};