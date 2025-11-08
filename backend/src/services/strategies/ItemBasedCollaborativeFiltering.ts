import { IRecommendationStrategy } from './IRecommendationStrategy.js';
import { InteractionRepository } from '../../repositories/InteractionRepository.js';

export class ItemBasedCollaborativeFiltering implements IRecommendationStrategy {
    private interactionRepo: InteractionRepository;

    constructor() {
        this.interactionRepo = new InteractionRepository();
    }

    async generateRecommendations(userId: string, limit: number): Promise<string[]> {
        const userMovieMatrix = await this.interactionRepo.getUserMovieMatrix();
        const movieUserMatrix = await this.interactionRepo.getMovieUserMatrix();

        if (!userMovieMatrix.has(userId)) {
            return [];
        }

        const userMovies = userMovieMatrix.get(userId)!;
        const recommendations = new Map<string, number>();

        for (const [likedMovieId, userRating] of userMovies.entries()) {
            const similarMovies = this.findSimilarMovies(likedMovieId, movieUserMatrix);

            for (const [similarMovieId, similarity] of similarMovies.entries()) {
                if (!userMovies.has(similarMovieId)) {
                    const currentScore = recommendations.get(similarMovieId) || 0;
                    recommendations.set(similarMovieId, currentScore + (similarity * userRating));
                }
            }
        }

        return Array.from(recommendations.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([movieId]) => movieId);
    }

    private findSimilarMovies(
        targetMovieId: string,
        movieUserMatrix: Map<string, Map<string, number>>
    ): Map<string, number> {
        const targetMovie = movieUserMatrix.get(targetMovieId);
        if (!targetMovie) return new Map();

        const similarities = new Map<string, number>();

        for (const [otherMovieId, otherMovie] of movieUserMatrix.entries()) {
            if (otherMovieId === targetMovieId) continue;

            const similarity = this.calculateCosineSimilarity(targetMovie, otherMovie);
            if (similarity > 0) {
                similarities.set(otherMovieId, similarity);
            }
        }

        return new Map(
            Array.from(similarities.entries())
                .sort((a, b) => b[1] - a[1])
                .slice(0, 20)
        );
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
}
