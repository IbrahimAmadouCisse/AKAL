"use client";

import { useEffect } from "react";
import type { Parcelle } from "@/data/parcelles";
import BadgeStatut from "./BadgeStatut";
import ScoreBar from "./ScoreBar";
import Portal from "@/components/ui/Portal";
import { X, Droplets } from "@/components/icons/Icons";
import { formatPrixMAD } from "@/lib/format";

type Props = {
  parcelles: Parcelle[];
  onFermer: () => void;
};

type Ligne = {
  label: string;
  render: (p: Parcelle) => React.ReactNode;
  meilleure?: (parcelles: Parcelle[]) => number; // valeur numérique "gagnante" pour surligner
  valeur?: (p: Parcelle) => number;
};

const LIGNES: Ligne[] = [
  { label: "Prix", render: (p) => formatPrixMAD(p.prix), valeur: (p) => p.prix, meilleure: (ps) => Math.min(...ps.map((p) => p.prix)) },
  { label: "Prix au m²", render: (p) => `${p.prixM2} MAD/m²`, valeur: (p) => p.prixM2, meilleure: (ps) => Math.min(...ps.map((p) => p.prixM2)) },
  { label: "Surface", render: (p) => `${p.surface} ha`, valeur: (p) => p.surface, meilleure: (ps) => Math.max(...ps.map((p) => p.surface)) },
  {
    label: "AgriScore",
    render: (p) => <ScoreBar score={p.score} />,
    valeur: (p) => p.score,
    meilleure: (ps) => Math.max(...ps.map((p) => p.score)),
  },
  { label: "Statut foncier", render: (p) => <BadgeStatut statut={p.statut} /> },
  {
    label: "Accès à l'eau",
    render: (p) => (p.eau ? <span style={{ display: "flex", alignItems: "center", gap: "4px", color: "#1A6EA4" }}><Droplets size={13} /> Irriguée</span> : "Bour"),
    valeur: (p) => (p.eau ? 1 : 0),
    meilleure: () => 1,
  },
  { label: "Culture", render: (p) => p.culture },
];

export default function ComparateurModal({ parcelles, onFermer }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onFermer();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onFermer]);

  return (
    <Portal>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Comparaison des parcelles"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 200,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
        }}
      >
        {/* Scrim */}
        <div
          onClick={onFermer}
          style={{ position: "absolute", inset: 0, backgroundColor: "rgba(27,58,45,0.45)" }}
        />

        {/* Contenu */}
        <div
          style={{
            position: "relative",
            backgroundColor: "white",
            borderRadius: "var(--radius-card)",
            boxShadow: "var(--shadow-float)",
            maxWidth: "900px",
            width: "100%",
            maxHeight: "88vh",
            overflow: "auto",
            animation: "toast-in var(--duration-base) var(--ease-premium)",
          }}
        >
          <div
            style={{
              position: "sticky",
              top: 0,
              zIndex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "18px 24px",
              backgroundColor: "white",
              borderBottom: "1px solid var(--color-bordure)",
            }}
          >
            <h2 style={{ fontSize: "17px", fontWeight: 500, color: "var(--color-nuit)", margin: 0 }}>
              Comparer {parcelles.length} parcelles
            </h2>
            <button
              type="button"
              onClick={onFermer}
              aria-label="Fermer la comparaison"
              style={{ background: "none", border: "none", cursor: "pointer", display: "flex", color: "var(--color-tertiaire)" }}
            >
              <X size={20} />
            </button>
          </div>

          <div style={{ overflowX: "auto", padding: "8px 24px 24px" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: `${220 + parcelles.length * 180}px` }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", padding: "12px 10px", width: "160px" }} />
                  {parcelles.map((p) => (
                    <th key={p.id} style={{ textAlign: "left", padding: "12px 10px", fontSize: "13px", fontWeight: 500, color: "var(--color-nuit)" }}>
                      {p.titre}
                      <div style={{ fontSize: "11px", fontWeight: 400, color: "var(--color-tertiaire)", marginTop: "2px" }}>
                        {p.ville}, {p.region}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {LIGNES.map((ligne) => {
                  const gagnante = ligne.meilleure?.(parcelles);
                  return (
                    <tr key={ligne.label} style={{ borderTop: "1px solid var(--color-bordure)" }}>
                      <td style={{ padding: "12px 10px", fontSize: "12px", color: "var(--color-secondaire)", whiteSpace: "nowrap" }}>
                        {ligne.label}
                      </td>
                      {parcelles.map((p) => {
                        const estGagnante = gagnante !== undefined && ligne.valeur?.(p) === gagnante;
                        return (
                          <td
                            key={p.id}
                            style={{
                              padding: "10px",
                              fontSize: "13px",
                              fontWeight: estGagnante ? 500 : 400,
                              color: "var(--color-texte)",
                              backgroundColor: estGagnante ? "var(--color-rosee)" : "transparent",
                              borderRadius: "8px",
                            }}
                          >
                            {ligne.render(p)}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Portal>
  );
}
