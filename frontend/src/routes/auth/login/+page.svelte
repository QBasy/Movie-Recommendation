<script lang="ts">
    import { authStore } from '$lib/stores/auth';
    import { goto } from '$app/navigation';
    import { LogIn } from 'lucide-svelte';

    let email = '';
    let password = '';
    let error = '';
    let loading = false;

    async function handleSubmit(e: Event) {
        e.preventDefault();
        error = '';
        loading = true;

        try {
            await authStore.login(email, password);
            goto('/');
        } catch (err: any) {
            error = err.message || 'Login failed';
        } finally {
            loading = false;
        }
    }
</script>

<svelte:head>
    <title>Login - MovieRec</title>
</svelte:head>

<div class="min-h-[80vh] flex items-center justify-center px-4">
    <div class="w-full max-w-md">
        <div class="bg-white rounded-xl shadow-md overflow-hidden p-8">
            <div class="flex items-center justify-center mb-8">
                <LogIn size={48} class="text-primary-600" />
            </div>

            <h2 class="text-3xl font-bold text-center mb-8">Welcome Back</h2>

            {#if error}
                <div class="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
                    {error}
                </div>
            {/if}

            <form on:submit={handleSubmit} class="space-y-6">
                <div>
                    <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
                        Email
                    </label>
                    <input
                            id="email"
                            type="email"
                            bind:value={email}
                            required
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="you@example.com"
                    />
                </div>

                <div>
                    <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
                        Password
                    </label>
                    <input
                            id="password"
                            type="password"
                            bind:value={password}
                            required
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="••••••••"
                    />
                </div>

                <button
                        type="submit"
                        disabled={loading}
                        class="px-4 py-2 rounded-lg font-medium transition-all duration-200 bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 w-full disabled:opacity-50"
                >
                    {loading ? 'Logging in...' : 'Login'}
                </button>
            </form>

            <p class="text-center text-gray-600 mt-6">
                Don't have an account?
                <a href="/auth/register" class="text-primary-600 hover:text-primary-700 font-medium">
                    Sign up
                </a>
            </p>
        </div>
    </div>
</div>