export const config = {
    port: parseInt(process.env.PORT || '3000'),
    mongoUri: process.env.MONGO_URI || 'mongodb://admin:password123@localhost:27017/movie_recommendation?authSource=admin',
    redisHost: process.env.REDIS_HOST || 'localhost',
    redisPort: parseInt(process.env.REDIS_PORT || '6379'),
    jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
    jwtExpiresIn: 60 * 60 * 24 * 7,
    sessionTTL: 60 * 60 * 24 * 7,
    cacheTTL: 60 * 10,
    bcryptRounds: 10
};