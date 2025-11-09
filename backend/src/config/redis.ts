import { createClient } from 'redis';
import { config } from './environment.js';

export class RedisClient {
    private static instance: RedisClient;
    private readonly client: ReturnType<typeof createClient>;

    private constructor() {
        this.client = createClient({
            socket: {
                host: config.redisHost,
                port: config.redisPort
            }
        });

        this.client.on('error', (err) => console.error('Redis Client Error', err));
    }

    static getInstance(): RedisClient {
        if (!RedisClient.instance) {
            RedisClient.instance = new RedisClient();
        }
        return RedisClient.instance;
    }

    async connect(): Promise<void> {
        await this.client.connect();
        console.log('Redis connected successfully');
    }

    async disconnect(): Promise<void> {
        await this.client.disconnect();
    }

    getClient() {
        return this.client;
    }
}