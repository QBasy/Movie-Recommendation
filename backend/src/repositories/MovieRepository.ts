import { Movie, IMovie } from '../models/Movie.js';
import { IRepository } from './interfaces/IRepository.js';

export class MovieRepository implements IRepository<IMovie> {
    async findById(id: string): Promise<IMovie | null> {
        return await Movie.findById(id).exec();
    }

    async findOne(filter: Record<string, any>): Promise<IMovie | null> {
        return await Movie.findOne(filter).exec();
    }

    async find(filter: Record<string, any>, limit = 100, skip = 0): Promise<IMovie[]> {
        return await Movie.find(filter).limit(limit).skip(skip).exec();
    }

    async create(data: Partial<IMovie>): Promise<IMovie> {
        const movie = new Movie(data);
        return await movie.save();
    }

    async update(id: string, data: Partial<IMovie>): Promise<IMovie | null> {
        return await Movie.findByIdAndUpdate(id, data, { new: true }).exec();
    }

    async delete(id: string): Promise<boolean> {
        const result = await Movie.findByIdAndDelete(id).exec();
        return result !== null;
    }

    async search(query: string, limit = 20): Promise<IMovie[]> {
        return await Movie.find(
            { $text: { $search: query } },
            { score: { $meta: 'textScore' } }
        )
            .sort({ score: { $meta: 'textScore' } })
            .limit(limit)
            .exec();
    }

    async findByGenre(genre: string, limit = 20): Promise<IMovie[]> {
        return await Movie.find({ genres: genre }).limit(limit).exec();
    }

    async findByIds(ids: string[]): Promise<IMovie[]> {
        return await Movie.find({ _id: { $in: ids } }).exec();
    }

    async getAll(limit = 100, skip = 0): Promise<IMovie[]> {
        return await Movie.find().limit(limit).skip(skip).exec();
    }
}
