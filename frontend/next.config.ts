import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Mock data du catalogue (photos Unsplash) — à retirer avec les mocks.
      { protocol: "https", hostname: "images.unsplash.com" },
      // Bucket MinIO public en lecture (contrat v1.1 §4.7) — URLs absolues,
      // jamais de préfixe concaténé côté front. Domaine d'après l'exemple du
      // contrat (media.akal.ma) ; à ajuster si Ibrahim confirme un autre host/CDN.
      { protocol: "https", hostname: "media.akal.ma" },
    ],
  },
};

export default nextConfig;
