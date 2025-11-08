import { MovieRepository } from '../repositories/MovieRepository.js';
import { InteractionRepository } from '../repositories/InteractionRepository.js';
import { IMovie } from '../models/Movie.js';
import { InteractionType } from '../models/Interaction.js';
import { Cache, InvalidateCache } from '../decorators/CacheDecorator.js';
import { Log } from '../decorators/LoggingDecorator.js';

export class MovieService {
    private movieRepo: MovieRepository;
    private interactionRepo: InteractionRepository;

    constructor() {
        this.movieRepo = new MovieRepository();
        this.interactionRepo = new InteractionRepository();
    }

    @Log
    @Cache('movie:single', 600)
    async getMovieById(id: string): Promise<IMovie | null> {
        return await this.movieRepo.findById(id);
    }

    @Log
    @Cache('movies:all', 300)
    async getAllMovies(limit = 50, skip = 0): Promise<IMovie[]> {
        return await this.movieRepo.getAll(limit, skip);
    }

    @Log
    @Cache('movies:search', 300)
    async searchMovies(query: string, limit = 20): Promise<IMovie[]> {
        return await this.movieRepo.search(query, limit);
    }

    @Log
    @Cache('movies:genre', 300)
    async getMoviesByGenre(genre: string, limit = 20): Promise<IMovie[]> {
        return await this.movieRepo.findByGenre(genre, limit);
    }

    @Log
    @InvalidateCache(['movies:all', 'movies:search', 'movies:genre', 'movie:single'])
    async createMovie(data: Partial<IMovie>): Promise<IMovie> {
        return await this.movieRepo.create(data);
    }

    @Log
    @InvalidateCache(['movies:all', 'movies:search', 'movies:genre', 'movie:single'])
    async updateMovie(id: string, data: Partial<IMovie>): Promise<IMovie | null> {
        return await this.movieRepo.update(id, data);
    }

    @Log
    @InvalidateCache(['movies:all', 'movies:search', 'movies:genre', 'movie:single'])
    async deleteMovie(id: string): Promise<boolean> {
        return await this.movieRepo.delete(id);
    }

    @Log
    @InvalidateCache(['recommendations', 'interactions:user'])
    async recordInteraction(
        userId: string,
        movieId: string,
        type: InteractionType,
        rating?: number
    ): Promise<void> {
        await this.interactionRepo.create({
            userId: userId as any,
            movieId: movieId as any,
            type,
            rating,
            timestamp: new Date()
        });
    }

    @Log
    @Cache('interactions:user', 300)
    async getUserInteractions(userId: string, type?: InteractionType): Promise<any[]> {
        if (type) {
            return await this.interactionRepo.findByUserAndType(userId, type);
        }
        return await this.interactionRepo.findByUserId(userId);
    }

    @Log
    @InvalidateCache(['interactions:user', 'recommendations'])
    async removeInteraction(userId: string, movieId: string, type: InteractionType): Promise<boolean> {
        return await this.interactionRepo.deleteByUserAndMovie(userId, movieId, type);
    }
}