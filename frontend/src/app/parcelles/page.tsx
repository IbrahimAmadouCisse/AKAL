"use client";

import { Suspense, useState, useMemo, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import {
  PARCELLES,
  REGIONS,
  CULTURES,
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
import CardParcelleSkeleton from "@/components/parcelles/CardParcelleSkeleton";
import EmptyStateCatalogue from "@/components/parcelles/EmptyStateCatalogue";
import ComparateurModal from "@/components/parcelles/ComparateurModal";
import { Grid, Map, Filter } from "@/components/icons/Icons";
import { useSimulatedLoading } from "@/hooks/useSimulatedLoading";

const PAGE_SIZE = 4;

function getPaginationPages(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "…")[] = [1];
  if (current > 3) pages.push("…");
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
    pages.push(i);
  }
  if (current < total - 2) pages.push("…");
  pages.push(total);
  return pages;
}

type ModeAffichage = "grille" | "carte";

// `useSearchParams` doit être encapsulé dans un <Suspense> pour le build de
// production (voir doc Next.js — sinon échec avec "missing-suspense-with-csr-bailout").
export default function CataloguePage() {
  return (
    <Suspense fallback={null}>
      <Catalogue />
    </Suspense>
  );
}

// Construit les filtres initiaux à partir des query params transmis par la
// recherche rapide du hero (region, culture, budget_max) — pré-remplissage
// à l'arrivée uniquement, sans synchronisation continue avec l'URL.
function filtresDepuisParams(searchParams: URLSearchParams): FiltresState {
  const region = searchParams.get("region");
  const culture = searchParams.get("culture");
  const budgetMax = Number(searchParams.get("budget_max"));

  return {
    ...FILTRES_INITIAUX,
    region: region && (REGIONS as string[]).includes(region) ? region : FILTRES_INITIAUX.region,
    cultures: culture && CULTURES.some((c) => c.label === culture) ? [culture] : FILTRES_INITIAUX.cultures,
    prixMax: Number.isFinite(budgetMax) && budgetMax > 0 ? budgetMax : FILTRES_INITIAUX.prixMax,
  };
}

function Catalogue() {
  const searchParams = useSearchParams();

  const [mode, setMode] = useState<ModeAffichage>("grille");
  const [tri, setTri] = useState<Tri>("recent");
  const [page, setPage] = useState(1);
  const [comparaison, setComparaison] = useState<number[]>([]);
  const [comparateurOuvert, setComparateurOuvert] = useState(false);
  const [sidebarOuverte, setSidebarOuverte] = useState(false);
  const [filtres, setFiltres] = useState<FiltresState>(() => filtresDepuisParams(searchParams));

  // Mise à jour partielle des filtres (live) — remet la pagination à 1.
  const patchFiltres = useCallback((patch: Partial<FiltresState>) => {
    setFiltres((prev) => ({ ...prev, ...patch }));
    setPage(1);
  }, []);

  const reinitialiser = useCallback(() => {
    setFiltres(FILTRES_INITIAUX);
    setPage(1);
  }, []);

  // Liste filtrée + triée, recalculée à chaque changement (temps réel).
  const parcellesVisibles = useMemo(
    () => trierParcelles(filtrerParcelles(PARCELLES, filtres), tri),
    [filtres, tri],
  );

  const nb = parcellesVisibles.length;
  const totalPages = Math.max(1, Math.ceil(nb / PAGE_SIZE));
  const parcellesPage = parcellesVisibles.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Débounce visuel du skeleton — se déclenche à chaque changement de la liste affichée.
  const chargement = useSimulatedLoading(parcellesPage.map((p) => p.id).join(","));

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
              onChange={(e) => { setTri(e.target.value as Tri); setPage(1); }}
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
          <EmptyStateCatalogue onReinitialiser={reinitialiser} />
        ) : mode === "grille" ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "16px",
            }}
          >
            {chargement
              ? Array.from({ length: parcellesPage.length }).map((_, i) => <CardParcelleSkeleton key={i} />)
              : parcellesPage.map((p) => (
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

        {nb > 0 && totalPages > 1 && (
          <nav
            aria-label="Pagination"
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", marginTop: "32px" }}
          >
            {/* Précédent */}
            <button
              type="button"
              onClick={() => setPage((p) => p - 1)}
              disabled={page === 1}
              aria-label="Page précédente"
              style={{
                width: "32px", height: "32px", borderRadius: "8px", fontSize: "14px",
                border: "1px solid var(--color-bordure)", backgroundColor: "white",
                cursor: page === 1 ? "default" : "pointer",
                color: page === 1 ? "var(--color-tertiaire)" : "var(--color-texte)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              ‹
            </button>

            {getPaginationPages(page, totalPages).map((p, i) => (
              <button
                key={i}
                type="button"
                onClick={() => typeof p === "number" && setPage(p)}
                disabled={p === "…"}
                aria-current={p === page ? "page" : undefined}
                style={{
                  width: "32px", height: "32px", borderRadius: "8px",
                  fontSize: "12px", fontWeight: 500,
                  border: `1px solid ${p === page ? "var(--color-foret)" : "var(--color-bordure)"}`,
                  backgroundColor: p === page ? "var(--color-foret)" : "white",
                  color: p === page ? "white" : p === "…" ? "var(--color-tertiaire)" : "var(--color-texte)",
                  cursor: p === "…" ? "default" : "pointer",
                }}
              >
                {p}
              </button>
            ))}

            {/* Suivant */}
            <button
              type="button"
              onClick={() => setPage((p) => p + 1)}
              disabled={page === totalPages}
              aria-label="Page suivante"
              style={{
                width: "32px", height: "32px", borderRadius: "8px", fontSize: "14px",
                border: "1px solid var(--color-bordure)", backgroundColor: "white",
                cursor: page === totalPages ? "default" : "pointer",
                color: page === totalPages ? "var(--color-tertiaire)" : "var(--color-texte)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              ›
            </button>
          </nav>
        )}
      </main>

      <BarreComparateur
        parcelles={parcellesComparees}
        onRetirer={toggleComparaison}
        onComparer={() => setComparateurOuvert(true)}
      />

      {comparateurOuvert && (
        <ComparateurModal parcelles={parcellesComparees} onFermer={() => setComparateurOuvert(false)} />
      )}
    </div>
  );
}