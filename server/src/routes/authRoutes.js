export const authRoutes = (fastify, options, done) => {
    const { authController } = options;
    
    fastify.post('/api/auth/register', authController.register);
    fastify.post('/api/auth/login', authController.login);
    
    done();
};