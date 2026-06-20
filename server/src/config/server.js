import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import fastifyCors from '@fastify/cors';
import fastifyWebsocket from '@fastify/websocket';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const createServer = () => {
    const fastify = Fastify({
        logger: true,
        bodyLimit: 10485760, // 10MB
    });

    // Регистрация плагинов
    fastify.register(fastifyCors, {
        origin: process.env.NODE_ENV === 'production' 
            ? ['https://your-app.onrender.com']
            : '*',
        credentials: true,
    });

    fastify.register(fastifyWebsocket);

    // Статические файлы
    fastify.register(fastifyStatic, {
        root: join(__dirname, '../../public'),
        prefix: '/public/',
    });

    // Корневой путь для отдачи HTML
    fastify.get('/', async (request, reply) => {
        return reply.sendFile('index.html');
    });

    return fastify;
};