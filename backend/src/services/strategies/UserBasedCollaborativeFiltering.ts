import { IRecommendationStrategy } from './IRecommendationStrategy.js';
import { InteractionRepository } from '../../repositories/InteractionRepository.js';

export class UserBasedCollaborativeFiltering implements IRecommendationStrategy {
    private interactionRepo: InteractionRepository;

    constructor() {
        this.interactionRepo = new InteractionRepository();
    }

    async generateRecommendations(userId: string, limit: number): Promise<string[]> {
        const matrix = await this.interactionRepo.getUserMovieMatrix();

        if (!matrix.has(userId)) {
            return [];
        }

        const targetUserMovies = matrix.get(userId)!;
        const similarities = new Map<string, number>();

        for (const [otherUserId, otherUserMovies] of matrix.entries()) {
            if (otherUserId === userId) continue;

            const similarity = this.calculateCosineSimilarity(targetUserMovies, otherUserMovies);
            if (similarity > 0) {
                similarities.set(otherUserId, similarity);
            }
        }

        const sortedSimilarUsers = Array.from(similarities.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);

        const recommendations = new Map<string, number>();

        for (const [similarUserId, similarity] of sortedSimilarUsers) {
            const similarUserMovies = matrix.get(similarUserId)!;

            for (const [movieId, rating] of similarUserMovies.entries()) {
                if (!targetUserMovies.has(movieId)) {
                    const currentScore = recommendations.get(movieId) || 0;
                    recommendations.set(movieId, currentScore + (rating * similarity));
                }
            }
        }

        return Array.from(recommendations.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([movieId]) => movieId);
    }

    private calculateCosineSimilarity(
        userA: Map<string, number>,
        userB: Map<string, number>
    ): number {
        const commonMovies = Array.from(userA.keys()).filter(movieId => userB.has(movieId));

        if (commonMovies.length === 0) return 0;

        let dotProduct = 0;
        let normA = 0;
        let normB = 0;

        for (const movieId of commonMovies) {
            const ratingA = userA.get(movieId)!;
            const ratingB = userB.get(movieId)!;
            dotProduct += ratingA * ratingB;
        }

        for (const rating of userA.values()) {
            normA += rating * rating;
        }

        for (const rating of userB.values()) {
            normB += rating * rating;
        }

        if (normA === 0 || normB === 0) return 0;

        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }
}