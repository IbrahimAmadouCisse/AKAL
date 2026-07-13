"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "@/components/icons/Icons";

type Props = {
  photos: string[];
  titre: string;
  badge?: string | null;
};

export default function CarrouselPhotos({ photos, titre, badge }: Props) {
  const [actif, setActif] = useState(0);
  const n = photos.length;

  const precedent = useCallback(() => setActif((i) => (i - 1 + n) % n), [n]);
  const suivant = useCallback(() => setActif((i) => (i + 1) % n), [n]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") precedent();
      if (e.key === "ArrowRight") suivant();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [precedent, suivant]);

  if (n === 0) return null;

  return (
    <div
      style={{
        borderRadius: "var(--radius-card)",
        overflow: "hidden",
        boxShadow: "var(--shadow-card)",
        backgroundColor: "var(--color-nuit)",
      }}
    >
      {/* Zone image principale */}
      <div style={{ position: "relative", width: "100%", paddingBottom: "56%" }}>
        {photos.map((src, i) => (
          <Image
            key={src}
            src={src}
            alt={`${titre} — photo ${i + 1} sur ${n}`}
            fill
            priority={i === 0}
            sizes="(max-width: 900px) 100vw, 65vw"
            style={{
              objectFit: "cover",
              opacity: i === actif ? 1 : 0,
              transition: "opacity 350ms ease",
            }}
          />
        ))}

        {/* Flèche gauche */}
        {n > 1 && (
          <button
            type="button"
            onClick={precedent}
            aria-label="Photo précédente"
            className="carousel-arrow"
            style={{
              position: "absolute",
              left: "12px",
              top: "50%",
              zIndex: 10,
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              border: "none",
              backgroundColor: "rgba(255,255,255,0.88)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
            }}
          >
            <ChevronLeft size={18} style={{ color: "var(--color-nuit)" }} />
          </button>
        )}

        {/* Flèche droite */}
        {n > 1 && (
          <button
            type="button"
            onClick={suivant}
            aria-label="Photo suivante"
            className="carousel-arrow"
            style={{
              position: "absolute",
              right: "12px",
              top: "50%",
              zIndex: 10,
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              border: "none",
              backgroundColor: "rgba(255,255,255,0.88)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
            }}
          >
            <ChevronRight size={18} style={{ color: "var(--color-nuit)" }} />
          </button>
        )}

        {/* Badge "Nouveau" */}
        {badge && (
          <span
            style={{
              position: "absolute",
              top: "12px",
              left: "12px",
              zIndex: 10,
              fontSize: "11px",
              fontWeight: 500,
              padding: "4px 10px",
              borderRadius: "999px",
              color: "white",
              backgroundColor: "var(--color-foret)",
            }}
          >
            {badge}
          </span>
        )}

        {/* Compteur X / N */}
        {n > 1 && (
          <span
            style={{
              position: "absolute",
              bottom: "12px",
              right: "12px",
              zIndex: 10,
              fontSize: "12px",
              fontWeight: 500,
              padding: "4px 10px",
              borderRadius: "999px",
              backgroundColor: "rgba(0,0,0,0.48)",
              color: "white",
              letterSpacing: "0.03em",
            }}
          >
            {actif + 1} / {n}
          </span>
        )}
      </div>

      {/* Bande de miniatures */}
      {n > 1 && (
        <div
          style={{
            display: "flex",
            gap: "4px",
            padding: "6px",
            backgroundColor: "var(--color-nuit)",
            overflowX: "auto",
          }}
        >
          {photos.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setActif(i)}
              aria-label={`Voir photo ${i + 1}`}
              aria-pressed={i === actif}
              style={{
                flexShrink: 0,
                width: "80px",
                height: "56px",
                borderRadius: "4px",
                overflow: "hidden",
                position: "relative",
                border: `2px solid ${i === actif ? "var(--color-prairie)" : "transparent"}`,
                cursor: "pointer",
                padding: 0,
                opacity: i === actif ? 1 : 0.55,
                transition: "opacity 150ms ease, border-color 150ms ease",
              }}
            >
              <Image
                src={src}
                alt=""
                fill
                sizes="80px"
                style={{ objectFit: "cover" }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
