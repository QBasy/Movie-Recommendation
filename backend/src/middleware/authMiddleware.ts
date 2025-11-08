import { FastifyRequest, FastifyReply } from 'fastify';
import { AuthService } from '../services/AuthService.js';

const authService = new AuthService();

export async function authMiddleware(request: FastifyRequest, reply: FastifyReply) {
    try {
        const authHeader = request.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return reply.status(401).send({ error: 'No token provided' });
        }

        const token = authHeader.substring(7);
        const user = await authService.validateToken(token);

        if (!user) {
            return reply.status(401).send({ error: 'Invalid or expired token' });
        }

        (request as any).user = user;
        (request as any).token = token;
    } catch (error) {
        return reply.status(401).send({ error: 'Authentication failed' });
    }
}