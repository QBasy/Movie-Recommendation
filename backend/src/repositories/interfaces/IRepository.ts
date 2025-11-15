import mongoose from 'mongoose';

type LeanDocument<T> = Omit<T, keyof mongoose.Document>;

export interface IRepository<T> {
    findById(id: string): Promise<LeanDocument<T> | null>;
    findOne(filter: Record<string, any>): Promise<LeanDocument<T> | null>;
    find(filter: Record<string, any>, limit?: number, skip?: number): Promise<LeanDocument<T>[]>;
    create(data: Partial<T>): Promise<T>;
    update(id: string, data: Partial<T>): Promise<LeanDocument<T> | null>;
    delete(id: string): Promise<boolean>;
}