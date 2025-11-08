import { RedisClient } from '../config/redis.js';

export class RedisAdapter {
    private client;

    constructor() {
        this.client = RedisClient.getInstance().getClient();
    }

    async set(key: string, value: string, ttl?: number): Promise<void> {
        if (ttl) {
            await this.client.setEx(key, ttl, value);
        } else {
            await this.client.set(key, value);
        }
    }

    async get(key: string): Promise<string | null> {
        return await this.client.get(key);
    }

    async del(key: string): Promise<void> {
        await this.client.del(key);
    }

    async exists(key: string): Promise<boolean> {
        const result = await this.client.exists(key);
        return result === 1;
    }

    async expire(key: string, seconds: number): Promise<void> {
        await this.client.expire(key, seconds);
    }

    async keys(pattern: string): Promise<string[]> {
        return await this.client.keys(pattern);
    }

    async hSet(key: string, field: string, value: string): Promise<void> {
        await this.client.hSet(key, field, value);
    }

    async hGet(key: string, field: string): Promise<string | null> {
        return await this.client.hGet(key, field);
    }

    async hGetAll(key: string): Promise<Record<string, string>> {
        return await this.client.hGetAll(key);
    }

    async hDel(key: string, field: string): Promise<void> {
        await this.client.hDel(key, field);
    }
}