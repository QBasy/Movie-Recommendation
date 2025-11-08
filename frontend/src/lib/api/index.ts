import type { User, Movie, Interaction, AuthResponse } from '$lib/types';
import { browser } from '$app/environment';

const API_URL = 'http://localhost:3000/api';
console.log(`API URL: ${API_URL}`);

class ApiClient {
    private getHeaders(): HeadersInit {
        const token = browser ? localStorage.getItem('token') : null;
        return {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` })
        };
    }

    private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers: this.getHeaders()
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
            throw new Error(error.error?.message || error.message || `HTTP ${response.status}`);
        }

        return response.json();
    }

    async register(data: {
        email: string;
        password: string;
        username: string;
        firstName?: string;
        lastName?: string;
    }): Promise<AuthResponse> {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async login(email: string, password: string): Promise<AuthResponse> {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
    }

    async logout(): Promise<void> {
        await this.request('/auth/logout', { method: 'POST' });
    }

    async getMe(): Promise<{ user: User }> {
        return this.request('/auth/me');
    }

    async updatePreferences(preferences: {
        favoriteGenres?: string[];
        dislikedGenres?: string[];
    }): Promise<{ user: User }> {
        return this.request('/auth/preferences', {
            method: 'PUT',
            body: JSON.stringify(preferences)
        });
    }

    async getMovies(limit = 50, skip = 0): Promise<{ movies: Movie[] }> {
        return this.request(`/movies?limit=${limit}&skip=${skip}`);
    }

    async getMovie(id: string): Promise<{ movie: Movie }> {
        return this.request(`/movies/${id}`);
    }

    async searchMovies(query: string, limit = 20): Promise<{ movies: Movie[] }> {
        return this.request(`/movies/search?q=${encodeURIComponent(query)}&limit=${limit}`);
    }

    async getMoviesByGenre(genre: string, limit = 20): Promise<{ movies: Movie[] }> {
        return this.request(`/movies/genre/${genre}?limit=${limit}`);
    }

    async recordInteraction(data: {
        movieId: string;
        type: 'view' | 'like' | 'dislike' | 'purchase' | 'rating' | 'watchlist';
        rating?: number;
    }): Promise<void> {
        await this.request('/interactions', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async getInteractions(type?: string): Promise<{ interactions: Interaction[] }> {
        const query = type ? `?type=${type}` : '';
        return this.request(`/interactions${query}`);
    }

    async removeInteraction(movieId: string, type: string): Promise<void> {
        await this.request(`/interactions/${movieId}/${type}`, { method: 'DELETE' });
    }

    async getWatchlist(): Promise<{ watchlist: Interaction[] }> {
        return this.request('/watchlist');
    }

    async getPurchases(): Promise<{ purchases: Interaction[] }> {
        return this.request('/purchases');
    }

    async getRecommendations(
        strategy: 'user-based' | 'item-based' | 'hybrid' = 'hybrid',
        limit = 10
    ): Promise<{ recommendations: Movie[] }> {
        return this.request(`/recommendations?strategy=${strategy}&limit=${limit}`);
    }

    async getSimilarMovies(movieId: string, limit = 10): Promise<{ similar: Movie[] }> {
        return this.request(`/recommendations/similar/${movieId}?limit=${limit}`);
    }
}

export const api = new ApiClient();