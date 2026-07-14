"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Parcelle } from "@/types/parcelle";
import BadgeStatut from "./BadgeStatut";
import ScoreBar from "./ScoreBar";
import { MapPin, Heart, Droplets } from "@/components/icons/Icons";

type Props = {
  parcelle: Parcelle;
  enComparaison: boolean;
  onToggleComparaison: (id: string) => void;
};

const formatMAD = new Intl.NumberFormat("fr-MA");

export default function CardParcelle({ parcelle, enComparaison, onToggleComparaison }: Props) {
  const [favori, setFavori] = useState(false);
  const a = parcelle;
  const image = a.photoPrincipale ?? a.photos[0] ?? null;

  return (
    <article className="card" style={{ overflow: "hidden" }}>
      {/* Photo */}
      <div style={{ position: "relative", width: "100%", paddingBottom: "70%", backgroundColor: "var(--color-menthe)" }}>
        {image && (
          <Image
            src={image}
            alt={a.titre}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
            style={{ objectFit: "cover" }}
          />
        )}

        {/* Badges en surimpression */}
        <div
          style={{
            position: "absolute",
            top: "8px",
            left: "8px",
            display: "flex",
            flexDirection: "column",
            gap: "4px",
            alignItems: "flex-start",
          }}
        >
          {a.badge && (
            <span
              style={{
                fontSize: "10px",
                fontWeight: 500,
                padding: "2px 8px",
                borderRadius: "999px",
                color: "white",
                backgroundColor: "var(--color-foret)",
              }}
            >
              {a.badge}
            </span>
          )}
          <BadgeStatut statut={a.parcelle.statutFoncier} />
        </div>

        {/* Favori */}
        <button
          type="button"
          aria-label={favori ? "Retirer des favoris" : "Ajouter aux favoris"}
          aria-pressed={favori}
          onClick={() => setFavori((v) => !v)}
          style={{
            position: "absolute",
            top: "8px",
            right: "8px",
            width: "28px",
            height: "28px",
            borderRadius: "999px",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: favori ? "#FEF3EE" : "rgba(255,255,255,0.9)",
            transition: "background-color 200ms ease",
          }}
        >
          <Heart
            size={14}
            fill={favori ? "var(--color-terre)" : "none"}
            style={{ color: favori ? "var(--color-terre)" : "var(--color-tertiaire)" }}
          />
        </button>
      </div>

      {/* Corps */}
      <div style={{ padding: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
        <Link href={`/parcelles/${a.slug}`} style={{ textDecoration: "none" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 500, lineHeight: 1.3, color: "var(--color-foret)" }}>
            {a.titre}
          </h3>
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "var(--color-tertiaire)" }}>
          <MapPin size={11} />
          {/* Pas d'adresse approximative en liste (allégé, contrat §4.4) — région seule ici. */}
          <span>{a.parcelle.regionNom}</span>
        </div>

        {/* Tags */}
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center" }}>
          {[`${a.parcelle.surface} ha`, `${a.prixM2} MAD/m²`].map((t) => (
            <span
              key={t}
              style={{
                fontSize: "10px",
                fontWeight: 500,
                padding: "2px 8px",
                borderRadius: "999px",
                backgroundColor: "var(--color-menthe)",
                color: "var(--color-nuit)",
              }}
            >
              {t}
            </span>
          ))}
          {a.parcelle.accesEau !== "bour" && (
            <Droplets size={13} style={{ color: "#2196F3" }} aria-label="Accès à l'eau" />
          )}
        </div>

        <ScoreBar score={a.scoreCourant?.scoreGlobal ?? null} />

        {/* Prix + comparateur */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "2px" }}>
          <span style={{ fontSize: "14px", fontWeight: 500, color: "var(--color-foret)" }}>
            {formatMAD.format(a.prix)} MAD
          </span>
          <label
            style={{ display: "flex", alignItems: "center", gap: "4px", cursor: "pointer", fontSize: "11px", color: "var(--color-tertiaire)" }}
          >
            <input
              type="checkbox"
              checked={enComparaison}
              onChange={() => onToggleComparaison(a.id)}
              style={{ width: "13px", height: "13px", accentColor: "var(--color-foret)" }}
            />
            Comparer
          </label>
        </div>
      </div>
    </article>
  );
}
