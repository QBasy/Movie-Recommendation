import mongoose from 'mongoose';

export class MongoAdapter {
    async isValidObjectId(id: string): Promise<boolean> {
        return mongoose.Types.ObjectId.isValid(id);
    }

    toObjectId(id: string): mongoose.Types.ObjectId {
        return new mongoose.Types.ObjectId(id);
    }

    async startSession() {
        return await mongoose.startSession();
    }
}