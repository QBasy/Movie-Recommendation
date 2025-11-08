<script lang="ts">
    import { moviesStore } from '$lib/stores/movies';
    import MovieCard from './MovieCard.svelte';
    import { Sparkles } from 'lucide-svelte';

    $: watchlistIds = new Set($moviesStore.watchlist.map(w =>
        typeof w.movieId === 'string' ? w.movieId : w.movieId._id
    ));
</script>

<div class="space-y-6">
    <div class="flex items-center gap-3">
        <Sparkles size={32} class="text-primary-600" />
        <h2 class="text-3xl font-bold">Recommended for You</h2>
    </div>

    {#if $moviesStore.loading}
        <div class="text-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p class="text-gray-600 mt-4">Loading recommendations...</p>
        </div>
    {:else if $moviesStore.recommendations.length === 0}
        <div class="text-center py-12">
            <p class="text-gray-600 text-lg">No recommendations yet.</p>
            <p class="text-gray-500 mt-2">Start watching and rating movies to get personalized recommendations!</p>
        </div>
    {:else}
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {#each $moviesStore.recommendations as movie}
                <MovieCard {movie} inWatchlist={watchlistIds.has(movie._id)} />
            {/each}
        </div>
    {/if}
</div>