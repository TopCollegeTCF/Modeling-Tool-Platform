import { io } from 'socket.io-client';

export class SocketManager {
    constructor(token) {
        this.socket = io(window.location.origin, {
            auth: { token }
        });
        this.listeners = {};
        
        this.socket.on('connect', () => {
            console.log('Socket connected');
        });

        this.socket.on('disconnect', () => {
            console.log('Socket disconnected');
        });
    }

    joinProject(projectId) {
        this.socket.emit('join-project', projectId);
    }

    sendSceneUpdate(projectId, sceneData) {
        this.socket.emit('scene-update', { projectId, sceneData });
    }

    sendEditorAction(projectId, action) {
        this.socket.emit('editor-action', { projectId, action });
    }

    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
            this.socket.on(event, (data) => {
                this.listeners[event].forEach(cb => cb(data));
            });
        }
        this.listeners[event].push(callback);
    }

    off(event) {
        if (this.listeners[event]) {
            this.listeners[event] = [];
        }
    }

    disconnect() {
        this.socket.disconnect();
    }
}