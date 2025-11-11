<script lang="ts">
    import { onMount } from 'svelte';
    import { authStore } from '$lib/stores/auth';
    import { api } from '$lib/api';
    import { User, Bookmark, ShoppingBag } from 'lucide-svelte';
    import MovieCard from '$lib/components/MovieCard.svelte';
    import type { Interaction } from '$lib/types';

    let activeTab: 'watchlist' | 'purchases' = 'watchlist';
    let watchlist: Interaction[] = [];
    let purchases: Interaction[] = [];
    let watchlistIds: Set<string> = new Set();
    let loading = false;

    onMount(async () => {
        await loadData();
    });

    async function loadData() {
        loading = true;
        try {
            const [watchlistData, purchasesData] = await Promise.all([
                api.getWatchlist(),
                api.getPurchases()
            ]);

            watchlist = watchlistData.watchlist;
            purchases = purchasesData.purchases;

            watchlistIds = new Set(watchlist.map(w =>
                typeof w.movieId === 'string' ? w.movieId : w.movieId._id
            ));
        } finally {
            loading = false;
        }
    }

    $: user = $authStore.user;
    $: currentItems = activeTab === 'watchlist'
        ? watchlist.filter(w => typeof w.movieId !== 'string').map(w => w.movieId)
        : purchases.filter(p => typeof p.movieId !== 'string').map(p => p.movieId);
</script>

<svelte:head>
    <title>Profile - MovieRec</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
    <div class="bg-white rounded-xl shadow-md overflow-hidden p-8 mb-8">
        <div class="flex items-center gap-4 mb-6">
            <div class="w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center">
                <User size={40} class="text-white" />
            </div>
            <div>
                <h1 class="text-3xl font-bold">{user?.username}</h1>
                <p class="text-gray-600">{user?.email}</p>
                {#if user?.firstName || user?.lastName}
                    <p class="text-gray-600">{user.firstName} {user.lastName}</p>
                {/if}
            </div>
        </div>

        {#if user?.preferences}
            <div class="space-y-4">
                {#if user.preferences.favoriteGenres.length > 0}
                    <div>
                        <h3 class="font-semibold text-gray-700 mb-2">Favorite Genres</h3>
                        <div class="flex flex-wrap gap-2">
                            {#each user.preferences.favoriteGenres as genre}
                <span class="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                  {genre}
                </span>
                            {/each}
                        </div>
                    </div>
                {/if}
            </div>
        {/if}

        <div class="mt-6 grid grid-cols-2 gap-4">
            <div class="text-center p-4 bg-primary-50 rounded-lg">
                <div class="text-3xl font-bold text-primary-600">{watchlist.length}</div>
                <div class="text-gray-600">In Watchlist</div>
            </div>
            <div class="text-center p-4 bg-green-50 rounded-lg">
                <div class="text-3xl font-bold text-green-600">{purchases.length}</div>
                <div class="text-gray-600">Purchased</div>
            </div>
        </div>
    </div>

    <div class="space-y-6">
        <div class="flex gap-4 border-b">
            <button
                    on:click={() => activeTab = 'watchlist'}
                    class="px-4 py-2 font-medium transition {activeTab === 'watchlist' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-600 hover:text-gray-900'}"
            >
                <div class="flex items-center gap-2">
                    <Bookmark size={20} />
                    <span>Watchlist ({watchlist.length})</span>
                </div>
            </button>

            <button
                    on:click={() => activeTab = 'purchases'}
                    class="px-4 py-2 font-medium transition {activeTab === 'purchases' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-600 hover:text-gray-900'}"
            >
                <div class="flex items-center gap-2">
                    <ShoppingBag size={20} />
                    <span>Purchased ({purchases.length})</span>
                </div>
            </button>
        </div>

        {#if loading}
            <div class="text-center py-12">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            </div>
        {:else if currentItems.length === 0}
            <div class="text-center py-12">
                {#if activeTab === 'watchlist'}
                    <Bookmark size={48} class="text-gray-400 mx-auto mb-4" />
                    <p class="text-gray-600 text-lg">Your watchlist is empty</p>
                    <p class="text-gray-500 mt-2">Start adding movies to watch later!</p>
                {:else}
                    <ShoppingBag size={48} class="text-gray-400 mx-auto mb-4" />
                    <p class="text-gray-600 text-lg">No purchases yet</p>
                    <p class="text-gray-500 mt-2">Browse our collection and buy your favorite movies!</p>
                {/if}
            </div>
        {:else}
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {#each currentItems as movie}
                    <MovieCard {movie} inWatchlist={watchlistIds.has(movie._id)} />
                {/each}
            </div>
        {/if}
    </div>
</div>