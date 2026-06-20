import { createServer } from './config/server.js';
import { pool, testConnection } from './config/database.js';
import { AuthController } from './controllers/authController.js';
import { ProjectController } from './controllers/projectController.js';
import { authRoutes } from './routes/authRoutes.js';
import { projectRoutes } from './routes/projectRoutes.js';
import { authMiddleware } from './middleware/auth.js';
import { setupSocket } from './websocket/socketHandler.js';
import dotenv from 'dotenv';

dotenv.config();

const startServer = async () => {
    try {
        // Проверка подключения к БД
        console.log('🔍 Testing database connection...');
        const dbConnected = await testConnection(3);
        
        if (!dbConnected) {
            console.error('❌ Failed to connect to database. Exiting...');
            console.log('💡 Please check your DATABASE_URL and network connectivity');
            process.exit(1);
        }

        // Создание сервера
        const fastify = createServer();

        // Инициализация контроллеров
        const authController = new AuthController(pool);
        const projectController = new ProjectController(pool);

        // Регистрация маршрутов
        fastify.register(authRoutes, {
            authController
        });

        fastify.register(projectRoutes, {
            projectController,
            authMiddleware
        });

        // Настройка WebSocket
        setupSocket(fastify);

        // Запуск сервера
        const port = process.env.PORT || 3000;
        const host = '0.0.0.0';
        
        await fastify.listen({ port, host });
        console.log(`🚀 Server running on http://localhost:${port}`);
        console.log(`📡 WebSocket server ready`);
        console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
        
        return fastify;
    } catch (error) {
        console.error('❌ Failed to start server:', error.message);
        if (error.stack) {
            console.error('Stack:', error.stack);
        }
        process.exit(1);
    }
};

// Обработка ошибок
process.on('unhandledRejection', (error) => {
    console.error('Unhandled Rejection:', error);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n👋 Shutting down gracefully...');
    await pool.end();
    process.exit(0);
});

startServer();