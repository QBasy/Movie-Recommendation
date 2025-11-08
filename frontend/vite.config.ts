import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [tailwindcss(), sveltekit()],
    server: {
        proxy: {
            '/api': {
                target: 'http://backend:3000', // имя сервиса Docker
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, ''), // убираем /api при проксировании к бэку
            },
        }
    }
});
