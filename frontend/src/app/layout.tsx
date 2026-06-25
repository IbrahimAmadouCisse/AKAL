import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "AKAL • ⴰⴽⴰⵍ — Plateforme foncière agricole au Maroc",
  description: "Trouvez, évaluez et investissez dans des terrains agricoles au Maroc. Scoring agronomique, carte interactive, mise en relation directe.",
  openGraph: {
    title: "AKAL • La Terre",
    description: "Marketplace de terrains agricoles au Maroc",
    locale: "fr_MA",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <Navbar />
        <div style={{ flex: 1 }}>
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}
