"use client";

import { useState, type ReactNode } from "react";
import { ChevronRight } from "@/components/icons/Icons";

type Props = {
  titre: string;
  children: ReactNode;
  ouvertParDefaut?: boolean;
};

// Groupe repliable (titre + chevron rotatif). Animation de hauteur fluide via
// grid-template-rows (0fr -> 1fr) — pas de mesure JS, pas de ResizeObserver.
export default function AccordionSection({ titre, children, ouvertParDefaut = true }: Props) {
  const [ouvert, setOuvert] = useState(ouvertParDefaut);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOuvert((v) => !v)}
        aria-expanded={ouvert}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          background: "none",
          border: "none",
          padding: 0,
          marginBottom: "8px",
          cursor: "pointer",
        }}
      >
        <span style={{ fontSize: "12px", fontWeight: 500, color: "var(--color-secondaire)" }}>{titre}</span>
        <ChevronRight
          size={14}
          style={{
            color: "var(--color-tertiaire)",
            transform: ouvert ? "rotate(90deg)" : "rotate(0deg)",
            transition: "transform var(--duration-base) var(--ease-premium)",
          }}
        />
      </button>
      <div
        style={{
          display: "grid",
          gridTemplateRows: ouvert ? "1fr" : "0fr",
          transition: "grid-template-rows var(--duration-base) var(--ease-in-out-soft)",
        }}
      >
        <div style={{ overflow: "hidden" }}>{children}</div>
      </div>
    </div>
  );
}
