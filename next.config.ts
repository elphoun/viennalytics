import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },

  images: {
    formats: ["image/webp", "image/avif"],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  experimental: {
    optimizeCss: true,
    optimizePackageImports: ["d3", "@tanstack/react-query"],
  },

  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: "all",
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendors",
            chunks: "all",
          },
        },
      };
    }
    return config;
  },

  // Remove turbopack config for production builds
  ...(process.env.NODE_ENV === 'development' && {
    turbopack: {
      resolveAlias: {
        underscore: "lodash",
      },
      resolveExtensions: [".web.js", ".js", ".ts", ".tsx"],
    },
  }),
};

export default nextConfig;
