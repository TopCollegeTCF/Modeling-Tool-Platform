import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const fastify = Fastify({ logger: false });
const PORT = 8000;

// Регистрируем статические файлы - ИСПРАВЛЕНО
fastify.register(fastifyStatic, {
    root: join(__dirname),
    prefix: '/',
});

// Явно обрабатываем favicon
fastify.get('/public/icons/favicon.ico', (_, reply) => {
    reply.status(204).send();
});

// Главная страница
fastify.get('/', (_, reply) => {
    reply.sendFile('index.html');
});

// ЯВНЫЙ МАРШРУТ для файлов из папки src
fastify.get('/src/*', (request, reply) => {
    const filePath = request.params['*'];
    reply.sendFile(filePath, join(__dirname, 'src'));
});

// ЯВНЫЙ МАРШРУТ для node_modules
fastify.get('/node_modules/*', (request, reply) => {
    const filePath = request.params['*'];
    reply.sendFile(filePath, join(__dirname, 'node_modules'));
});

// WebSocket сервер
const io = new Server(fastify.server);
const sessions = new Map();

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);
    
    socket.on('createSession', ({ sessionName, userName }) => {
        const sessionId = `session_${Date.now()}`;
        sessions.set(sessionId, {
            id: sessionId,
            name: sessionName,
            users: new Map(),
            objects: []
        });
        
        socket.join(sessionId);
        socket.sessionId = sessionId;
        
        socket.emit('sessionCreated', { sessionId });
        io.to(sessionId).emit('sessionUpdate', sessions.get(sessionId));
    });
    
    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});

// Запуск сервера
fastify.listen({ port: PORT, host: '0.0.0.0' }, (err) => {
    if (err) {
        console.error('❌ Error starting server:', err);
        process.exit(1);
    }
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    console.log(`📡 WebSocket server ready`);
});