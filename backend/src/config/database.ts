import mongoose from 'mongoose';
import { config } from './environment.js';

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
            await mongoose.connect(config.mongoUri);
            console.log('MongoDB connected successfully');
        } catch (error) {
            console.error('MongoDB connection error:', error);
            throw error;
        }
    }

    async disconnect(): Promise<void> {
        await mongoose.disconnect();
    }
}