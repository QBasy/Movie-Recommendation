<script lang="ts">
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { authStore } from '$lib/stores/auth';
    import { adminStore } from '$lib/stores/admin';
    import AdminMovieForm from '$lib/components/AdminMovieForm.svelte';
    import { Plus, Edit, Trash2, Upload, Shield, X } from 'lucide-svelte';
    import type { Movie } from '$lib/types';

    let showForm = false;
    let editingMovie: Movie | null = null;
    let showBulkUpload = false;
    let bulkData = '';

    onMount(async () => {
        const user = $authStore.user;
        if (!user || user.username !== 'QoidynBasy' || user.firstName !== 'SAYAT') {
            goto('/');
            return;
        }
        await adminStore.loadMovies();
    });

    function openCreateForm() {
        editingMovie = null;
        showForm = true;
    }

    function openEditForm(movie: Movie) {
        editingMovie = movie;
        showForm = true;
    }

    async function handleSubmit(data: any) {
        if (editingMovie) {
            await adminStore.updateMovie(editingMovie._id, data);
        } else {
            await adminStore.createMovie(data);
        }
        showForm = false;
        editingMovie = null;
    }

    async function handleDelete(movie: Movie) {
        if (confirm(`Are you sure you want to delete "${movie.title}"?`)) {
            await adminStore.deleteMovie(movie._id);
        }
    }

    async function handleBulkUpload() {
        try {
            const movies = JSON.parse(bulkData);
            if (!Array.isArray(movies)) {
                throw new Error('Data must be an array of movies');
            }
            await adminStore.bulkCreateMovies(movies);
            showBulkUpload = false;
            bulkData = '';
            alert('Movies uploaded successfully!');
        } catch (error: any) {
            alert('Error: ' + error.message);
        }
    }

    $: user = $authStore.user;
    $: isAdmin = user?.username === 'QoidynBasy' && user?.firstName === 'SAYAT';
</script>

<svelte:head>
    <title>Admin Panel - MovieRec</title>
</svelte:head>

{#if !isAdmin}
    <div class="container mx-auto px-4 py-12 text-center">
        <Shield size={64} class="text-red-500 mx-auto mb-4" />
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Access Denied</h1>
        <p class="text-gray-600">You don't have permission to access this page.</p>
    </div>
{:else}
    <div class="container mx-auto px-4 py-8">
        <div class="flex items-center justify-between mb-8">
            <div class="flex items-center gap-3">
                <Shield size={40} class="text-primary-600" />
                <div>
                    <h1 class="text-4xl font-bold">Admin Panel</h1>
                    <p class="text-gray-600">Manage movies and content</p>
                </div>
            </div>

            <div class="flex gap-3">
                <button
                        on:click={() => showBulkUpload = true}
                        class="px-4 py-2 rounded-lg font-medium transition-all duration-200 bg-gray-200 text-gray-800 hover:bg-gray-300 active:bg-gray-400 flex items-center gap-2"
                >
                    <Upload size={20} />
                    Bulk Upload
                </button>
                <button
                        on:click={openCreateForm}
                        class="px-4 py-2 rounded-lg font-medium transition-all duration-200 bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 flex items-center gap-2"
                >
                    <Plus size={20} />
                    Add Movie
                </button>
            </div>
        </div>

        {#if $adminStore.error}
            <div class="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
                {$adminStore.error}
            </div>
        {/if}

        {#if $adminStore.loading && $adminStore.movies.length === 0}
            <div class="text-center py-12">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                <p class="text-gray-600 mt-4">Loading movies...</p>
            </div>
        {:else if $adminStore.movies.length === 0}
            <div class="text-center py-12">
                <p class="text-gray-600 text-lg">No movies yet. Start by adding some!</p>
            </div>
        {:else}
            <div class="bg-white rounded-xl shadow-md overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead class="bg-gray-50 border-b">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Director</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Genres</th>
                            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                        {#each $adminStore.movies as movie}
                            <tr class="hover:bg-gray-50">
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div class="text-sm font-medium text-gray-900">{movie.title}</div>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div class="text-sm text-gray-600">{movie.director}</div>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div class="text-sm text-gray-600">{movie.releaseYear}</div>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div class="text-sm text-gray-600">{movie.rating.toFixed(1)}</div>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div class="text-sm text-gray-600">${movie.price}</div>
                                </td>
                                <td class="px-6 py-4">
                                    <div class="flex flex-wrap gap-1">
                                        {#each movie.genres.slice(0, 2) as genre}
                        <span class="px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs">
                          {genre}
                        </span>
                                        {/each}
                                        {#if movie.genres.length > 2}
                        <span class="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          +{movie.genres.length - 2}
                        </span>
                                        {/if}
                                    </div>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                            on:click={() => openEditForm(movie)}
                                            class="text-primary-600 hover:text-primary-900 mr-4"
                                    >
                                        <Edit size={18} />
                                    </button>
                                    <button
                                            on:click={() => handleDelete(movie)}
                                            class="text-red-600 hover:text-red-900"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        {/each}
                        </tbody>
                    </table>
                </div>
            </div>
        {/if}
    </div>

    {#if showForm}
        <AdminMovieForm
                movie={editingMovie}
                onSubmit={handleSubmit}
                onCancel={() => {
        showForm = false;
        editingMovie = null;
      }}
        />
    {/if}

    {#if showBulkUpload}
        <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div class="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div class="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
                    <h2 class="text-2xl font-bold">Bulk Upload Movies</h2>
                    <button on:click={() => showBulkUpload = false} class="p-2 hover:bg-gray-100 rounded-lg">
                        <X size={24} />
                    </button>
                </div>

                <div class="p-6 space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Paste JSON array of movies
                        </label>
                        <textarea
                                bind:value={bulkData}
                                rows="20"
                                placeholder={`[
    {
        "title": "Movie 1",
        "description": "...",
        "genres": ["Action"],
        "director": "...",
        "cast": ["..."],
        "releaseYear": 2024,
        "duration": 120,
        "rating": 8.5,
        "price": 9.99
    }
]`}
                                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
                        ></textarea>
                    </div>

                    <div class="flex gap-4">
                        <button
                                on:click={handleBulkUpload}
                                class="flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-200 bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800"
                        >
                            Upload Movies
                        </button>
                        <button
                                on:click={() => showBulkUpload = false}
                                class="px-6 py-2 rounded-lg font-medium transition-all duration-200 bg-gray-200 text-gray-800 hover:bg-gray-300 active:bg-gray-400"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    {/if}
{/if}
