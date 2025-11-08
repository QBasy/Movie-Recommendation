<script lang="ts">
    import type { Movie } from '$lib/types';
    import { Heart, Star, Clock, Plus, Check } from 'lucide-svelte';
    import { moviesStore } from '$lib/stores/movies';
    import { goto } from '$app/navigation';

    export let movie: Movie;
    export let inWatchlist = false;

    async function toggleWatchlist() {
        if (inWatchlist) {
            await moviesStore.removeFromWatchlist(movie._id);
        } else {
            await moviesStore.addToWatchlist(movie._id);
        }
    }

    async function handleLike() {
        await moviesStore.likeMovie(movie._id);
    }

    function viewMovie() {
        moviesStore.viewMovie(movie._id);
        goto(`/movies/${movie._id}`);
    }
</script>

<div class="bg-white rounded-xl shadow-md overflow-hidden transition-transform duration-200 hover:shadow-xl group cursor-pointer" on:click={viewMovie} on:keypress={viewMovie} role="button" tabindex="0">
    <div class="relative h-64 bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
        {#if movie.posterUrl}
            <img src={movie.posterUrl} alt={movie.title} class="w-full h-full object-cover" />
        {:else}
            <span class="text-white text-6xl font-bold opacity-20">{movie.title[0]}</span>
        {/if}

        <div class="absolute top-2 right-2 flex gap-2">
            <button
                    on:click|stopPropagation={toggleWatchlist}
                    class="p-2 bg-white/90 rounded-full hover:bg-white transition"
            >
                {#if inWatchlist}
                    <Check size={18} class="text-primary-600" />
                {:else}
                    <Plus size={18} class="text-gray-700" />
                {/if}
            </button>

            <button
                    on:click|stopPropagation={handleLike}
                    class="p-2 bg-white/90 rounded-full hover:bg-white transition"
            >
                <Heart size={18} class="text-red-500" />
            </button>
        </div>
    </div>

    <div class="p-4">
        <h3 class="text-xl font-bold mb-2 line-clamp-1 group-hover:text-primary-600 transition">
            {movie.title}
        </h3>

        <p class="text-gray-600 text-sm mb-3 line-clamp-2">
            {movie.description}
        </p>

        <div class="flex items-center gap-4 text-sm text-gray-500 mb-3">
            <div class="flex items-center gap-1">
                <Star size={16} class="text-yellow-500 fill-yellow-500" />
                <span>{movie.rating.toFixed(1)}</span>
            </div>

            <div class="flex items-center gap-1">
                <Clock size={16} />
                <span>{movie.duration} min</span>
            </div>

            <span>{movie.releaseYear}</span>
        </div>

        <div class="flex flex-wrap gap-2 mb-3">
            {#each movie.genres.slice(0, 3) as genre}
        <span class="px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs">
          {genre}
        </span>
            {/each}
        </div>

        <div class="flex items-center justify-between">
            <span class="text-2xl font-bold text-primary-600">${movie.price}</span>
        </div>
    </div>
</div>