import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    qualities: [75, 100],
    formats: ["image/avif", "image/webp"],
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(mp4|webm|ogg|ogv|mov)$/i,
      type: "asset/resource",
      generator: { filename: "static/media/[name].[contenthash][ext]" },
    });
    return config;
  },
};

export default nextConfig;
