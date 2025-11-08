import { writable } from 'svelte/store';
import type { Movie, Interaction } from '$lib/types';
import { api } from '$lib/api';

function createMoviesStore() {
    const { subscribe, set, update } = writable<{
        movies: Movie[];
        recommendations: Movie[];
        watchlist: Interaction[];
        loading: boolean;
    }>({
        movies: [],
        recommendations: [],
        watchlist: [],
        loading: false
    });

    return {
        subscribe,

        async loadMovies() {
            update(state => ({ ...state, loading: true }));
            try {
                const { movies } = await api.getMovies(50, 0);
                update(state => ({ ...state, movies, loading: false }));
            } catch (error) {
                console.error('Failed to load movies:', error);
                update(state => ({ ...state, loading: false }));
            }
        },

        async searchMovies(query: string) {
            update(state => ({ ...state, loading: true }));
            try {
                const { movies } = await api.searchMovies(query);
                update(state => ({ ...state, movies, loading: false }));
            } catch (error) {
                console.error('Failed to search movies:', error);
                update(state => ({ ...state, loading: false }));
            }
        },

        async loadRecommendations() {
            update(state => ({ ...state, loading: true }));
            try {
                const { recommendations } = await api.getRecommendations('hybrid', 12);
                update(state => ({ ...state, recommendations, loading: false }));
            } catch (error) {
                console.error('Failed to load recommendations:', error);
                update(state => ({ ...state, loading: false }));
            }
        },

        async loadWatchlist() {
            try {
                const { watchlist } = await api.getWatchlist();
                update(state => ({ ...state, watchlist }));
            } catch (error) {
                console.error('Failed to load watchlist:', error);
            }
        },

        async addToWatchlist(movieId: string) {
            await api.recordInteraction({ movieId, type: 'watchlist' });
            await this.loadWatchlist();
        },

        async removeFromWatchlist(movieId: string) {
            await api.removeInteraction(movieId, 'watchlist');
            await this.loadWatchlist();
        },

        async likeMovie(movieId: string) {
            await api.recordInteraction({ movieId, type: 'like' });
        },

        async rateMovie(movieId: string, rating: number) {
            await api.recordInteraction({ movieId, type: 'rating', rating });
        },

        async viewMovie(movieId: string) {
            await api.recordInteraction({ movieId, type: 'view' });
        }
    };
}

export const moviesStore = createMoviesStore();