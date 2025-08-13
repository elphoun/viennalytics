import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  esbuild: {
    // Remove console logs and debugger statements in production
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : []
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React libraries
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],

          // Heavy libraries - split into separate chunks for lazy loading
          d3: ['d3'],
          chess: ['react-chessboard'],

          // UI libraries
          icons: ['react-icons/ci', 'react-icons/fa', 'react-icons/md'],
          motion: ['framer-motion'],

          // Utilities
          utils: ['clsx', 'tailwind-merge']
        }
      }
    },
    // Enable Terser minification with custom options
    minify: 'terser',
    terserOptions: {
      compress: {
        // Remove console logs in production
        drop_console: true,
        drop_debugger: true,
        // Remove unused code
        dead_code: true,
        // Remove unused variables
        unused: true,
        // Evaluate constant expressions
        evaluate: true,
        // Collapse single-use variables
        collapse_vars: true,
        // Remove unreachable code
        conditionals: true,
        // Optimize comparisons
        comparisons: true,
        // Optimize boolean expressions
        booleans: true,
        // Remove empty statements
        sequences: true,
        // Optimize property access
        properties: true
      },
      mangle: {
        // Mangle variable names for smaller output
        toplevel: true,
        // Keep function names for better debugging (optional)
        keep_fnames: false,
        // Keep class names for better debugging (optional)
        keep_classnames: false
      },
      format: {
        // Remove comments
        comments: false,
        // Preserve license comments
        preserve_annotations: false
      }
    }
  },
  optimizeDeps: {
    include: ['react-chessboard', 'd3']
  }
})
