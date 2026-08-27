import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const fastify = Fastify({ 
    logger: false,
    // Добавляем это для поддержки DELETE
    ignoreTrailingSlash: true
});

const PORT = 8000;

// Создаем папку projects если её нет
if (!fs.existsSync('./projects')) {
    fs.mkdirSync('./projects');
    console.log('📁 Created projects folder');
}

// Регистрируем статические файлы
fastify.register(fastifyStatic, {
    root: join(__dirname),
    prefix: '/',
});

// Явно обрабатываем favicon
fastify.get('/public/info/favicon.ico', (_, reply) => {
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

// Сохранение проекта
fastify.post('/api/project/save', async (request, reply) => {
    try {
        const { projectName, data, overwrite, currentFilename } = request.body;
        
        if (!fs.existsSync('./projects')) {
            fs.mkdirSync('./projects');
        }
        
        let filename;
        
        if (overwrite && currentFilename) {
            const filepath = `./projects/${currentFilename}`;
            if (fs.existsSync(filepath)) {
                filename = currentFilename;
                console.log(`🔄 Overwriting project: ${filename}`);
            } else {
                const name = projectName || 'untitled';
                filename = `${name}_${Date.now()}.json`;
                console.log(`⚠️ File not found, creating new: ${filename}`);
            }
        } else {
            const name = projectName || 'untitled';
            const existingFiles = fs.readdirSync('./projects')
                .filter(f => f.startsWith(name) && f.endsWith('.json'));
            
            if (existingFiles.length > 0 && !overwrite) {
                filename = `${name}_${Date.now()}.json`;
            } else if (existingFiles.length > 0 && overwrite) {
                filename = existingFiles[0];
            } else {
                filename = `${name}_${Date.now()}.json`;
            }
        }
        
        const filepath = `./projects/${filename}`;
        fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
        
        console.log(`💾 Project saved: ${filepath}`);
        return { 
            success: true, 
            filename: filename,
            name: filename.replace('.json', '').replace(/_\d+$/, '')
        };
    } catch (error) {
        console.error('❌ Error saving project:', error);
        return { success: false, error: error.message };
    }
});

// Загрузка проекта
fastify.get('/api/project/load/:filename', async (request, reply) => {
    try {
        const { filename } = request.params;
        const decodedFilename = decodeURIComponent(filename);
        const filepath = `./projects/${decodedFilename}`;
        
        if (!fs.existsSync(filepath)) {
            return reply.status(404).send({ error: 'File not found' });
        }
        
        const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
        return { success: true, data };
    } catch (error) {
        console.error('❌ Error loading project:', error);
        return { success: false, error: error.message };
    }
});

// ⭐ УДАЛЕНИЕ ПРОЕКТА - РЕГИСТРИРУЕМ КАК ОТДЕЛЬНЫЙ МАРШРУТ
fastify.route({
    method: 'DELETE',
    url: '/api/project/delete/:filename',
    handler: async (request, reply) => {
        try {
            const { filename } = request.params;
            const decodedFilename = decodeURIComponent(filename);
            const filepath = `./projects/${decodedFilename}`;
            
            console.log(`🗑️ DELETE request received for: ${decodedFilename}`);
            console.log(`📁 Full path: ${filepath}`);
            
            if (!fs.existsSync(filepath)) {
                console.log(`❌ File not found: ${filepath}`);
                const files = fs.existsSync('./projects') ? fs.readdirSync('./projects') : [];
                console.log(`📁 Available files: ${files.join(', ')}`);
                
                return reply.status(404).send({ 
                    success: false, 
                    error: `File "${decodedFilename}" not found`,
                    availableFiles: files
                });
            }
            
            fs.unlinkSync(filepath);
            console.log(`✅ Project deleted: ${filepath}`);
            
            return reply.send({ success: true, filename: decodedFilename });
        } catch (error) {
            console.error('❌ Error deleting project:', error);
            return reply.status(500).send({ 
                success: false, 
                error: error.message 
            });
        }
    }
});

// Список проектов
fastify.get('/api/projects', async (_, reply) => {
    try {
        if (!fs.existsSync('./projects')) {
            return { projects: [] };
        }
        
        const files = fs.readdirSync('./projects');
        const projects = files
            .filter(f => f.endsWith('.json'))
            .map(f => ({
                filename: f,
                name: f.replace('.json', '').replace(/_\d+$/, ''),
                size: fs.statSync(`./projects/${f}`).size,
                modified: fs.statSync(`./projects/${f}`).mtime
            }));
        
        return { success: true, projects };
    } catch (error) {
        console.error('❌ Error listing projects:', error);
        return { success: false, error: error.message };
    }
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
    console.log(`📁 Projects folder: ${join(__dirname, 'projects')}`);
});