import { User, IUser } from '../models/User.js';
import { IRepository } from './interfaces/IRepository.js';
import { LeanUser } from '../types/lean.js';

export class UserRepository implements IRepository<IUser> {
    async findById(id: string): Promise<LeanUser | null> {
        return await User.findById(id).lean<LeanUser>().exec();
    }

    async findOne(filter: Record<string, any>): Promise<LeanUser | null> {
        return await User.findOne(filter).lean<LeanUser>().exec();
    }

    async find(filter: Record<string, any>, limit = 100, skip = 0): Promise<LeanUser[]> {
        return await User.find(filter).limit(limit).skip(skip).lean<LeanUser[]>().exec();
    }

    async create(data: Partial<IUser>): Promise<IUser> {
        const user = new User(data);
        return await user.save();
    }

    async update(id: string, data: Partial<IUser>): Promise<LeanUser | null> {
        return await User.findByIdAndUpdate(id, data, { new: true }).lean<LeanUser>().exec();
    }

    async delete(id: string): Promise<boolean> {
        const result = await User.findByIdAndDelete(id).exec();
        return result !== null;
    }

    async findByEmail(email: string): Promise<LeanUser | null> {
        return await User.findOne({ email }).lean<LeanUser>().exec();
    }

    async findByUsername(username: string): Promise<LeanUser | null> {
        return await User.findOne({ username }).lean<LeanUser>().exec();
    }
}