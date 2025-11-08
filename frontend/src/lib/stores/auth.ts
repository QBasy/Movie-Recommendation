import { writable, derived } from 'svelte/store';
import type { User } from '$lib/types';
import { api } from '$lib/api';
import { browser } from '$app/environment';

function createAuthStore() {
    const { subscribe, set, update } = writable<{
        user: User | null;
        loading: boolean;
    }>({
        user: null,
        loading: true
    });

    return {
        subscribe,

        async init() {
            if (!browser) {
                set({ user: null, loading: false });
                return;
            }

            const token = localStorage.getItem('token');
            if (!token) {
                update(state => ({ ...state, loading: false }));
                return;
            }



            try {
                const { user } = await api.getMe();
                set({ user, loading: false });
            } catch (error) {
                localStorage.removeItem('token');
                set({ user: null, loading: false });
            }
        },

        async login(email: string, password: string) {
            const { user, token } = await api.login(email, password);
            if (browser) {
                localStorage.setItem('token', token);
            }
            set({ user, loading: false });
        },

        async register(data: {
            email: string;
            password: string;
            username: string;
            firstName?: string;
            lastName?: string;
        }) {
            const { user, token } = await api.register(data);
            if (browser) {
                localStorage.setItem('token', token);
            }
            set({ user, loading: false });
        },

        async logout() {
            try {
                await api.logout();
            } catch (error) {
                console.error('Logout error:', error);
            }
            if (browser) {
                localStorage.removeItem('token');
            }
            set({ user: null, loading: false });
        },

        async updatePreferences(preferences: {
            favoriteGenres?: string[];
            dislikedGenres?: string[];
        }) {
            const { user } = await api.updatePreferences(preferences);
            update(state => ({ ...state, user }));
        }
    };
}

export const authStore = createAuthStore();

export const isAuthenticated = derived(
    authStore,
    $auth => $auth.user !== null
);