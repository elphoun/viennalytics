import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  compress: true,

  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },

  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['d3', '@tanstack/react-query'],
  },

  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      };
    }
    return config;
  },

  turbopack: {
    root: path.resolve(__dirname),
    resolveAlias: {
      underscore: 'lodash',
    },
    resolveExtensions: ['.web.js', '.js', '.ts', '.tsx'],
  },
};
export default nextConfig;
