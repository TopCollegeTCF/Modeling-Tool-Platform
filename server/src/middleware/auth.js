import jwt from 'jsonwebtoken';

export const authMiddleware = async (request, reply) => {
    try {
        const token = request.headers.authorization?.split(' ')[1];
        
        if (!token) {
            throw new Error('No token provided');
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        request.user = decoded;
        return true;
    } catch (err) {
        reply.code(401).send({ error: 'Unauthorized', message: err.message });
        return false;
    }
};

export const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, username: user.username, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
};