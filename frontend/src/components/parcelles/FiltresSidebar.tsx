"use client";

import {
  REGIONS,
  CULTURES,
  STATUTS,
  type FiltresState,
  type StatutFoncier,
  type AccesEau,
  filtresActifs,
} from "@/data/parcelles";
import BadgeStatut from "./BadgeStatut";
import AccordionSection from "./AccordionSection";
import { Search, X } from "@/components/icons/Icons";

type Props = {
  ouverte: boolean;
  onFermer: () => void;
  filtres: FiltresState;
  onChange: (patch: Partial<FiltresState>) => void;
  onReinitialiser: () => void;
  // Mobile : ferme simplement le drawer (la liste est déjà à jour en live).
  onAppliquer: () => void;
};

// Parse un input numérique en number | null (champ vide => null, pas de filtre).
function parseNum(v: string): number | null {
  if (v.trim() === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export default function FiltresSidebar({
  ouverte,
  onFermer,
  filtres,
  onChange,
  onReinitialiser,
  onAppliquer,
}: Props) {
  const f = filtres;

  const toggleCulture = (label: string) => {
    onChange({
      cultures: f.cultures.includes(label)
        ? f.cultures.filter((c) => c !== label)
        : [...f.cultures, label],
    });
  };

  const toggleStatut = (statut: StatutFoncier) => {
    onChange({
      statuts: f.statuts.includes(statut)
        ? f.statuts.filter((s) => s !== statut)
        : [...f.statuts, statut],
    });
  };

  return (
    <>
      {/* Overlay mobile */}
      {ouverte && (
        <div
          onClick={onFermer}
          style={{
            position: "fixed",
            inset: 0,
            top: "64px",
            backgroundColor: "rgba(0,0,0,0.35)",
            zIndex: 25,
          }}
          className="hidden-desktop"
        />
      )}

      <aside
        className={`filtres-sidebar ${ouverte ? "filtres-sidebar--ouverte" : ""}`}
        aria-label="Filtres de recherche"
      >
        <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Titre */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h2 style={{ fontSize: "14px", fontWeight: 500, color: "var(--color-texte)" }}>Filtres</h2>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <button
                type="button"
                onClick={onReinitialiser}
                disabled={!filtresActifs(f)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: filtresActifs(f) ? "pointer" : "default",
                  fontSize: "12px",
                  color: filtresActifs(f) ? "var(--color-terre)" : "var(--color-tertiaire)",
                  opacity: filtresActifs(f) ? 1 : 0.6,
                }}
              >
                Réinitialiser
              </button>
              <button
                type="button"
                onClick={onFermer}
                aria-label="Fermer les filtres"
                className="hidden-desktop"
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-tertiaire)", display: "flex" }}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Recherche textuelle */}
          <div style={{ position: "relative" }}>
            <Search
              size={14}
              style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--color-tertiaire)" }}
            />
            <input
              className="input"
              placeholder="Rechercher une annonce…"
              value={f.recherche}
              onChange={(e) => onChange({ recherche: e.target.value })}
              style={{ height: "44px", paddingLeft: "36px", fontSize: "14px" }}
            />
          </div>

          {/* Région */}
          <div>
            <label style={labelStyle}>Région</label>
            <select
              className="input"
              value={f.region}
              onChange={(e) => onChange({ region: e.target.value })}
              style={{ height: "44px", fontSize: "14px" }}
            >
              {REGIONS.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* Cultures */}
          <AccordionSection titre="Type de culture">
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {CULTURES.map((c) => (
                <label key={c.label} style={checkRowStyle}>
                  <input
                    type="checkbox"
                    checked={f.cultures.includes(c.label)}
                    onChange={() => toggleCulture(c.label)}
                    style={{ width: "14px", height: "14px", accentColor: "var(--color-foret)" }}
                  />
                  <span>{c.emoji} {c.label}</span>
                </label>
              ))}
            </div>
          </AccordionSection>

          {/* Statut foncier */}
          <AccordionSection titre="Statut foncier">
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {STATUTS.map((s) => (
                <label key={s} style={{ ...checkRowStyle, gap: "8px" }}>
                  <input
                    type="checkbox"
                    checked={f.statuts.includes(s)}
                    onChange={() => toggleStatut(s)}
                    style={{ width: "14px", height: "14px", accentColor: "var(--color-foret)" }}
                  />
                  <BadgeStatut statut={s} />
                </label>
              ))}
            </div>
          </AccordionSection>

          {/* Prix */}
          <AccordionSection titre="Prix (MAD)">
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                className="input"
                type="number"
                inputMode="numeric"
                placeholder="Min"
                value={f.prixMin ?? ""}
                onChange={(e) => onChange({ prixMin: parseNum(e.target.value) })}
                style={miniInputStyle}
              />
              <input
                className="input"
                type="number"
                inputMode="numeric"
                placeholder="Max"
                value={f.prixMax ?? ""}
                onChange={(e) => onChange({ prixMax: parseNum(e.target.value) })}
                style={miniInputStyle}
              />
            </div>
          </AccordionSection>

          {/* Surface */}
          <AccordionSection titre="Surface (ha)">
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                className="input"
                type="number"
                inputMode="decimal"
                placeholder="Min"
                value={f.surfaceMin ?? ""}
                onChange={(e) => onChange({ surfaceMin: parseNum(e.target.value) })}
                style={miniInputStyle}
              />
              <input
                className="input"
                type="number"
                inputMode="decimal"
                placeholder="Max"
                value={f.surfaceMax ?? ""}
                onChange={(e) => onChange({ surfaceMax: parseNum(e.target.value) })}
                style={miniInputStyle}
              />
            </div>
          </AccordionSection>

          {/* Eau */}
          <AccordionSection titre="Accès à l'eau">
            <div style={{ display: "flex", gap: "16px" }}>
              {(["Irriguée", "Bour", "Tous"] as AccesEau[]).map((o) => (
                <label key={o} style={{ display: "flex", alignItems: "center", gap: "4px", cursor: "pointer", fontSize: "13px", color: "var(--color-texte)" }}>
                  <input
                    type="radio"
                    name="eau"
                    checked={f.eau === o}
                    onChange={() => onChange({ eau: o })}
                    style={{ accentColor: "var(--color-foret)" }}
                  />{" "}
                  {o}
                </label>
              ))}
            </div>
          </AccordionSection>

          {/* Mobile uniquement : ferme le drawer (liste déjà filtrée en live). */}
          <button className="btn-primary hidden-desktop" style={{ width: "100%" }} onClick={onAppliquer}>
            Voir les résultats
          </button>
        </div>
      </aside>
    </>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "12px",
  fontWeight: 500,
  marginBottom: "8px",
  color: "var(--color-secondaire)",
};

const checkRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  cursor: "pointer",
  fontSize: "14px",
  color: "var(--color-texte)",
};

const miniInputStyle: React.CSSProperties = {
  height: "40px",
  fontSize: "13px",
  padding: "0 12px",
};