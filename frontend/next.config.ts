import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Mock data du catalogue (photos Unsplash) — à retirer plus tard
      { protocol: "https", hostname: "images.unsplash.com" },
      // Prévu pour la prod : médias servis par Cloudinary
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
};

export default nextConfig;
