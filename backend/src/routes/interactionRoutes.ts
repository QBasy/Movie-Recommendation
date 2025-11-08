import { FastifyInstance } from 'fastify';
import { MovieService } from '../services/MovieService.js';
import { interactionSchema } from '../utils/validators.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { InteractionType } from '../models/Interaction.js';

export async function interactionRoutes(fastify: FastifyInstance) {
    const movieService = new MovieService();

    fastify.post('/interactions', { preHandler: authMiddleware }, async (request, reply) => {
        const user = (request as any).user;
        const data = interactionSchema.parse(request.body);

        await movieService.recordInteraction(
            user._id.toString(),
            data.movieId,
            data.type as InteractionType,
            data.rating
        );

        reply.status(201).send({ message: 'Interaction recorded successfully' });
    });

    fastify.get('/interactions', { preHandler: authMiddleware }, async (request, reply) => {
        const user = (request as any).user;
        const { type } = request.query as any;

        const interactions = await movieService.getUserInteractions(
            user._id.toString(),
            type as InteractionType
        );

        reply.send({ interactions });
    });

    fastify.delete('/interactions/:movieId/:type', { preHandler: authMiddleware }, async (request, reply) => {
        const user = (request as any).user;
        const { movieId, type } = request.params as any;

        const deleted = await movieService.removeInteraction(
            user._id.toString(),
            movieId,
            type as InteractionType
        );

        if (!deleted) {
            return reply.status(404).send({ error: 'Interaction not found' });
        }

        reply.send({ message: 'Interaction removed successfully' });
    });

    fastify.get('/watchlist', { preHandler: authMiddleware }, async (request, reply) => {
        const user = (request as any).user;
        const interactions = await movieService.getUserInteractions(
            user._id.toString(),
            InteractionType.WATCHLIST
        );
        reply.send({ watchlist: interactions });
    });

    fastify.get('/purchases', { preHandler: authMiddleware }, async (request, reply) => {
        const user = (request as any).user;
        const interactions = await movieService.getUserInteractions(
            user._id.toString(),
            InteractionType.PURCHASE
        );
        reply.send({ purchases: interactions });
    });
}
