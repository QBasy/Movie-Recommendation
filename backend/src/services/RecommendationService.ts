import { IRecommendationStrategy } from './strategies/IRecommendationStrategy.js';
import { UserBasedCollaborativeFiltering } from './strategies/UserBasedCollaborativeFiltering.js';
import { ItemBasedCollaborativeFiltering } from './strategies/ItemBasedCollaborativeFiltering.js';
import { MovieRepository } from '../repositories/MovieRepository.js';
import { InteractionRepository } from '../repositories/InteractionRepository.js';
import { IMovie } from '../models/Movie.js';
import { Cache } from '../decorators/CacheDecorator.js';
import { Log } from '../decorators/LoggingDecorator.js';
import { RedisAdapter } from '../adapters/RedisAdapter.js';

export enum RecommendationStrategyType {
    USER_BASED = 'user-based',
    ITEM_BASED = 'item-based',
    HYBRID = 'hybrid'
}

export class RecommendationService {
    private strategies: Map<RecommendationStrategyType, IRecommendationStrategy>;
    private movieRepo: MovieRepository;
    private interactionRepo: InteractionRepository;
    private redis: RedisAdapter;
    private matrixCacheTTL = 300; // 5 минут

    constructor() {
        this.movieRepo = new MovieRepository();
        this.interactionRepo = new InteractionRepository();
        this.redis = new RedisAdapter();

        this.strategies = new Map<RecommendationStrategyType, IRecommendationStrategy>([
            [RecommendationStrategyType.USER_BASED, new UserBasedCollaborativeFiltering()],
            [RecommendationStrategyType.ITEM_BASED, new ItemBasedCollaborativeFiltering()]
        ]);
    }

    @Log
    @Cache('recommendations:user', 300)
    async getRecommendations(
        userId: string,
        strategyType: RecommendationStrategyType = RecommendationStrategyType.HYBRID,
        limit = 10
    ): Promise<IMovie[]> {
        const interactionCount = await this.interactionRepo.getUserInteractionCount(userId);

        if (interactionCount < 3) {
            console.log(`User ${userId} has less than 3 interactions, returning popular movies`);
            return await this.getPopularMovies(limit);
        }

        let movieIds: string[] = [];

        if (strategyType === RecommendationStrategyType.HYBRID) {
            // Параллельный запуск обеих стратегий
            const [userBasedIds, itemBasedIds] = await Promise.all([
                this.strategies.get(RecommendationStrategyType.USER_BASED)!
                    .generateRecommendations(userId, Math.ceil(limit / 2)),
                this.strategies.get(RecommendationStrategyType.ITEM_BASED)!
                    .generateRecommendations(userId, Math.ceil(limit / 2))
            ]);

            movieIds = [...new Set([...userBasedIds, ...itemBasedIds])].slice(0, limit);
        } else {
            const strategy = this.strategies.get(strategyType);
            if (!strategy) {
                throw new Error('Invalid recommendation strategy');
            }
            movieIds = await strategy.generateRecommendations(userId, limit);
        }

        if (movieIds.length === 0) {
            console.log(`No recommendations found for user ${userId}, returning popular movies`);
            return await this.getPopularMovies(limit);
        }

        const movies = await this.movieRepo.findByIds(movieIds);

        const movieMap = new Map(movies.map(m => [m._id as string, m]));
        return movieIds.map(id => movieMap.get(id)).filter(Boolean) as IMovie[];
    }

    @Log
    @Cache('movies:popular', 600)
    private async getPopularMovies(limit: number): Promise<IMovie[]> {
        return await this.movieRepo.find({ rating: { $gte: 7 } }, limit, 0);
    }

    @Log
    @Cache('recommendations:similar', 300)
    async getSimilarMovies(movieId: string, limit = 10): Promise<IMovie[]> {
        // Кэшируем матрицу
        const cacheKey = 'matrix:movie-user';
        let movieUserMatrix: Map<string, Map<string, number>>;

        const cached = await this.redis.get(cacheKey);
        if (cached) {
            movieUserMatrix = this.deserializeMatrix(JSON.parse(cached));
        } else {
            movieUserMatrix = await this.interactionRepo.getMovieUserMatrix();
            await this.redis.set(
                cacheKey,
                JSON.stringify(this.serializeMatrix(movieUserMatrix)),
                this.matrixCacheTTL
            );
        }

        const targetMovie = movieUserMatrix.get(movieId);

        if (!targetMovie) {
            console.log(`No interactions found for movie ${movieId}`);
            return [];
        }

        const similarities = new Map<string, number>();

        for (const [otherMovieId, otherMovie] of movieUserMatrix.entries()) {
            if (otherMovieId === movieId) continue;

            const similarity = this.calculateCosineSimilarity(targetMovie, otherMovie);
            if (similarity > 0) {
                similarities.set(otherMovieId, similarity);
            }
        }

        const similarMovieIds = Array.from(similarities.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([id]) => id);

        return await this.movieRepo.findByIds(similarMovieIds);
    }

    private calculateCosineSimilarity(
        movieA: Map<string, number>,
        movieB: Map<string, number>
    ): number {
        const commonUsers = Array.from(movieA.keys()).filter(userId => movieB.has(userId));

        if (commonUsers.length === 0) return 0;

        let dotProduct = 0;
        let normA = 0;
        let normB = 0;

        for (const userId of commonUsers) {
            const ratingA = movieA.get(userId)!;
            const ratingB = movieB.get(userId)!;
            dotProduct += ratingA * ratingB;
        }

        for (const rating of movieA.values()) {
            normA += rating * rating;
        }

        for (const rating of movieB.values()) {
            normB += rating * rating;
        }

        if (normA === 0 || normB === 0) return 0;

        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    private serializeMatrix(matrix: Map<string, Map<string, number>>): any {
        const obj: any = {};
        for (const [key, value] of matrix.entries()) {
            obj[key] = Object.fromEntries(value);
        }
        return obj;
    }

    private deserializeMatrix(obj: any): Map<string, Map<string, number>> {
        const matrix = new Map<string, Map<string, number>>();
        for (const [key, value] of Object.entries(obj)) {
            matrix.set(key, new Map(Object.entries(value as any)));
        }
        return matrix;
    }
}