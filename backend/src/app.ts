import Fastify from 'fastify';
import cors from '@fastify/cors';
import { Database } from './config/database.js';
import { RedisClient } from './config/redis.js';
import { config } from './config/environment.js';
import { errorMiddleware } from './middleware/errorMiddleware.js';
import { authRoutes } from './routes/authRoutes.js';
import { movieRoutes } from './routes/movieRoutes.js';
import { interactionRoutes } from './routes/interactionRoutes.js';
import { recommendationRoutes } from './routes/recommendationRoutes.js';

const fastify = Fastify({
    logger: true
});

fastify.register(cors, {
    origin: true,
    credentials: true
});

fastify.setErrorHandler(errorMiddleware);

fastify.register(authRoutes, { prefix: '/api/auth' });
fastify.register(movieRoutes, { prefix: '/api' });
fastify.register(interactionRoutes, { prefix: '/api' });
fastify.register(recommendationRoutes, { prefix: '/api' });

fastify.get('/health', async (request, reply) => {
    reply.send({ status: 'ok', timestamp: new Date().toISOString() });
});

const start = async () => {
    try {
        const db = Database.getInstance();
        await db.connect();

        const redis = RedisClient.getInstance();
        await redis.connect();

        await fastify.listen({ port: config.port, host: '0.0.0.0' });

        console.log(`Server listening on port ${config.port}`);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

process.on('SIGTERM', async () => {
    await fastify.close();
    await Database.getInstance().disconnect();
    await RedisClient.getInstance().disconnect();
    process.exit(0);
});

start();