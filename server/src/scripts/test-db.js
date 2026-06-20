import { pool, testConnection } from '../config/database.js';
import dotenv from 'dotenv';

dotenv.config();

const testDB = async () => {
    console.log('🔍 Testing database connection...');
    console.log(`📡 Connection string: ${process.env.DATABASE_URL?.replace(/:[^:@]*@/, ':***@')}`);
    
    const connected = await testConnection(3);
    if (connected) {
        console.log('✅ Connection successful!');
        
        // Проверяем, есть ли таблицы
        try {
            const result = await pool.query(`
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public'
            `);
            console.log('📋 Existing tables:', result.rows.map(r => r.table_name).join(', ') || 'none');
        } catch (err) {
            console.log('⚠️ Could not list tables:', err.message);
        }
    } else {
        console.log('❌ Connection failed');
    }
    
    await pool.end();
};

testDB();