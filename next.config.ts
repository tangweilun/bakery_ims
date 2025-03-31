import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [...(config.externals || []), "@tensorflow/tfjs-node"];
    }
    return config;
  },
};

export default nextConfig;
