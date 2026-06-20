export const projectRoutes = (fastify, options, done) => {
    const { projectController, authMiddleware } = options;
    
    // Все маршруты проектов требуют аутентификации
    fastify.get('/api/projects', { preHandler: [authMiddleware] }, projectController.getProjects);
    fastify.post('/api/projects', { preHandler: [authMiddleware] }, projectController.createProject);
    fastify.get('/api/projects/:id', { preHandler: [authMiddleware] }, projectController.getProject);
    fastify.put('/api/projects/:id', { preHandler: [authMiddleware] }, projectController.updateProject);
    fastify.delete('/api/projects/:id', { preHandler: [authMiddleware] }, projectController.deleteProject);
    fastify.get('/api/projects/:id/export', { preHandler: [authMiddleware] }, projectController.exportProject);
    
    done();
};