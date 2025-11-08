import type { Movie } from '$lib/types';
import { browser } from '$app/environment';

const API_URL = 'http://localhost:3000/api';
console.log(`API URL: ${API_URL}`);

class AdminApiClient {
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

    async createMovie(data: Omit<Movie, '_id' | 'createdAt' | 'updatedAt'>): Promise<{ movie: Movie }> {
        return this.request('/movies', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async updateMovie(id: string, data: Partial<Omit<Movie, '_id' | 'createdAt' | 'updatedAt'>>): Promise<{ movie: Movie }> {
        return this.request(`/movies/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async deleteMovie(id: string): Promise<{ message: string }> {
        return this.request(`/movies/${id}`, {
            method: 'DELETE'
        });
    }

    async bulkCreateMovies(movies: Omit<Movie, '_id' | 'createdAt' | 'updatedAt'>[]): Promise<{ count: number }> {
        const results = await Promise.all(
            movies.map(movie => this.createMovie(movie))
        );
        return { count: results.length };
    }
}

export const adminApi = new AdminApiClient();