<script lang="ts">
    import { Search } from 'lucide-svelte';
    import { moviesStore } from '$lib/stores/movies';

    let query = '';

    async function handleSearch(e: Event) {
        e.preventDefault();
        if (query.trim()) {
            await moviesStore.searchMovies(query);
        } else {
            await moviesStore.loadMovies();
        }
    }
</script>

<form on:submit={handleSearch} class="w-full max-w-2xl mx-auto">
    <div class="relative">
        <input
                type="text"
                bind:value={query}
                placeholder="Search for movies..."
                class="w-full px-4 py-2 pl-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
        <button
                type="submit"
                class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary-600 transition"
        >
            <Search size={20} />
        </button>
    </div>
</form>