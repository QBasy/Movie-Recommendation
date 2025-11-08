import mongoose, {Schema, Document, Types} from 'mongoose';

export interface IUser extends Document {
    _id: Types.ObjectId;
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
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
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

UserSchema.index({ email: 1 });
UserSchema.index({ username: 1 });

export const User = mongoose.model<IUser>('User', UserSchema);