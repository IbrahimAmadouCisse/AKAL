"use client";

import { useState, useMemo, useCallback } from "react";
import {
  PARCELLES,
  FILTRES_INITIAUX,
  filtrerParcelles,
  trierParcelles,
  type FiltresState,
  type Tri,
} from "@/data/parcelles";
import CardParcelle from "@/components/parcelles/CardParcelle";
import FiltresSidebar from "@/components/parcelles/FiltresSidebar";
import BarreComparateur from "@/components/parcelles/BarreComparateur";
import CarteParcelles from "@/components/parcelles/CarteParcelles";
import { Grid, Map, Filter } from "@/components/icons/Icons";

type ModeAffichage = "grille" | "carte";

export default function CataloguePage() {
  const [mode, setMode] = useState<ModeAffichage>("grille");
  const [tri, setTri] = useState<Tri>("recent");
  const [comparaison, setComparaison] = useState<number[]>([]);
  const [sidebarOuverte, setSidebarOuverte] = useState(false);
  const [filtres, setFiltres] = useState<FiltresState>(FILTRES_INITIAUX);

  // Mise à jour partielle des filtres (live).
  const patchFiltres = useCallback((patch: Partial<FiltresState>) => {
    setFiltres((prev) => ({ ...prev, ...patch }));
  }, []);

  const reinitialiser = useCallback(() => setFiltres(FILTRES_INITIAUX), []);

  // Liste filtrée + triée, recalculée à chaque changement (temps réel).
  const parcellesVisibles = useMemo(
    () => trierParcelles(filtrerParcelles(PARCELLES, filtres), tri),
    [filtres, tri],
  );

  const nb = parcellesVisibles.length;

  const toggleComparaison = (id: number) => {
    setComparaison((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : prev.length < 3
          ? [...prev, id]
          : prev, // max 3
    );
  };

  const parcellesComparees = PARCELLES.filter((p) => comparaison.includes(p.id));

  return (
    <div className="catalogue" style={{ display: "flex", minHeight: "calc(100vh - 64px)", backgroundColor: "var(--color-fond)" }}>
      <FiltresSidebar
        ouverte={sidebarOuverte}
        onFermer={() => setSidebarOuverte(false)}
        filtres={filtres}
        onChange={patchFiltres}
        onReinitialiser={reinitialiser}
        onAppliquer={() => setSidebarOuverte(false)}
      />

      {/* Zone principale */}
      <main style={{ flex: 1, minWidth: 0, padding: "20px", paddingBottom: comparaison.length > 0 ? "96px" : "20px" }}>
        {/* Barre de contrôle */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "20px",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button
              type="button"
              onClick={() => setSidebarOuverte(true)}
              className="hidden-desktop btn-toggle-filtres"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "14px",
                padding: "8px 12px",
                borderRadius: "8px",
                border: "1px solid var(--color-bordure)",
                backgroundColor: "white",
                cursor: "pointer",
                color: "var(--color-texte)",
              }}
            >
              <Filter size={14} /> Filtres
            </button>
            <span aria-live="polite" style={{ fontSize: "14px", color: "var(--color-secondaire)" }}>
              <strong style={{ color: "var(--color-texte)" }}>{nb}</strong>{" "}
              {nb <= 1 ? "annonce affichée" : "annonces affichées"}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <select
              value={tri}
              onChange={(e) => setTri(e.target.value as Tri)}
              style={{
                padding: "8px 12px",
                borderRadius: "8px",
                fontSize: "14px",
                border: "1px solid var(--color-bordure)",
                backgroundColor: "white",
                cursor: "pointer",
              }}
            >
              <option value="recent">Plus récentes</option>
              <option value="prix_asc">Prix croissant</option>
              <option value="prix_desc">Prix décroissant</option>
              <option value="surface">Superficie</option>
              <option value="score">AgriScore</option>
            </select>

            {/* Toggle grille / carte */}
            <div style={{ display: "flex", borderRadius: "8px", border: "1px solid var(--color-bordure)", overflow: "hidden" }}>
              <button
                type="button"
                onClick={() => setMode("grille")}
                aria-pressed={mode === "grille"}
                aria-label="Vue grille"
                style={{ padding: "8px 12px", border: "none", cursor: "pointer", display: "flex", backgroundColor: mode === "grille" ? "var(--color-rosee)" : "white" }}
              >
                <Grid size={15} style={{ color: mode === "grille" ? "var(--color-foret)" : "var(--color-tertiaire)" }} />
              </button>
              <button
                type="button"
                onClick={() => setMode("carte")}
                aria-pressed={mode === "carte"}
                aria-label="Vue carte"
                style={{ padding: "8px 12px", border: "none", borderLeft: "1px solid var(--color-bordure)", cursor: "pointer", display: "flex", backgroundColor: mode === "carte" ? "var(--color-rosee)" : "white" }}
              >
                <Map size={15} style={{ color: mode === "carte" ? "var(--color-foret)" : "var(--color-tertiaire)" }} />
              </button>
            </div>
          </div>
        </div>

        {/* Contenu */}
        {nb === 0 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
              padding: "64px 20px",
              textAlign: "center",
              color: "var(--color-tertiaire)",
            }}
          >
            <p style={{ fontSize: "15px", color: "var(--color-secondaire)" }}>
              Aucune annonce ne correspond à vos critères.
            </p>
            <button type="button" className="btn-secondary" onClick={reinitialiser}>
              Réinitialiser les filtres
            </button>
          </div>
        ) : mode === "grille" ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "16px",
            }}
          >
            {parcellesVisibles.map((p) => (
              <CardParcelle
                key={p.id}
                parcelle={p}
                enComparaison={comparaison.includes(p.id)}
                onToggleComparaison={toggleComparaison}
              />
            ))}
          </div>
        ) : (
          <CarteParcelles parcelles={parcellesVisibles} />
        )}

        {/* Pagination (statique pour l'instant, masquée si aucun résultat) */}
        {nb > 0 && (
          <nav aria-label="Pagination" style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "32px" }}>
            {[1, 2, 3, "…", 12].map((p, i) => (
              <button
                key={i}
                type="button"
                aria-current={p === 1 ? "page" : undefined}
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  fontSize: "12px",
                  fontWeight: 500,
                  border: `1px solid ${p === 1 ? "var(--color-foret)" : "var(--color-bordure)"}`,
                  backgroundColor: p === 1 ? "var(--color-foret)" : "white",
                  color: p === 1 ? "white" : "var(--color-texte)",
                  cursor: p === "…" ? "default" : "pointer",
                }}
                disabled={p === "…"}
              >
                {p}
              </button>
            ))}
          </nav>
        )}
      </main>

      <BarreComparateur parcelles={parcellesComparees} onRetirer={toggleComparaison} />
    </div>
  );
}