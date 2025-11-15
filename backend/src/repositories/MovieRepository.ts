import { Movie, IMovie } from '../models/Movie.js';
import { IRepository } from './interfaces/IRepository.js';
import { LeanMovie } from '../types/lean.js';

export class MovieRepository implements IRepository<IMovie> {
    async findById(id: string): Promise<LeanMovie | null> {
        return await Movie.findById(id).lean<LeanMovie>().exec();
    }

    async findOne(filter: Record<string, any>): Promise<LeanMovie | null> {
        return await Movie.findOne(filter).lean<LeanMovie>().exec();
    }

    async find(filter: Record<string, any>, limit = 100, skip = 0): Promise<LeanMovie[]> {
        return await Movie.find(filter).limit(limit).skip(skip).lean<LeanMovie[]>().exec();
    }

    async create(data: Partial<IMovie>): Promise<IMovie> {
        const movie = new Movie(data);
        return await movie.save();
    }

    async update(id: string, data: Partial<IMovie>): Promise<LeanMovie | null> {
        return await Movie.findByIdAndUpdate(id, data, { new: true }).lean<LeanMovie>().exec();
    }

    async delete(id: string): Promise<boolean> {
        const result = await Movie.findByIdAndDelete(id).exec();
        return result !== null;
    }

    async search(query: string, limit = 20): Promise<LeanMovie[]> {
        return await Movie.find(
            { $text: { $search: query } },
            { score: { $meta: 'textScore' } }
        )
            .sort({ score: { $meta: 'textScore' } })
            .limit(limit)
            .lean<LeanMovie[]>()
            .exec();
    }

    async findByGenre(genre: string, limit = 20): Promise<LeanMovie[]> {
        return await Movie.find({ genres: genre }).limit(limit).lean<LeanMovie[]>().exec();
    }

    async findByIds(ids: string[]): Promise<LeanMovie[]> {
        return await Movie.find({ _id: { $in: ids } }).lean<LeanMovie[]>().exec();
    }

    async getAll(limit = 100, skip = 0): Promise<LeanMovie[]> {
        return await Movie.find().limit(limit).skip(skip).lean<LeanMovie[]>().exec();
    }
}