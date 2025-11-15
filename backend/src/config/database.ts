import mongoose from 'mongoose';
import { config } from './environment.js';
import { User } from '../models/User.js';
import { Movie } from '../models/Movie.js';
import { Interaction } from '../models/Interaction.js';

export class Database {
    private static instance: Database;

    private constructor() {}

    static getInstance(): Database {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }

    async connect(): Promise<void> {
        try {
            await mongoose.connect(config.mongoUri, {
                maxPoolSize: 50,
                minPoolSize: 10,
                socketTimeoutMS: 45000,
                serverSelectionTimeoutMS: 5000,
            });
            console.log('MongoDB connected successfully');

            await this.ensureIndexes();
        } catch (error) {
            console.error('MongoDB connection error:', error);
            throw error;
        }
    }

    async ensureIndexes(): Promise<void> {
        try {
            console.log('Creating indexes...');

            await User.collection.createIndex({ email: 1 }, { unique: true });
            await User.collection.createIndex({ username: 1 }, { unique: true });
            console.log('✓ User indexes created');

            await Movie.collection.createIndex({ title: 'text', description: 'text' });
            await Movie.collection.createIndex({ genres: 1 });
            await Movie.collection.createIndex({ releaseYear: 1 });
            await Movie.collection.createIndex({ rating: -1 });
            console.log('✓ Movie indexes created');

            await Interaction.collection.createIndex({ userId: 1, movieId: 1, type: 1 });
            await Interaction.collection.createIndex({ userId: 1, timestamp: -1 });
            await Interaction.collection.createIndex({ movieId: 1 });
            await Interaction.collection.createIndex({ userId: 1, type: 1 });
            await Interaction.collection.createIndex({ movieId: 1, type: 1 });
            await Interaction.collection.createIndex({ type: 1, timestamp: -1 });
            console.log('✓ Interaction indexes created');

            console.log('All indexes created successfully');
        } catch (error) {
            console.error('Error creating indexes:', error);
        }
    }

    async disconnect(): Promise<void> {
        await mongoose.disconnect();
    }
}