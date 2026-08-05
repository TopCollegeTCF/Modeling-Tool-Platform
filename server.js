import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const fastify = Fastify({ logger: false });
const PORT = 8000;

// Статические файлы
fastify.register(fastifyStatic, { root: __dirname });

// Основные маршруты
fastify.get('/', (_, reply) => {
    reply.sendFile('index.html');
});

// Маршруты API
fastify.get('/api/projects', async (request, reply) => {
    // Заглушка для получения проектов
    return [
        { id: '1', name: 'Project 1', createdAt: new Date() },
        { id: '2', name: 'Project 2', createdAt: new Date() }
    ];
});

fastify.post('/api/projects', async (request, reply) => {
    // Заглушка для создания проекта
    return { id: Date.now().toString(), ...request.body };
});

// WebSocket сервер
const io = new Server(fastify.server);

// Хранилище сессий
const sessions = new Map();
const users = new Map();

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);
    
    // Создание сессии
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
    
    // Присоединение к сессии
    socket.on('joinSession', ({ sessionId, userName }) => {
        if (!sessions.has(sessionId)) {
            socket.emit('error', 'Session not found');
            return;
        }
        
        const session = sessions.get(sessionId);
        socket.join(sessionId);
        socket.sessionId = sessionId;
        
        socket.emit('joinedSession', session);
        io.to(sessionId).emit('userJoined', { userId: socket.id, userName });
    });
    
    // Обновление объектов
    socket.on('objectUpdate', (data) => {
        const sessionId = socket.sessionId;
        if (!sessionId || !sessions.has(sessionId)) return;
        
        const session = sessions.get(sessionId);
        const existing = session.objects.find(obj => obj.id === data.id);
        
        if (existing) {
            Object.assign(existing, data);
        } else {
            session.objects.push(data);
        }
        
        socket.broadcast.to(sessionId).emit('objectUpdate', data);
    });
    
    // Отключение
    socket.on('disconnect', () => {
        const sessionId = socket.sessionId;
        if (sessionId && sessions.has(sessionId)) {
            const session = sessions.get(sessionId);
            session.users.delete(socket.id);
            
            if (session.users.size === 0) {
                sessions.delete(sessionId);
            }
            
            io.to(sessionId).emit('userLeft', socket.id);
        }
    });
});

// Запуск сервера
fastify.listen({ port: PORT, host: '0.0.0.0' }, () => {
    console.log(`Server running http://localhost:${PORT}`);
});