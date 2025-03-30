/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // This is necessary for webpack to import node modules correctly
    if (!isServer) {
      // For client-side bundles, ignore node-specific modules
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
        crypto: false,
      };
    }

    // Add specific handling for @tensorflow/tfjs-node
    if (!isServer) {
      // For client-side bundles, ignore @tensorflow/tfjs-node
      config.resolve.alias = {
        ...config.resolve.alias,
        '@tensorflow/tfjs-node': '@tensorflow/tfjs',
      };
    }

    return config;
  },
};

module.exports = nextConfig;