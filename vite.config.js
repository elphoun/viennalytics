import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react(),
        tailwindcss()
    ],
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    // Split large libraries into separate chunks
                    vendor: ['react', 'react-dom'],
                    router: ['react-router-dom'],
                    charts: ['react-plotly.js'],
                    chess: ['react-chessboard'],
                    icons: ['react-icons/ci', 'react-icons/fa'],
                    motion: ['framer-motion']
                }
            }
        }
    },
    optimizeDeps: {
        include: ['react-plotly.js', 'react-chessboard', 'framer-motion']
    }
});
