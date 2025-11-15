import mongoose, { Schema, Document } from 'mongoose';

export interface IMovie extends Document {
    title: string;
    description: string;
    genres: string[];
    director: string;
    cast: string[];
    releaseYear: number;
    duration: number;
    rating: number;
    posterUrl?: string;
    trailerUrl?: string;
    price: number;
    createdAt: Date;
    updatedAt: Date;
}

const MovieSchema = new Schema<IMovie>({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    genres: {
        type: [String],
        required: true,
        index: true
    },
    director: {
        type: String,
        required: true
    },
    cast: [String],
    releaseYear: {
        type: Number,
        required: true,
        index: true
    },
    duration: {
        type: Number,
        required: true
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 10,
        index: -1
    },
    posterUrl: String,
    trailerUrl: String,
    price: {
        type: Number,
        required: true,
        min: 0
    }
}, {
    timestamps: true
});

MovieSchema.index({ title: 'text', description: 'text' });

export const Movie = mongoose.model<IMovie>('Movie', MovieSchema);