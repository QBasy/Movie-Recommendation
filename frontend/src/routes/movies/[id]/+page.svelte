<script lang="ts">
    import { page } from '$app/stores';
    import { onMount } from 'svelte';
    import { api } from '$lib/api';
    import { moviesStore } from '$lib/stores/movies';
    import type { Movie } from '$lib/types';
    import { Star, Clock, Calendar, Heart, Plus, ShoppingCart, Check } from 'lucide-svelte';

    let movie: Movie | null = null;
    let similarMovies: Movie[] = [];
    let loading = true;
    let userRating = 0;
    let isPurchased = false;
    let purchasing = false;

    onMount(async () => {
        const id = $page.params.id;

        try {
            const [movieData, similarData, purchases] = await Promise.all([
                api.getMovie(id),
                api.getSimilarMovies(id, 6),
                api.getPurchases()
            ]);

            movie = movieData.movie;
            similarMovies = similarData.similar;
            isPurchased = purchases.purchases.some(p => {
                const movieId = typeof p.movieId === 'string' ? p.movieId : p.movieId._id;
                return movieId === id;
            });

            await moviesStore.viewMovie(id);
        } catch (error) {
            console.error('Failed to load movie:', error);
        } finally {
            loading = false;
        }
    });

    async function handleRate() {
        if (movie && userRating > 0) {
            await moviesStore.rateMovie(movie._id, userRating);
            alert('Rating submitted!');
        }
    }

    async function handleAddToWatchlist() {
        if (movie) {
            await moviesStore.addToWatchlist(movie._id);
        }
    }

    async function handleLike() {
        if (movie) {
            await moviesStore.likeMovie(movie._id);
        }
    }

    async function handlePurchase() {
        if (movie && !isPurchased) {
            purchasing = true;
            try {
                await api.recordInteraction({
                    movieId: movie._id,
                    type: 'purchase'
                });
                isPurchased = true;
                alert('Purchase successful! Enjoy your movie!');
            } catch (error) {
                alert('Purchase failed. Please try again.');
            } finally {
                purchasing = false;
            }
        }
    }
</script>

<svelte:head>
    <title>{movie?.title || 'Movie'} - MovieRec</title>
</svelte:head>

{#if loading}
    <div class="flex items-center justify-center min-h-[60vh]">
        <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600"></div>
    </div>
{:else if movie}
    <div class="min-h-screen bg-gray-50">
        <div class="relative h-96 bg-gradient-to-br from-primary-400 to-primary-600">
            {#if movie.posterUrl}
                <img src={movie.posterUrl} alt={movie.title} class="w-full h-full object-cover opacity-30" />
            {/if}
            <div class="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
        </div>

        <div class="container mx-auto px-4 -mt-32 relative z-10">
            <div class="bg-white rounded-xl shadow-md overflow-hidden p-8 space-y-6">
                <div class="flex flex-col md:flex-row gap-8">
                    <div class="flex-1 space-y-4">
                        <h1 class="text-4xl font-bold text-gray-900">{movie.title}</h1>

                        <div class="flex flex-wrap items-center gap-4 text-gray-600">
                            <div class="flex items-center gap-2">
                                <Star size={20} class="text-yellow-500 fill-yellow-500" />
                                <span class="text-lg font-semibold">{movie.rating.toFixed(1)}/10</span>
                            </div>

                            <div class="flex items-center gap-2">
                                <Clock size={20} />
                                <span>{movie.duration} minutes</span>
                            </div>

                            <div class="flex items-center gap-2">
                                <Calendar size={20} />
                                <span>{movie.releaseYear}</span>
                            </div>
                        </div>

                        <div class="flex flex-wrap gap-2">
                            {#each movie.genres as genre}
                <span class="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                  {genre}
                </span>
                            {/each}
                        </div>

                        <p class="text-gray-700 text-lg leading-relaxed">{movie.description}</p>

                        <div class="space-y-2">
                            <p class="text-gray-600"><strong>Director:</strong> {movie.director}</p>
                            <p class="text-gray-600"><strong>Cast:</strong> {movie.cast.join(', ')}</p>
                        </div>
                    </div>

                    <div class="md:w-80 space-y-4">
                        <div class="bg-white rounded-xl shadow-md overflow-hidden p-6 bg-primary-50">
                            <div class="text-4xl font-bold text-primary-600 mb-4">${movie.price}</div>

                            <div class="space-y-3">
                                {#if isPurchased}
                                    <div class="px-4 py-3 rounded-lg bg-green-100 text-green-800 font-medium flex items-center justify-center gap-2">
                                        <Check size={20} />
                                        Already Purchased
                                    </div>
                                {:else}
                                    <button
                                            on:click={handlePurchase}
                                            disabled={purchasing}
                                            class="px-4 py-2 rounded-lg font-medium transition-all duration-200 bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 w-full flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        <ShoppingCart size={20} />
                                        {purchasing ? 'Processing...' : 'Buy Now'}
                                    </button>
                                {/if}

                                <button
                                        on:click={handleAddToWatchlist}
                                        class="px-4 py-2 rounded-lg font-medium transition-all duration-200 bg-gray-200 text-gray-800 hover:bg-gray-300 active:bg-gray-400 w-full flex items-center justify-center gap-2"
                                >
                                    <Plus size={20} />
                                    Add to Watchlist
                                </button>

                                <button
                                        on:click={handleLike}
                                        class="px-4 py-2 rounded-lg font-medium transition-all duration-200 bg-gray-200 text-gray-800 hover:bg-gray-300 active:bg-gray-400 w-full flex items-center justify-center gap-2"
                                >
                                    <Heart size={20} />
                                    Like
                                </button>
                            </div>
                        </div>

                        <div class="bg-white rounded-xl shadow-md overflow-hidden p-6">
                            <h3 class="font-bold text-lg mb-3">Rate this movie</h3>
                            <div class="flex gap-2 mb-3">
                                {#each Array(10) as _, i}
                                    <button
                                            on:click={() => userRating = i + 1}
                                            class="w-8 h-8 rounded flex items-center justify-center transition {userRating >= i + 1 ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}"
                                    >
                                        {i + 1}
                                    </button>
                                {/each}
                            </div>
                            <button on:click={handleRate} class="px-4 py-2 rounded-lg font-medium transition-all duration-200 bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 w-full" disabled={userRating === 0}>
                                Submit Rating
                            </button>
                        </div>
                    </div>
                </div>

                {#if similarMovies.length > 0}
                    <div class="pt-8 border-t">
                        <h2 class="text-2xl font-bold mb-6">Similar Movies</h2>
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {#each similarMovies as similar}
                                <a href="/movies/{similar._id}" class="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition">
                                    <div class="h-48 bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                                        {#if similar.posterUrl}
                                            <img src={similar.posterUrl} alt={similar.title} class="w-full h-full object-cover" />
                                        {:else}
                                            <span class="text-white text-4xl font-bold opacity-20">{similar.title[0]}</span>
                                        {/if}
                                    </div>
                                    <div class="p-4">
                                        <h3 class="font-bold text-lg mb-2 line-clamp-1">{similar.title}</h3>
                                        <div class="flex items-center gap-2 text-sm text-gray-600">
                                            <Star size={14} class="text-yellow-500 fill-yellow-500" />
                                            <span>{similar.rating.toFixed(1)}</span>
                                            <span>•</span>
                                            <span>{similar.releaseYear}</span>
                                        </div>
                                    </div>
                                </a>
                            {/each}
                        </div>
                    </div>
                {/if}
            </div>
        </div>
    </div>
{:else}
    <div class="container mx-auto px-4 py-12 text-center">
        <h1 class="text-2xl font-bold text-gray-900">Movie not found</h1>
        <a href="/movies" class="text-primary-600 hover:text-primary-700 mt-4 inline-block">
            Back to movies
        </a>
    </div>
{/if}