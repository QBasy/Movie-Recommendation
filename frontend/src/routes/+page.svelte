<script lang="ts">
    import { onMount } from 'svelte';
    import { isAuthenticated } from '$lib/stores/auth';
    import { moviesStore } from '$lib/stores/movies';
    import RecommendationList from '$lib/components/RecommendationList.svelte';
    import MovieCard from '$lib/components/MovieCard.svelte';
    import SearchBar from '$lib/components/SearchBar.svelte';
    import { TrendingUp, Film } from 'lucide-svelte';

    onMount(async () => {
        await moviesStore.loadMovies();
        if ($isAuthenticated) {
            await moviesStore.loadRecommendations();
        }
    });

    $: watchlistIds = new Set($moviesStore.watchlist.map(w =>
        typeof w.movieId === 'string' ? w.movieId : w.movieId._id
    ));
</script>

<svelte:head>
    <title>MovieRec - Your Personal Movie Recommendation System</title>
</svelte:head>

<div class="container mx-auto px-4 py-8 space-y-12">
    <section class="text-center space-y-6">
        <h1 class="text-5xl font-bold text-gray-900">
            Discover Your Next Favorite Movie
        </h1>
        <p class="text-xl text-gray-600 max-w-2xl mx-auto">
            Personalized recommendations powered by advanced machine learning algorithms
        </p>
        <div class="pt-4">
            <SearchBar />
        </div>
    </section>

    {#if $isAuthenticated}
        <section>
            <RecommendationList />
        </section>
    {/if}

    <section class="space-y-6">
        <div class="flex items-center gap-3">
            <TrendingUp size={32} class="text-primary-600" />
            <h2 class="text-3xl font-bold">Popular Movies</h2>
        </div>

        {#if $moviesStore.loading}
            <div class="text-center py-12">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            </div>
        {:else}
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {#each $moviesStore.movies.slice(0, 8) as movie}
                    <MovieCard {movie} inWatchlist={watchlistIds.has(movie._id)} />
                {/each}
            </div>
        {/if}
    </section>
</div>
