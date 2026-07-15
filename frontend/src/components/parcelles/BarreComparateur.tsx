"use client";

import type { Parcelle } from "@/types/parcelle";
import { X } from "@/components/icons/Icons";

type Props = {
  parcelles: Parcelle[];
  onRetirer: (id: string) => void;
};

export default function BarreComparateur({ parcelles, onRetirer }: Props) {
  if (parcelles.length === 0) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 40,
        backgroundColor: "white",
        borderTop: "1px solid var(--color-bordure)",
        boxShadow: "0 -4px 16px rgba(0,0,0,0.08)",
        padding: "12px 24px",
        display: "flex",
        alignItems: "center",
        gap: "16px",
        flexWrap: "wrap",
      }}
    >
      <span style={{ fontSize: "14px", fontWeight: 500, color: "var(--color-texte)", whiteSpace: "nowrap" }}>
        Comparaison — {parcelles.length}/3 parcelles
      </span>

      <div style={{ display: "flex", gap: "8px", flex: 1, flexWrap: "wrap", minWidth: "200px" }}>
        {parcelles.map((p) => (
          <div
            key={p.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 12px",
              borderRadius: "8px",
              fontSize: "12px",
              backgroundColor: "var(--color-rosee)",
              color: "var(--color-foret)",
            }}
          >
            <span>{p.titre.length > 24 ? p.titre.slice(0, 24) + "…" : p.titre}</span>
            <button
              type="button"
              onClick={() => onRetirer(p.id)}
              aria-label={`Retirer ${p.titre} de la comparaison`}
              style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-foret)", display: "flex" }}
            >
              <X size={12} />
            </button>
          </div>
        ))}
      </div>

      <button className="btn-primary" disabled={parcelles.length < 2} style={{ opacity: parcelles.length < 2 ? 0.5 : 1, whiteSpace: "nowrap" }}>
        Comparer maintenant
      </button>
    </div>
  );
}
