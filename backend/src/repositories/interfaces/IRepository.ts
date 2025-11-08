export interface IRepository<T> {
    findById(id: string): Promise<T | null>;
    findOne(filter: Record<string, any>): Promise<T | null>;
    find(filter: Record<string, any>, limit?: number, skip?: number): Promise<T[]>;
    create(data: Partial<T>): Promise<T>;
    update(id: string, data: Partial<T>): Promise<T | null>;
    delete(id: string): Promise<boolean>;
}