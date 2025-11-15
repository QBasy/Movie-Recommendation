import mongoose, { Schema, Document } from 'mongoose';

export enum InteractionType {
    VIEW = 'view',
    LIKE = 'like',
    DISLIKE = 'dislike',
    PURCHASE = 'purchase',
    RATING = 'rating',
    WATCHLIST = 'watchlist'
}

export interface IInteraction extends Document {
    userId: mongoose.Types.ObjectId;
    movieId: mongoose.Types.ObjectId;
    type: InteractionType;
    rating?: number;
    timestamp: Date;
}

const InteractionSchema = new Schema<IInteraction>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    movieId: {
        type: Schema.Types.ObjectId,
        ref: 'Movie',
        required: true,
        index: true
    },
    type: {
        type: String,
        enum: Object.values(InteractionType),
        required: true,
        index: true
    },
    rating: {
        type: Number,
        min: 1,
        max: 10
    },
    timestamp: {
        type: Date,
        default: Date.now,
        index: -1
    }
});

InteractionSchema.index({ userId: 1, movieId: 1, type: 1 });
InteractionSchema.index({ userId: 1, timestamp: -1 });
InteractionSchema.index({ userId: 1, type: 1 });
InteractionSchema.index({ movieId: 1, type: 1 });
InteractionSchema.index({ type: 1, timestamp: -1 });

export const Interaction = mongoose.model<IInteraction>('Interaction', InteractionSchema);