import { FastifyInstance } from 'fastify';
import { MovieService } from '../services/MovieService.js';
import { movieSchema } from '../utils/validators.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

export async function movieRoutes(fastify: FastifyInstance) {
    const movieService = new MovieService();

    fastify.get('/movies', async (request, reply) => {
        const { limit = 50, skip = 0 } = request.query as any;
        const movies = await movieService.getAllMovies(parseInt(limit), parseInt(skip));
        reply.send({ movies });
    });

    fastify.get('/movies/search', async (request, reply) => {
        const { q, limit = 20 } = request.query as any;

        if (!q) {
            return reply.status(400).send({ error: 'Query parameter "q" is required' });
        }

        const movies = await movieService.searchMovies(q, parseInt(limit));
        reply.send({ movies });
    });

    fastify.get('/movies/genre/:genre', async (request, reply) => {
        const { genre } = request.params as any;
        const { limit = 20 } = request.query as any;

        const movies = await movieService.getMoviesByGenre(genre, parseInt(limit));
        reply.send({ movies });
    });

    fastify.get('/movies/:id', async (request, reply) => {
        const { id } = request.params as any;
        const movie = await movieService.getMovieById(id);

        if (!movie) {
            return reply.status(404).send({ error: 'Movie not found' });
        }

        reply.send({ movie });
    });

    fastify.post('/movies', { preHandler: authMiddleware }, async (request, reply) => {
        const data = movieSchema.parse(request.body);
        const movie = await movieService.createMovie(data);
        reply.status(201).send({ movie });
    });

    fastify.put('/movies/:id', { preHandler: authMiddleware }, async (request, reply) => {
        const { id } = request.params as any;
        const data = movieSchema.partial().parse(request.body);

        const movie = await movieService.updateMovie(id, data);

        if (!movie) {
            return reply.status(404).send({ error: 'Movie not found' });
        }

        reply.send({ movie });
    });

    fastify.delete('/movies/:id', { preHandler: authMiddleware }, async (request, reply) => {
        const { id } = request.params as any;
        const deleted = await movieService.deleteMovie(id);

        if (!deleted) {
            return reply.status(404).send({ error: 'Movie not found' });
        }

        reply.send({ message: 'Movie deleted successfully' });
    });
}
