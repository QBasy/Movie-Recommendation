<script lang="ts">
    import { authStore } from '$lib/stores/auth';
    import { goto } from '$app/navigation';
    import { UserPlus } from 'lucide-svelte';

    let formData = {
        email: '',
        password: '',
        username: '',
        firstName: '',
        lastName: ''
    };
    let confirmPassword = '';
    let error = '';
    let loading = false;

    async function handleSubmit(e: Event) {
        e.preventDefault();
        error = '';

        if (formData.password !== confirmPassword) {
            error = 'Passwords do not match';
            return;
        }

        loading = true;

        try {
            await authStore.register(formData);
            goto('/');
        } catch (err: any) {
            error = err.message || 'Registration failed';
        } finally {
            loading = false;
        }
    }
</script>

<svelte:head>
    <title>Sign Up - MovieRec</title>
</svelte:head>

<div class="min-h-[80vh] flex items-center justify-center px-4 py-12">
    <div class="w-full max-w-md">
        <div class="bg-white rounded-xl shadow-md overflow-hidden p-8">
            <div class="flex items-center justify-center mb-8">
                <UserPlus size={48} class="text-primary-600" />
            </div>

            <h2 class="text-3xl font-bold text-center mb-8">Create Account</h2>

            {#if error}
                <div class="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
                    {error}
                </div>
            {/if}

            <form on:submit={handleSubmit} class="space-y-4">
                <div>
                    <label for="username" class="block text-sm font-medium text-gray-700 mb-2">
                        Username
                    </label>
                    <input
                            id="username"
                            type="text"
                            bind:value={formData.username}
                            required
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="johndoe"
                    />
                </div>

                <div>
                    <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
                        Email
                    </label>
                    <input
                            id="email"
                            type="email"
                            bind:value={formData.email}
                            required
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="you@example.com"
                    />
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label for="firstName" class="block text-sm font-medium text-gray-700 mb-2">
                            First Name
                        </label>
                        <input
                                id="firstName"
                                type="text"
                                bind:value={formData.firstName}
                                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                placeholder="John"
                        />
                    </div>

                    <div>
                        <label for="lastName" class="block text-sm font-medium text-gray-700 mb-2">
                            Last Name
                        </label>
                        <input
                                id="lastName"
                                type="text"
                                bind:value={formData.lastName}
                                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                placeholder="Doe"
                        />
                    </div>
                </div>

                <div>
                    <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
                        Password
                    </label>
                    <input
                            id="password"
                            type="password"
                            bind:value={formData.password}
                            required
                            minlength="6"
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="••••••••"
                    />
                </div>

                <div>
                    <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-2">
                        Confirm Password
                    </label>
                    <input
                            id="confirmPassword"
                            type="password"
                            bind:value={confirmPassword}
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
                    {loading ? 'Creating account...' : 'Sign Up'}
                </button>
            </form>

            <p class="text-center text-gray-600 mt-6">
                Already have an account?
                <a href="/auth/login" class="text-primary-600 hover:text-primary-700 font-medium">
                    Login
                </a>
            </p>
        </div>
    </div>
</div>