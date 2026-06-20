import { pool, testConnection } from './database.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const runMigrations = async () => {
    try {
        console.log('🔍 Checking database connection...');
        console.log(`📡 Connecting to: ${process.env.DATABASE_URL?.replace(/:[^:@]*@/, ':***@')}`);
        
        const connected = await testConnection(5); // 5 попыток
        if (!connected) {
            console.error('❌ Cannot connect to database after multiple attempts');
            console.log('💡 Check your DATABASE_URL and ensure the database is accessible');
            process.exit(1);
        }

        console.log('📝 Running migrations...');
        
        // Проверяем существование файла схемы
        const schemaPath = join(__dirname, '../../../database/schema.sql');
        const sql = readFileSync(schemaPath, 'utf8');
        
        // Разбиваем на отдельные запросы, игнорируя пустые строки
        const statements = sql
            .split(';')
            .filter(stmt => stmt.trim().length > 0)
            .map(stmt => stmt.trim());
        
        console.log(`📄 Found ${statements.length} SQL statements`);
        
        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
            try {
                await pool.query(statement);
                console.log(`✅ Executed statement ${i + 1}/${statements.length}`);
            } catch (err) {
                // Если таблица уже существует, игнорируем ошибку
                if (err.message.includes('already exists')) {
                    console.log(`⏭️ Skipping already existing table/trigger (${i + 1})`);
                    continue;
                }
                throw err;
            }
        }
        
        console.log('✅ Migrations completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        if (error.stack) {
            console.error('Stack:', error.stack);
        }
        process.exit(1);
    }
};

runMigrations();