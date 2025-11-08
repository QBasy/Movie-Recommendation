import { z } from 'zod';

export const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    username: z.string().min(3).max(30),
    firstName: z.string().optional(),
    lastName: z.string().optional()
});

export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string()
});

export const movieSchema = z.object({
    title: z.string().min(1),
    description: z.string().min(10),
    genres: z.array(z.string()).min(1),
    director: z.string().min(1),
    cast: z.array(z.string()),
    releaseYear: z.number().int().min(1900).max(2100),
    duration: z.number().int().positive(),
    rating: z.number().min(0).max(10).optional(),
    posterUrl: z.string().url().optional(),
    trailerUrl: z.string().url().optional(),
    price: z.number().positive()
});

export const interactionSchema = z.object({
    movieId: z.string(),
    type: z.enum(['view', 'like', 'dislike', 'purchase', 'rating', 'watchlist']),
    rating: z.number().min(1).max(10).optional()
});

export const updateUserPreferencesSchema = z.object({
    favoriteGenres: z.array(z.string()).optional(),
    dislikedGenres: z.array(z.string()).optional()
});