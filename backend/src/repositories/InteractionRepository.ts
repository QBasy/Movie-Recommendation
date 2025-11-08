import { Interaction, IInteraction, InteractionType } from '../models/Interaction.js';
import mongoose from 'mongoose';

export class InteractionRepository {
    async create(data: Partial<IInteraction>): Promise<IInteraction> {
        const interaction = new Interaction(data);
        return await interaction.save();
    }

    async findByUserId(userId: string, limit = 100): Promise<IInteraction[]> {
        return await Interaction.find({ userId })
            .sort({ timestamp: -1 })
            .limit(limit)
            .populate('movieId')
            .exec();
    }

    async findByMovieId(movieId: string, limit = 100): Promise<IInteraction[]> {
        return await Interaction.find({ movieId })
            .sort({ timestamp: -1 })
            .limit(limit)
            .exec();
    }

    async findByUserAndType(userId: string, type: InteractionType, limit = 100): Promise<IInteraction[]> {
        return await Interaction.find({ userId, type })
            .sort({ timestamp: -1 })
            .limit(limit)
            .populate('movieId')
            .exec();
    }

    async findByUserAndMovie(userId: string, movieId: string): Promise<IInteraction[]> {
        return await Interaction.find({ userId, movieId }).exec();
    }

    async getUserMovieMatrix(): Promise<Map<string, Map<string, number>>> {
        const interactions = await Interaction.find({ type: { $in: [InteractionType.RATING, InteractionType.LIKE, InteractionType.PURCHASE] } }).exec();

        const matrix = new Map<string, Map<string, number>>();

        for (const interaction of interactions) {
            const userId = interaction.userId.toString();
            const movieId = interaction.movieId.toString();

            if (!matrix.has(userId)) {
                matrix.set(userId, new Map());
            }

            const userInteractions = matrix.get(userId)!;

            let score = 0;
            if (interaction.type === InteractionType.RATING && interaction.rating) {
                score = interaction.rating / 2;
            } else if (interaction.type === InteractionType.LIKE) {
                score = 5;
            } else if (interaction.type === InteractionType.PURCHASE) {
                score = 4;
            }

            userInteractions.set(movieId, score);
        }

        return matrix;
    }

    async getMovieUserMatrix(): Promise<Map<string, Map<string, number>>> {
        const matrix = await this.getUserMovieMatrix();
        const movieUserMatrix = new Map<string, Map<string, number>>();

        for (const [userId, movies] of matrix.entries()) {
            for (const [movieId, score] of movies.entries()) {
                if (!movieUserMatrix.has(movieId)) {
                    movieUserMatrix.set(movieId, new Map());
                }
                movieUserMatrix.get(movieId)!.set(userId, score);
            }
        }

        return movieUserMatrix;
    }

    async getUserInteractionCount(userId: string): Promise<number> {
        return await Interaction.countDocuments({ userId }).exec();
    }

    async deleteByUserAndMovie(userId: string, movieId: string, type: InteractionType): Promise<boolean> {
        const result = await Interaction.deleteOne({ userId, movieId, type }).exec();
        return result.deletedCount > 0;
    }
}