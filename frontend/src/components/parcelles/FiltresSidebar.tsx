"use client";

import {
  ACCES_EAU_OPTIONS,
  STATUTS,
  type FiltresState,
  type Region,
  filtresActifs,
} from "@/data/parcelles";
import { STATUT_FONCIER_LABEL } from "./BadgeStatut";
import { Search, X } from "@/components/icons/Icons";

type Props = {
  ouverte: boolean;
  onFermer: () => void;
  filtres: FiltresState;
  onChange: (patch: Partial<FiltresState>) => void;
  onReinitialiser: () => void;
  // Régions chargées une seule fois par la page catalogue (GET /api/geo/regions/),
  // pas ici — évite un fetch par instance de sidebar.
  regions: Region[];
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
  regions,
  onAppliquer,
}: Props) {
  const f = filtres;

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

          {/* Recherche textuelle — limitée à la page actuellement chargée
              (pas de paramètre `q=` documenté côté API, cf. lib/parcelles.ts). */}
          <div style={{ position: "relative" }}>
            <Search
              size={14}
              style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--color-tertiaire)" }}
            />
            <input
              className="input"
              placeholder="Rechercher dans cette page…"
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
              <option value="">Toutes les régions</option>
              {regions.map((r) => (
                <option key={r.code} value={r.code}>{r.nom}</option>
              ))}
            </select>
          </div>

          {/* Statut foncier — select unique : le contrat ne documente pas de
              multi-valeurs pour ce filtre (§4.2). */}
          <div>
            <label style={labelStyle}>Statut foncier</label>
            <select
              className="input"
              value={f.statutFoncier}
              onChange={(e) => onChange({ statutFoncier: e.target.value as FiltresState["statutFoncier"] })}
              style={{ height: "44px", fontSize: "14px" }}
            >
              <option value="">Tous les statuts</option>
              {STATUTS.map((s) => (
                <option key={s} value={s}>{STATUT_FONCIER_LABEL[s].label}</option>
              ))}
            </select>
          </div>

          {/* Prix */}
          <div>
            <label style={labelStyle}>Prix (MAD)</label>
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
          </div>

          {/* Surface */}
          <div>
            <label style={labelStyle}>Surface (ha)</label>
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
          </div>

          {/* Eau */}
          <fieldset style={{ border: "none", padding: 0, margin: 0 }}>
            <legend style={labelStyle}>Accès à l&apos;eau</legend>
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "4px", cursor: "pointer", fontSize: "13px", color: "var(--color-texte)" }}>
                <input
                  type="radio"
                  name="eau"
                  checked={f.eau === "tous"}
                  onChange={() => onChange({ eau: "tous" })}
                  style={{ accentColor: "var(--color-foret)" }}
                />{" "}
                Tous
              </label>
              {ACCES_EAU_OPTIONS.map((o) => (
                <label key={o.value} style={{ display: "flex", alignItems: "center", gap: "4px", cursor: "pointer", fontSize: "13px", color: "var(--color-texte)" }}>
                  <input
                    type="radio"
                    name="eau"
                    checked={f.eau === o.value}
                    onChange={() => onChange({ eau: o.value })}
                    style={{ accentColor: "var(--color-foret)" }}
                  />{" "}
                  {o.label}
                </label>
              ))}
            </div>
          </fieldset>

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

const miniInputStyle: React.CSSProperties = {
  height: "40px",
  fontSize: "13px",
  padding: "0 12px",
};
