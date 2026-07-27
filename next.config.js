/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  experimental: {
    // Reduce chunk size to avoid SWC-wasm parse corruption on large pages
    optimizePackageImports: ['lucide-react', 'recharts', 'framer-motion'],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Smaller server chunks avoid the wasm-compiler chunk-parse bug
      config.optimization = {
        ...config.optimization,
        minimize: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
