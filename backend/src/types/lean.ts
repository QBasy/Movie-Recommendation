import mongoose from 'mongoose';
import { IUser } from '../models/User.js';
import { IMovie } from '../models/Movie.js';
import { IInteraction } from '../models/Interaction.js';

export type LeanUser = Omit<IUser, keyof mongoose.Document> & {
    _id: mongoose.Types.ObjectId;
};

export type LeanMovie = Omit<IMovie, keyof mongoose.Document> & {
    _id: mongoose.Types.ObjectId;
};

export type LeanInteraction = Omit<IInteraction, keyof mongoose.Document> & {
    _id: mongoose.Types.ObjectId;
    movieId: LeanMovie | mongoose.Types.ObjectId;
};