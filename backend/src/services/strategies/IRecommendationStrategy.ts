export interface IRecommendationStrategy {
    generateRecommendations(userId: string, limit: number): Promise<string[]>;
}