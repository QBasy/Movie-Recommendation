import { RedisAdapter } from '../adapters/RedisAdapter.js';
import { config } from '../config/environment.js';

export function Cache(prefix: string, ttl: number = config.cacheTTL) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;

        descriptor.value = async function (...args: any[]) {
            const redis = new RedisAdapter();

            const cacheKey = `${prefix}:${JSON.stringify(args)}`;

            try {
                const cached = await redis.get(cacheKey);
                if (cached) {
                    const parsedCache = JSON.parse(cached);
                    console.log(`Cache HIT: ${cacheKey}`);
                    return parsedCache;
                }
                console.log(`Cache MISS: ${cacheKey}`);
            } catch (error) {
                console.error(`Cache read error for ${cacheKey}:`, error);
            }

            const result = await originalMethod.apply(this, args);

            try {
                if (result !== null && result !== undefined) {
                    if (Array.isArray(result)) {
                        if (result.length > 0) {
                            await redis.set(cacheKey, JSON.stringify(result), ttl);
                            console.log(`Cached array (${result.length} items): ${cacheKey}`);
                        }
                    } else if (typeof result === 'object' && Object.keys(result).length > 0) {
                        await redis.set(cacheKey, JSON.stringify(result), ttl);
                        console.log(`Cached object: ${cacheKey}`);
                    } else if (typeof result !== 'object') {
                        await redis.set(cacheKey, JSON.stringify(result), ttl);
                        console.log(`Cached ?: ${cacheKey}`);
                    }
                }
            } catch (error) {
                console.error(`Cache write error for ${cacheKey}:`, error);
            }

            return result;
        };

        return descriptor;
    };
}

export function InvalidateCache(prefixes: string[]) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;

        descriptor.value = async function (...args: any[]) {
            const result = await originalMethod.apply(this, args);

            const redis = new RedisAdapter();

            for (const prefix of prefixes) {
                try {
                    const keys = await redis.keys(`${prefix}:*`);
                    if (keys.length > 0) {
                        for (const key of keys) {
                            await redis.del(key);
                        }
                        console.log(`🗑️ Invalidated ${keys.length} cache keys with prefix: ${prefix}`);
                    }
                } catch (error) {
                    console.error(`Cache invalidation error for prefix ${prefix}:`, error);
                }
            }

            return result;
        };

        return descriptor;
    };
}