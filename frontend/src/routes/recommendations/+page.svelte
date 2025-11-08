<script lang="ts">
    import { onMount } from 'svelte';
    import { moviesStore } from '$lib/stores/movies';
    import RecommendationList from '$lib/components/RecommendationList.svelte';

    onMount(async () => {
        await moviesStore.loadRecommendations();
    });
</script>

<svelte:head>
    <title>Recommendations - MovieRec</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
    <RecommendationList />
</div>