import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  webpack: (config, { isServer }) => {
    // Only apply this on the server-side build
    if (isServer) {
      // Add @tensorflow/tfjs-node to externals to prevent it from being bundled
      config.externals = [...(config.externals || []), "@tensorflow/tfjs-node"];
    }

    return config;
  },
};

export default nextConfig;
