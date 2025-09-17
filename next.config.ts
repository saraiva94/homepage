import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    // permite importar arquivos de vídeo/imagem como módulos (asset modules)
    config.module.rules.push({
      test: /\.(mp4|webm|ogg|ogv|mov)$/i,
      type: "asset/resource",
      generator: {
        filename: "static/media/[name].[contenthash][ext]"
      }
    });
    return config;
  }
};

export default nextConfig;
