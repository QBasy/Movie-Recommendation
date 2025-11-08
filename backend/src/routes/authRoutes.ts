import { FastifyInstance } from 'fastify';
import { AuthService } from '../services/AuthService.js';
import { UserRepository } from '../repositories/UserRepository.js';
import { registerSchema, loginSchema, updateUserPreferencesSchema } from '../utils/validators.js';
import { sanitizeUser } from '../utils/helpers.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

export async function authRoutes(fastify: FastifyInstance) {
    const authService = new AuthService();
    const userRepo = new UserRepository();

    fastify.post('/register', async (request, reply) => {
        const data = registerSchema.parse(request.body);
        const { user, token } = await authService.register(data);

        reply.status(201).send({
            user: sanitizeUser(user),
            token
        });
    });

    fastify.post('/login', async (request, reply) => {
        const { email, password } = loginSchema.parse(request.body);
        const { user, token } = await authService.login(email, password);

        reply.send({
            user: sanitizeUser(user),
            token
        });
    });

    fastify.post('/logout', { preHandler: authMiddleware }, async (request, reply) => {
        const token = (request as any).token;
        await authService.logout(token);

        reply.send({ message: 'Logged out successfully' });
    });

    fastify.get('/me', { preHandler: authMiddleware }, async (request, reply) => {
        const user = (request as any).user;
        reply.send({ user: sanitizeUser(user) });
    });

    fastify.put('/preferences', { preHandler: authMiddleware }, async (request, reply) => {
        const user = (request as any).user;
        const data = updateUserPreferencesSchema.parse(request.body);

        const updatedUser = await userRepo.update(user._id.toString(), {
            preferences: {
                ...user.preferences,
                ...data
            }
        });

        reply.send({ user: sanitizeUser(updatedUser) });
    });
}
