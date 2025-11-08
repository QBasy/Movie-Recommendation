<script lang="ts">
    import { X } from 'lucide-svelte';
    import type { Movie } from '$lib/types';

    export let movie: Movie | null = null;
    export let onSubmit: (data: any) => Promise<void>;
    export let onCancel: () => void;

    let formData = {
        title: movie?.title || '',
        description: movie?.description || '',
        genres: movie?.genres.join(', ') || '',
        director: movie?.director || '',
        cast: movie?.cast.join(', ') || '',
        releaseYear: movie?.releaseYear || new Date().getFullYear(),
        duration: movie?.duration || 0,
        rating: movie?.rating || 0,
        posterUrl: movie?.posterUrl || '',
        trailerUrl: movie?.trailerUrl || '',
        price: movie?.price || 0
    };

    let loading = false;
    let error = '';

    async function handleSubmit(e: Event) {
        e.preventDefault();
        error = '';
        loading = true;

        try {
            const data = {
                ...formData,
                genres: formData.genres.split(',').map(g => g.trim()).filter(Boolean),
                cast: formData.cast.split(',').map(c => c.trim()).filter(Boolean)
            };

            await onSubmit(data);
        } catch (err: any) {
            error = err.message;
        } finally {
            loading = false;
        }
    }
</script>

<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
            <h2 class="text-2xl font-bold">{movie ? 'Edit Movie' : 'Add New Movie'}</h2>
            <button on:click={onCancel} class="p-2 hover:bg-gray-100 rounded-lg">
                <X size={24} />
            </button>
        </div>

        <form on:submit={handleSubmit} class="p-6 space-y-4">
            {#if error}
                <div class="bg-red-50 text-red-600 p-4 rounded-lg">
                    {error}
                </div>
            {/if}

            <div>
                <label for="title" class="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                </label>
                <input
                        id="title"
                        type="text"
                        bind:value={formData.title}
                        required
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
            </div>

            <div>
                <label for="description" class="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                </label>
                <textarea
                        id="description"
                        bind:value={formData.description}
                        required
                        rows="4"
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                ></textarea>
            </div>

            <div>
                <label for="genres" class="block text-sm font-medium text-gray-700 mb-2">
                    Genres (comma separated) *
                </label>
                <input
                        id="genres"
                        type="text"
                        bind:value={formData.genres}
                        required
                        placeholder="Action, Comedy, Drama"
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
            </div>

            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label for="director" class="block text-sm font-medium text-gray-700 mb-2">
                        Director *
                    </label>
                    <input
                            id="director"
                            type="text"
                            bind:value={formData.director}
                            required
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                </div>

                <div>
                    <label for="releaseYear" class="block text-sm font-medium text-gray-700 mb-2">
                        Release Year *
                    </label>
                    <input
                            id="releaseYear"
                            type="number"
                            bind:value={formData.releaseYear}
                            required
                            min="1900"
                            max="2100"
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                </div>
            </div>

            <div>
                <label for="cast" class="block text-sm font-medium text-gray-700 mb-2">
                    Cast (comma separated) *
                </label>
                <input
                        id="cast"
                        type="text"
                        bind:value={formData.cast}
                        required
                        placeholder="Actor 1, Actor 2, Actor 3"
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
            </div>

            <div class="grid grid-cols-3 gap-4">
                <div>
                    <label for="duration" class="block text-sm font-medium text-gray-700 mb-2">
                        Duration (min) *
                    </label>
                    <input
                            id="duration"
                            type="number"
                            bind:value={formData.duration}
                            required
                            min="1"
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                </div>

                <div>
                    <label for="rating" class="block text-sm font-medium text-gray-700 mb-2">
                        Rating (0-10)
                    </label>
                    <input
                            id="rating"
                            type="number"
                            bind:value={formData.rating}
                            min="0"
                            max="10"
                            step="0.1"
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                </div>

                <div>
                    <label for="price" class="block text-sm font-medium text-gray-700 mb-2">
                        Price ($) *
                    </label>
                    <input
                            id="price"
                            type="number"
                            bind:value={formData.price}
                            required
                            min="0"
                            step="0.01"
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                </div>
            </div>

            <div>
                <label for="posterUrl" class="block text-sm font-medium text-gray-700 mb-2">
                    Poster URL
                </label>
                <input
                        id="posterUrl"
                        type="url"
                        bind:value={formData.posterUrl}
                        placeholder="https://example.com/poster.jpg"
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
            </div>

            <div>
                <label for="trailerUrl" class="block text-sm font-medium text-gray-700 mb-2">
                    Trailer URL
                </label>
                <input
                        id="trailerUrl"
                        type="url"
                        bind:value={formData.trailerUrl}
                        placeholder="https://youtube.com/watch?v=..."
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
            </div>

            <div class="flex gap-4 pt-4">
                <button
                        type="submit"
                        disabled={loading}
                        class="flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-200 bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 disabled:opacity-50"
                >
                    {loading ? 'Saving...' : movie ? 'Update Movie' : 'Create Movie'}
                </button>
                <button
                        type="button"
                        on:click={onCancel}
                        class="px-6 py-2 rounded-lg font-medium transition-all duration-200 bg-gray-200 text-gray-800 hover:bg-gray-300 active:bg-gray-400"
                >
                    Cancel
                </button>
            </div>
        </form>
    </div>
</div>