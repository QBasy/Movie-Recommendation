import { RedisAdapter } from '../adapters/RedisAdapter.js';
import { ISession } from '../models/Session.js';
import { config } from '../config/environment.js';

export class SessionService {
    private redis: RedisAdapter;

    constructor() {
        this.redis = new RedisAdapter();
    }

    async createSession(sessionId: string, session: ISession): Promise<void> {
        const key = this.getSessionKey(sessionId);
        await this.redis.set(key, JSON.stringify(session), config.sessionTTL);
    }

    async getSession(sessionId: string): Promise<ISession | null> {
        const key = this.getSessionKey(sessionId);
        const data = await this.redis.get(key);
        return data ? JSON.parse(data) : null;
    }

    async deleteSession(sessionId: string): Promise<void> {
        const key = this.getSessionKey(sessionId);
        await this.redis.del(key);
    }

    async refreshSession(sessionId: string): Promise<void> {
        const key = this.getSessionKey(sessionId);
        await this.redis.expire(key, config.sessionTTL);
    }

    private getSessionKey(sessionId: string): string {
        return `session:${sessionId}`;
    }
}