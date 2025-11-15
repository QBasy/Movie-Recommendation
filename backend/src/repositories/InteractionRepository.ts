import { Interaction, IInteraction, InteractionType } from '../models/Interaction.js';
import { LeanInteraction } from '../types/lean.js';

export class InteractionRepository {
    async create(data: Partial<IInteraction>): Promise<IInteraction> {
        const interaction = new Interaction(data);
        return await interaction.save();
    }

    async findByUserId(userId: string, limit = 100): Promise<LeanInteraction[]> {
        return await Interaction.find({ userId })
            .sort({ timestamp: -1 })
            .limit(limit)
            .populate('movieId')
            .lean<LeanInteraction[]>()
            .exec();
    }

    async findByMovieId(movieId: string, limit = 100): Promise<LeanInteraction[]> {
        return await Interaction.find({ movieId })
            .sort({ timestamp: -1 })
            .limit(limit)
            .lean<LeanInteraction[]>()
            .exec();
    }

    async findByUserAndType(userId: string, type: InteractionType, limit = 100): Promise<LeanInteraction[]> {
        return await Interaction.find({ userId, type })
            .sort({ timestamp: -1 })
            .limit(limit)
            .populate('movieId')
            .lean<LeanInteraction[]>()
            .exec();
    }

    async findByUserAndMovie(userId: string, movieId: string): Promise<LeanInteraction[]> {
        return await Interaction.find({ userId, movieId }).lean<LeanInteraction[]>().exec();
    }

    async getUserMovieMatrix(): Promise<Map<string, Map<string, number>>> {
        const interactions = await Interaction.aggregate([
            {
                $match: {
                    type: { $in: ['rating', 'like', 'purchase'] }
                }
            },
            {
                $sort: { timestamp: -1 }
            },
            {
                $group: {
                    _id: '$userId',
                    interactions: { $push: '$$ROOT' }
                }
            },
            {
                $project: {
                    interactions: { $slice: ['$interactions', 100] }
                }
            },
            {
                $unwind: '$interactions'
            },
            {
                $replaceRoot: { newRoot: '$interactions' }
            }
        ]);

        const matrix = new Map<string, Map<string, number>>();

        for (const interaction of interactions) {
            const userId = interaction.userId.toString();
            const movieId = interaction.movieId.toString();

            if (!matrix.has(userId)) {
                matrix.set(userId, new Map());
            }

            const userInteractions = matrix.get(userId)!;

            let score = 0;
            if (interaction.type === 'rating' && interaction.rating) {
                score = interaction.rating / 2;
            } else if (interaction.type === 'like') {
                score = 5;
            } else if (interaction.type === 'purchase') {
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