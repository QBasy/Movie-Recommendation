import { FastifyInstance } from 'fastify';
import { RecommendationService, RecommendationStrategyType } from '../services/RecommendationService.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

export async function recommendationRoutes(fastify: FastifyInstance) {
    const recommendationService = new RecommendationService();

    fastify.get('/recommendations', { preHandler: authMiddleware }, async (request, reply) => {
        const user = (request as any).user;
        const { strategy = 'hybrid', limit = 10 } = request.query as any;

        const movies = await recommendationService.getRecommendations(
            user._id.toString(),
            strategy as RecommendationStrategyType,
            parseInt(limit)
        );

        reply.send({ recommendations: movies });
    });

    fastify.get('/recommendations/similar/:movieId', async (request, reply) => {
        const { movieId } = request.params as any;
        const { limit = 10 } = request.query as any;

        const movies = await recommendationService.getSimilarMovies(movieId, parseInt(limit));
        reply.send({ similar: movies });
    });
}
