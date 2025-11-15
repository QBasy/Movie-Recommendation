import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    email: string;
    password: string;
    username: string;
    firstName?: string;
    lastName?: string;
    preferences: {
        favoriteGenres: string[];
        dislikedGenres: string[];
    };
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    password: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        index: true
    },
    firstName: String,
    lastName: String,
    preferences: {
        favoriteGenres: [String],
        dislikedGenres: [String]
    }
}, {
    timestamps: true
});

export const User = mongoose.model<IUser>('User', UserSchema);