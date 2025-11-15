<script lang="ts">
    import { onMount } from 'svelte';
    import { moviesStore } from '$lib/stores/movies';
    import MovieCard from '$lib/components/MovieCard.svelte';
    import SearchBar from '$lib/components/SearchBar.svelte';
    import { Film } from 'lucide-svelte';
    import { api } from '$lib/api'

    onMount(async () => {
        await moviesStore.loadMovies();
    });

    $: watchlistIds = new Set($moviesStore.watchlist.map(w =>
        typeof w.movieId === 'string' ? w.movieId : w.movieId._id
    ));

    const genres = ['Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Romance', 'Thriller', 'Documentary'];
    let selectedGenre = '';

    async function filterByGenre(genre: string) {
        selectedGenre = genre;
        if (genre) {
            const { movies } = await api.getMovies();
        } else {
            await moviesStore.loadMovies();
        }
    }
</script>

<svelte:head>
    <title>Movies - MovieRec</title>
</svelte:head>

<div class="container mx-auto px-4 py-8 space-y-8">
    <div class="space-y-6">
        <div class="flex items-center gap-3">
            <Film size={40} class="text-primary-600" />
            <h1 class="text-4xl font-bold">All Movies</h1>
        </div>

        <SearchBar />

        <div class="flex flex-wrap gap-2">
            <button
                    on:click={() => filterByGenre('')}
                    class="px-4 py-2 rounded-lg transition {selectedGenre === '' ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}"
            >
                All
            </button>
            {#each genres as genre}
                <button
                        on:click={() => filterByGenre(genre)}
                        class="px-4 py-2 rounded-lg transition {selectedGenre === genre ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}"
                >
                    {genre}
                </button>
            {/each}
        </div>
    </div>

    {#if $moviesStore.loading}
        <div class="text-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p class="text-gray-600 mt-4">Loading movies...</p>
        </div>
    {:else if $moviesStore.movies.length === 0}
        <div class="text-center py-12">
            <p class="text-gray-600 text-lg">No movies found.</p>
        </div>
    {:else}
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {#each $moviesStore.movies as movie}
                <MovieCard {movie} inWatchlist={watchlistIds.has(movie._id)} />
            {/each}
        </div>
    {/if}
</div>