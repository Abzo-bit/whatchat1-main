import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    base: '/',
    server: {
        port: 3000,
        proxy: {
            '/api': {
                target: 'https://json-server-xp3c.onrender.com',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, '')
            }
        }
    },
    build: {
        outDir: 'dist',
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                login: resolve(__dirname, 'login.html')
            }
        },
        assetsDir: 'assets',
        sourcemap: true,
        emptyOutDir: true,
    },
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src'),
            '@assets': resolve(__dirname, 'public/assets'),
            '@utils': resolve(__dirname, 'src/utils'),
            '@modules': resolve(__dirname, 'src/modules')
        }
    }
});