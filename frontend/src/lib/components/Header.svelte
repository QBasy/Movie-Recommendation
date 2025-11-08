<script lang="ts">
    import { authStore, isAuthenticated } from '$lib/stores/auth';
    import { Film, User, LogOut, Home, Star, Shield } from 'lucide-svelte';
    import { goto } from '$app/navigation';

    async function handleLogout() {
        await authStore.logout();
        goto('/auth/login');
    }

    $: user = $authStore.user;
    $: isAdmin = user?.username === 'QoidynBasy' && user?.firstName === 'SAYAT';
</script>

<header class="bg-white shadow-sm sticky top-0 z-50">
    <nav class="container mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
            <a href="/" class="flex items-center gap-2 text-2xl font-bold text-primary-600">
                <Film size={32} />
                <span>MovieRec</span>
            </a>

            <div class="flex items-center gap-6">
                {#if $isAuthenticated}
                    <a href="/" class="flex items-center gap-2 text-gray-700 hover:text-primary-600 transition">
                        <Home size={20} />
                        <span class="hidden sm:inline">Home</span>
                    </a>

                    <a href="/movies" class="flex items-center gap-2 text-gray-700 hover:text-primary-600 transition">
                        <Film size={20} />
                        <span class="hidden sm:inline">Movies</span>
                    </a>

                    <a href="/recommendations" class="flex items-center gap-2 text-gray-700 hover:text-primary-600 transition">
                        <Star size={20} />
                        <span class="hidden sm:inline">Recommendations</span>
                    </a>

                    {#if isAdmin}
                        <a href="/admin" class="flex items-center gap-2 text-primary-600 hover:text-primary-700 transition">
                            <Shield size={20} />
                            <span class="hidden sm:inline">Admin</span>
                        </a>
                    {/if}

                    <a href="/profile" class="flex items-center gap-2 text-gray-700 hover:text-primary-600 transition">
                        <User size={20} />
                        <span class="hidden sm:inline">Profile</span>
                    </a>

                    <button
                            on:click={handleLogout}
                            class="flex items-center gap-2 text-gray-700 hover:text-red-600 transition"
                    >
                        <LogOut size={20} />
                        <span class="hidden sm:inline">Logout</span>
                    </button>
                {:else}
                    <a href="/auth/login" class="px-4 py-2 rounded-lg font-medium transition-all duration-200 bg-gray-200 text-gray-800 hover:bg-gray-300 active:bg-gray-400">Login</a>
                    <a href="/auth/register" class="px-4 py-2 rounded-lg font-medium transition-all duration-200 bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800">Sign Up</a>
                {/if}
            </div>
        </div>
    </nav>
</header>