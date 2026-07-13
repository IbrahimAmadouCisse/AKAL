"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { PARCELLES, REGIONS, CULTURES, trierParcelles } from "@/data/parcelles";
import CardParcelle from "@/components/parcelles/CardParcelle";
import { Search, ArrowRight, BarChart, MessageSquare } from "@/components/icons/Icons";
import Reveal from "@/components/motion/Reveal";
import TopoLines from "@/components/decor/TopoLines";
import HillsSilhouette from "@/components/decor/HillsSilhouette";
import ParcelGrid from "@/components/decor/ParcelGrid";
import { useCountUp } from "@/hooks/useCountUp";
import { fmt } from "@/lib/format";

type Stat = { value: number; suffix?: string; label: string };

// "Toutes les régions" est une option de filtre, pas une région réelle —
// on l'exclut partout où l'on compte ou liste les régions couvertes.
const REGIONS_REELLES = REGIONS.filter((r) => r !== "Toutes les régions");

const STATS: Stat[] = [
  { value: PARCELLES.length, label: "annonces actives" },
  { value: REGIONS_REELLES.length, label: "régions couvertes" },
  { value: 3800, suffix: "+", label: "utilisateurs" },
];

const ETAPES = [
  {
    num: "01",
    Icon: Search,
    titre: "Parcourez le catalogue",
    desc: "Filtrez par région, culture et budget. Trouvez les parcelles qui correspondent à vos critères.",
  },
  {
    num: "02",
    Icon: BarChart,
    titre: "Évaluez l'AgriScore",
    desc: "Consultez le score agronomique propriétaire et comparez les parcelles côte à côte.",
  },
  {
    num: "03",
    Icon: MessageSquare,
    titre: "Contactez le vendeur",
    desc: "Échangez directement via la messagerie sécurisée intégrée à la plateforme.",
  },
];

function StatCounter({ value, suffix, label }: Stat) {
  const { ref, display } = useCountUp(value);
  return (
    <div ref={ref} style={{ textAlign: "center" }}>
      <div style={{ fontSize: "24px", fontWeight: 500, color: "white", fontVariantNumeric: "tabular-nums" }}>
        {fmt.format(display)}{suffix}
      </div>
      <div style={{ fontSize: "12px", color: "var(--color-menthe)" }}>{label}</div>
    </div>
  );
}

export default function Home() {
  // Vedettes = les plus récentes (pas d'ordre de tableau) — réutilise le tri
  // "recent" de trierParcelles (id décroissant en attendant un vrai createdAt
  // côté API) pour éviter de dupliquer cette logique.
  const vedettes = trierParcelles(PARCELLES, "recent").slice(0, 3);

  // Recherche rapide du hero — transmise à /parcelles via query params.
  const [region, setRegion] = useState("");
  const [culture, setCulture] = useState("");
  const [budgetMax, setBudgetMax] = useState("");

  const hrefRecherche = useMemo(() => {
    const params = new URLSearchParams();
    if (region) params.set("region", region);
    if (culture) params.set("culture", culture);
    if (budgetMax) params.set("budget_max", budgetMax);
    const qs = params.toString();
    return qs ? `/parcelles?${qs}` : "/parcelles";
  }, [region, culture, budgetMax]);

  return (
    <div>
      {/* ───── Hero ───── */}
      <section style={{ position: "relative", overflow: "hidden", padding: "80px 24px", backgroundColor: "var(--color-nuit)" }}>
        <TopoLines color="var(--color-topo-line-invert)" />
        <HillsSilhouette />
        <div style={{ position: "relative", zIndex: 1, maxWidth: "896px", margin: "0 auto", textAlign: "center" }}>
          {/* Logo */}
          <Reveal>
            <div style={{ marginBottom: "24px" }}>
              <span style={{ fontSize: "32px", fontWeight: 500, color: "white" }}>AKAL</span>
              <span className="tifinagh" style={{ display: "block", fontSize: "14px", color: "var(--color-menthe)", marginTop: "4px" }}>
                ⴰⴽⴰⵍ • La Terre
              </span>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <h1 style={{ fontSize: "44px", fontWeight: 500, lineHeight: 1.2, color: "white", margin: "0 0 16px" }}>
              Trouvez la terre<br />qui vous correspond
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p style={{ fontSize: "18px", color: "var(--color-menthe)", maxWidth: "560px", margin: "0 auto" }}>
              AKAL transforme chaque parcelle en actif décisionnel grâce à l&apos;intelligence agronomique.
            </p>
          </Reveal>

          {/* Barre de recherche hero */}
          <Reveal delay={240}>
            <div
              style={{
                marginTop: "32px",
                backgroundColor: "white",
                borderRadius: "var(--radius-card)",
                boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
                padding: "8px",
                display: "flex",
                flexWrap: "wrap",
                gap: "8px",
                maxWidth: "640px",
                margin: "32px auto 0",
              }}
            >
              <label htmlFor="hero-region" style={srOnlyStyle}>Région</label>
              <select
                id="hero-region"
                style={heroFieldStyle}
                value={region}
                onChange={(e) => setRegion(e.target.value)}
              >
                <option value="">Région</option>
                {REGIONS_REELLES.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>

              <label htmlFor="hero-culture" style={srOnlyStyle}>Type de culture</label>
              <select
                id="hero-culture"
                style={heroFieldStyle}
                value={culture}
                onChange={(e) => setCulture(e.target.value)}
              >
                <option value="">Type de culture</option>
                {CULTURES.map((c) => (
                  <option key={c.label}>{c.label}</option>
                ))}
              </select>

              <label htmlFor="hero-budget" style={srOnlyStyle}>Budget max (MAD)</label>
              <input
                id="hero-budget"
                type="number"
                min={0}
                placeholder="Budget max (MAD)"
                style={heroFieldStyle}
                value={budgetMax}
                onChange={(e) => setBudgetMax(e.target.value)}
              />

              <Link href={hrefRecherche} style={{ flex: "1 1 140px" }}>
                <button
                  className="btn-primary"
                  style={{ width: "100%", backgroundColor: "var(--color-prairie)", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
                >
                  <Search size={16} /> Rechercher
                </button>
              </Link>
            </div>
          </Reveal>

          {/* Stats */}
          <Reveal delay={320}>
            <div style={{ display: "flex", justifyContent: "center", gap: "48px", paddingTop: "32px", flexWrap: "wrap" }}>
              {STATS.map((s) => (
                <StatCounter key={s.label} {...s} />
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ───── Parcelles vedettes ───── */}
      <section style={{ padding: "64px 24px", maxWidth: "1200px", margin: "0 auto" }}>
        <Reveal>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "32px", flexWrap: "wrap", gap: "12px" }}>
            <h2 style={{ fontSize: "24px", fontWeight: 500, color: "var(--color-texte)" }}>
              Les dernières opportunités foncières
            </h2>
            {vedettes.length > 0 && (
              <Link href="/parcelles" style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "14px", fontWeight: 500, color: "var(--color-foret)", textDecoration: "none" }}>
                Voir toutes les annonces <ArrowRight size={14} />
              </Link>
            )}
          </div>
        </Reveal>

        {vedettes.length === 0 ? (
          <Reveal>
            <p style={{ textAlign: "center", padding: "48px 24px", fontSize: "15px", color: "var(--color-secondaire)" }}>
              Les premières annonces arrivent bientôt.
            </p>
          </Reveal>
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
              {vedettes.map((p, i) => (
                <Reveal key={p.id} delay={i * 80}>
                  <CardParcelle parcelle={p} showComparaison={false} />
                </Reveal>
              ))}
            </div>

            <Reveal>
              <div style={{ textAlign: "center", marginTop: "40px" }}>
                <Link href="/parcelles">
                  <button className="btn-secondary">Voir toutes les annonces →</button>
                </Link>
              </div>
            </Reveal>
          </>
        )}
      </section>

      {/* ───── Comment ça marche ───── */}
      <section style={{ padding: "64px 24px", backgroundColor: "var(--color-rosee)" }}>
        <div style={{ maxWidth: "960px", margin: "0 auto" }}>
          <Reveal>
            <h2 style={{ fontSize: "24px", fontWeight: 500, textAlign: "center", color: "var(--color-texte)", marginBottom: "40px" }}>
              Comment ça marche
            </h2>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "24px" }}>
            {ETAPES.map(({ num, Icon, titre, desc }, i) => (
              <Reveal key={num} delay={i * 80}>
                <div className="card" style={{ padding: "24px", height: "100%" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                    <span
                      style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "999px",
                        backgroundColor: "var(--color-foret)",
                        color: "white",
                        fontSize: "12px",
                        fontWeight: 500,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {num}
                    </span>
                    <Icon size={20} style={{ color: "var(--color-foret)" }} />
                  </div>
                  <h3 style={{ fontSize: "16px", fontWeight: 500, color: "var(--color-texte)", marginBottom: "8px" }}>{titre}</h3>
                  <p style={{ fontSize: "14px", lineHeight: 1.6, color: "var(--color-secondaire)" }}>{desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ───── CTA propriétaire ───── */}
      <section style={{ position: "relative", overflow: "hidden", padding: "64px 24px", textAlign: "center", backgroundColor: "var(--color-foret)" }}>
        <ParcelGrid color="var(--color-topo-line-invert)" />
        <Reveal style={{ position: "relative", zIndex: 1 }}>
          <h2 style={{ fontSize: "24px", fontWeight: 500, color: "white", marginBottom: "12px" }}>
            Propriétaire ? Valorisez votre terrain agricole.
          </h2>
          <p style={{ fontSize: "16px", color: "var(--color-menthe)", marginBottom: "32px" }}>
            Rejoignez 800 propriétaires qui font confiance à AKAL pour vendre leur parcelle au meilleur prix.
          </p>
          <Link href="/publier">
            <button className="btn-accent" style={{ padding: "12px 32px" }}>
              Déposer mon annonce
            </button>
          </Link>
        </Reveal>
      </section>
    </div>
  );
}

const heroFieldStyle: React.CSSProperties = {
  flex: "1 1 140px",
  padding: "12px 16px",
  borderRadius: "var(--radius-btn)",
  fontSize: "14px",
  border: "none",
  outline: "none",
  backgroundColor: "transparent",
  color: "var(--color-texte)",
};

// Masque visuellement un label sans le retirer de l'arbre d'accessibilité
// (préserve le design existant de la barre de recherche hero).
const srOnlyStyle: React.CSSProperties = {
  position: "absolute",
  width: "1px",
  height: "1px",
  padding: 0,
  margin: "-1px",
  overflow: "hidden",
  clip: "rect(0,0,0,0)",
  whiteSpace: "nowrap",
  border: 0,
};
