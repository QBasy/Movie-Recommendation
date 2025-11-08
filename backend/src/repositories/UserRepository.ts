import { User, IUser } from '../models/User.js';
import { IRepository } from './interfaces/IRepository.js';

export class UserRepository implements IRepository<IUser> {
    async findById(id: string): Promise<IUser | null> {
        return await User.findById(id).exec();
    }

    async findOne(filter: Record<string, any>): Promise<IUser | null> {
        return await User.findOne(filter).exec();
    }

    async find(filter: Record<string, any>, limit = 100, skip = 0): Promise<IUser[]> {
        return await User.find(filter).limit(limit).skip(skip).exec();
    }

    async create(data: Partial<IUser>): Promise<IUser> {
        const user = new User(data);
        return await user.save();
    }

    async update(id: string, data: Partial<IUser>): Promise<IUser | null> {
        return await User.findByIdAndUpdate(id, data, { new: true }).exec();
    }

    async delete(id: string): Promise<boolean> {
        const result = await User.findByIdAndDelete(id).exec();
        return result !== null;
    }

    async findByEmail(email: string): Promise<IUser | null> {
        return await User.findOne({ email }).exec();
    }

    async findByUsername(username: string): Promise<IUser | null> {
        return await User.findOne({ username }).exec();
    }
}