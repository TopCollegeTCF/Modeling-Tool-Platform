import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

export const setupSocket = (fastify) => {
    const io = new Server(fastify.server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST']
        }
    });

    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error('Authentication error'));
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.userId = decoded.id;
            next();
        } catch (err) {
            next(new Error('Invalid token'));
        }
    });

    io.on('connection', (socket) => {
        console.log(`User ${socket.userId} connected`);

        // Присоединение к комнате проекта
        socket.on('join-project', (projectId) => {
            socket.join(`project-${projectId}`);
            console.log(`User ${socket.userId} joined project ${projectId}`);
        });

        // Получение обновлений сцены
        socket.on('scene-update', (data) => {
            const { projectId, sceneData } = data;
            // Сохраняем в базу данных через сервис
            // И отправляем всем в комнате
            socket.to(`project-${projectId}`).emit('scene-updated', {
                userId: socket.userId,
                sceneData
            });
        });

        // Получение действий пользователя
        socket.on('editor-action', (data) => {
            const { projectId, action } = data;
            socket.to(`project-${projectId}`).emit('action-performed', {
                userId: socket.userId,
                action
            });
        });

        socket.on('disconnect', () => {
            console.log(`User ${socket.userId} disconnected`);
        });
    });

    return io;
};