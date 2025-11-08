<script lang="ts">
    import '../app.css';
    import { onMount } from 'svelte';
    import { authStore } from '$lib/stores/auth';
    import { moviesStore } from '$lib/stores/movies';
    import Header from '$lib/components/Header.svelte';
    import { HeartIcon } from "lucide-svelte";

    onMount(async () => {
        try {
            await authStore.init();
            if ($authStore.user) {
                await moviesStore.loadWatchlist();
            }
        } catch (err) {
            console.error(err);
        }
    });
</script>

<div class="min-h-screen flex flex-col">
    <Header />

    <main class="flex-1">
        {#if $authStore.loading}
            <div class="flex items-center justify-center min-h-[60vh]">
                <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600"></div>
            </div>
        {:else}
            <slot />
        {/if}
    </main>

    <footer class="bg-gray-900 text-white py-8 mt-12">
        <div class="container mx-auto px-4 text-center">
            <p class="flex items-center justify-center gap-1">
                Made With
                    <HeartIcon class="text-red-500 w-5 h-5" />
                By SAYAT Adilkhanov FROM CSE-2507M
            </p>
        </div>
    </footer>
</div>
