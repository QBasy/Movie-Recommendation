import { writable } from 'svelte/store';
import type { Movie } from '$lib/types';
import { adminApi } from '$lib/api/adminApi';
import { api } from '$lib/api';

function createAdminStore() {
    const { subscribe, set, update } = writable<{
        movies: Movie[];
        loading: boolean;
        error: string | null;
    }>({
        movies: [],
        loading: false,
        error: null
    });

    return {
        subscribe,

        async loadMovies() {
            update(state => ({ ...state, loading: true, error: null }));
            try {
                const { movies } = await api.getMovies(100, 0);
                update(state => ({ ...state, movies, loading: false }));
            } catch (error: any) {
                update(state => ({ ...state, loading: false, error: error.message }));
            }
        },

        async createMovie(movie: Omit<Movie, '_id' | 'createdAt' | 'updatedAt'>) {
            update(state => ({ ...state, loading: true, error: null }));
            try {
                const { movie: newMovie } = await adminApi.createMovie(movie);
                update(state => ({
                    ...state,
                    movies: [...state.movies, newMovie],
                    loading: false
                }));
                return newMovie;
            } catch (error: any) {
                update(state => ({ ...state, loading: false, error: error.message }));
                throw error;
            }
        },

        async updateMovie(id: string, data: Partial<Omit<Movie, '_id' | 'createdAt' | 'updatedAt'>>) {
            update(state => ({ ...state, loading: true, error: null }));
            try {
                const { movie: updatedMovie } = await adminApi.updateMovie(id, data);
                update(state => ({
                    ...state,
                    movies: state.movies.map(m => m._id === id ? updatedMovie : m),
                    loading: false
                }));
                return updatedMovie;
            } catch (error: any) {
                update(state => ({ ...state, loading: false, error: error.message }));
                throw error;
            }
        },

        async deleteMovie(id: string) {
            update(state => ({ ...state, loading: true, error: null }));
            try {
                await adminApi.deleteMovie(id);
                update(state => ({
                    ...state,
                    movies: state.movies.filter(m => m._id !== id),
                    loading: false
                }));
            } catch (error: any) {
                update(state => ({ ...state, loading: false, error: error.message }));
                throw error;
            }
        },

        async bulkCreateMovies(movies: Omit<Movie, '_id' | 'createdAt' | 'updatedAt'>[]) {
            update(state => ({ ...state, loading: true, error: null }));
            try {
                const result = await adminApi.bulkCreateMovies(movies);
                await this.loadMovies();
                return result;
            } catch (error: any) {
                update(state => ({ ...state, loading: false, error: error.message }));
                throw error;
            }
        }
    };
}

export const adminStore = createAdminStore();