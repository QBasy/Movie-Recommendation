import { IRecommendationStrategy } from './strategies/IRecommendationStrategy.js';
import { UserBasedCollaborativeFiltering } from './strategies/UserBasedCollaborativeFiltering.js';
import { ItemBasedCollaborativeFiltering } from './strategies/ItemBasedCollaborativeFiltering.js';
import { MovieRepository } from '../repositories/MovieRepository.js';
import { InteractionRepository } from '../repositories/InteractionRepository.js';
import { LeanMovie } from '../types/lean.js';
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
    private matrixCacheTTL = 300;

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
    async getRecommendations(
        userId: string,
        strategyType: RecommendationStrategyType = RecommendationStrategyType.HYBRID,
        limit = 10
    ): Promise<LeanMovie[]> {
        console.log(`\n📊 Getting recommendations for user: ${userId}, strategy: ${strategyType}`);

        // Проверяем количество взаимодействий
        const totalInteractionCount = await this.interactionRepo.getUserInteractionCount(userId);
        console.log(`   Total interactions: ${totalInteractionCount}`);

        // Получаем все взаимодействия пользователя для анализа
        const allInteractions = await this.interactionRepo.findByUserId(userId, 100);
        const relevantInteractions = allInteractions.filter(i =>
            ['rating', 'like', 'purchase'].includes(i.type)
        );

        console.log(`   Relevant interactions (rating/like/purchase): ${relevantInteractions.length}`);
        console.log(`   Breakdown: ${JSON.stringify(
            allInteractions.reduce((acc, i) => {
                acc[i.type] = (acc[i.type] || 0) + 1;
                return acc;
            }, {} as Record<string, number>)
        )}`);

        // Если меньше 3 релевантных взаимодействий - популярные фильмы
        if (relevantInteractions.length < 3) {
            console.log(`   ⚠️ Not enough relevant interactions, returning popular movies`);
            return await this.getPopularMovies(limit);
        }

        let movieIds: string[] = [];

        try {
            if (strategyType === RecommendationStrategyType.HYBRID) {
                console.log(`   🔄 Running hybrid strategy...`);

                const [userBasedIds, itemBasedIds] = await Promise.all([
                    this.strategies.get(RecommendationStrategyType.USER_BASED)!
                        .generateRecommendations(userId, Math.ceil(limit / 2))
                        .catch(err => {
                            console.error(`   ❌ User-based failed:`, err.message);
                            return [];
                        }),
                    this.strategies.get(RecommendationStrategyType.ITEM_BASED)!
                        .generateRecommendations(userId, Math.ceil(limit / 2))
                        .catch(err => {
                            console.error(`   ❌ Item-based failed:`, err.message);
                            return [];
                        })
                ]);

                console.log(`   User-based found: ${userBasedIds.length} movies`);
                console.log(`   Item-based found: ${itemBasedIds.length} movies`);

                movieIds = [...new Set([...userBasedIds, ...itemBasedIds])].slice(0, limit);
            } else {
                const strategy = this.strategies.get(strategyType);
                if (!strategy) {
                    throw new Error('Invalid recommendation strategy');
                }
                movieIds = await strategy.generateRecommendations(userId, limit);
            }

            console.log(`   ✅ Found ${movieIds.length} recommended movies`);
        } catch (error) {
            console.error(`   ❌ Recommendation error:`, error);
            movieIds = [];
        }

        // Фоллбэк на популярные фильмы
        if (movieIds.length === 0) {
            console.log(`   ⚠️ No recommendations found, falling back to popular movies`);
            return await this.getPopularMovies(limit);
        }

        // Если нашли мало рекомендаций, добавим популярных
        if (movieIds.length < limit) {
            console.log(`   ⚠️ Only ${movieIds.length} recommendations, adding popular movies`);
            const popular = await this.getPopularMovies(limit - movieIds.length);
            const popularIds = popular
                .map(m => m._id.toString())
                .filter(id => !movieIds.includes(id));
            movieIds = [...movieIds, ...popularIds].slice(0, limit);
        }

        const movies = await this.movieRepo.findByIds(movieIds);

        // Сохраняем порядок рекомендаций
        const movieMap = new Map(movies.map(m => [m._id.toString(), m]));
        const orderedMovies = movieIds
            .map(id => movieMap.get(id))
            .filter(Boolean) as LeanMovie[];

        console.log(`   ✅ Returning ${orderedMovies.length} movies\n`);

        return orderedMovies;
    }

    @Log
    @Cache('movies:popular', 600)
    private async getPopularMovies(limit: number): Promise<LeanMovie[]> {
        console.log(`   📈 Fetching ${limit} popular movies (rating >= 7)`);
        return await this.movieRepo.find({ rating: { $gte: 7 } }, limit, 0);
    }

    @Log
    @Cache('recommendations:similar', 300)
    async getSimilarMovies(movieId: string, limit = 10): Promise<LeanMovie[]> {
        console.log(`\n🎬 Getting similar movies for: ${movieId}`);

        const cacheKey = 'matrix:movie-user';
        let movieUserMatrix: Map<string, Map<string, number>>;

        const cached = await this.redis.get(cacheKey);
        if (cached) {
            console.log(`   ✅ Using cached movie-user matrix`);
            movieUserMatrix = this.deserializeMatrix(JSON.parse(cached));
        } else {
            console.log(`   🔄 Building movie-user matrix...`);
            movieUserMatrix = await this.interactionRepo.getMovieUserMatrix();
            await this.redis.set(
                cacheKey,
                JSON.stringify(this.serializeMatrix(movieUserMatrix)),
                this.matrixCacheTTL
            );
            console.log(`   ✅ Matrix built with ${movieUserMatrix.size} movies`);
        }

        const targetMovie = movieUserMatrix.get(movieId);

        if (!targetMovie) {
            console.log(`   ⚠️ No interactions found for movie ${movieId}`);
            return [];
        }

        console.log(`   Target movie has ${targetMovie.size} user interactions`);

        const similarities = new Map<string, number>();

        for (const [otherMovieId, otherMovie] of movieUserMatrix.entries()) {
            if (otherMovieId === movieId) continue;

            const similarity = this.calculateCosineSimilarity(targetMovie, otherMovie);
            if (similarity > 0) {
                similarities.set(otherMovieId, similarity);
            }
        }

        console.log(`   Found ${similarities.size} similar movies`);

        const similarMovieIds = Array.from(similarities.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([id]) => id);

        const movies = await this.movieRepo.findByIds(similarMovieIds);
        console.log(`   ✅ Returning ${movies.length} similar movies\n`);

        return movies;
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