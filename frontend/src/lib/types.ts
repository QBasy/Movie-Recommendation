export interface User {
    _id: string;
    email: string;
    username: string;
    firstName?: string;
    lastName?: string;
    preferences: {
        favoriteGenres: string[];
        dislikedGenres: string[];
    };
    createdAt: string;
    updatedAt: string;
}

export interface Movie {
    _id: string;
    title: string;
    description: string;
    genres: string[];
    director: string;
    cast: string[];
    releaseYear: number;
    duration: number;
    rating: number;
    posterUrl?: string;
    trailerUrl?: string;
    price: number;
    createdAt: string;
    updatedAt: string;
}

export interface Interaction {
    _id: string;
    userId: string;
    movieId: Movie | string;
    type: 'view' | 'like' | 'dislike' | 'purchase' | 'rating' | 'watchlist';
    rating?: number;
    timestamp: string;
}

export interface AuthResponse {
    user: User;
    token: string;
}