"use client";

import Link from "next/link";
import { PARCELLES } from "@/data/parcelles";
import CardParcelle from "@/components/parcelles/CardParcelle";
import { Search, ArrowRight, BarChart, MessageSquare } from "@/components/icons/Icons";

const STATS: [string, string][] = [
  ["1 240", "annonces actives"],
  ["12", "régions couvertes"],
  ["3 800+", "utilisateurs"],
];

const ETAPES = [
  {
    num: "01",
    Icon: Search,
    titre: "Parcourez le catalogue",
    desc: "Filtrez par région et budget. Trouvez les parcelles qui correspondent à vos critères.",
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

export default function Home() {
  // On met en avant les 3 premières parcelles comme "vedettes".
  const vedettes = PARCELLES.slice(0, 3);

  return (
    <div>
      {/* ───── Hero ───── */}
      <section style={{ position: "relative", overflow: "hidden", padding: "80px 24px", backgroundColor: "var(--color-nuit)" }}>
        <div style={{ position: "relative", maxWidth: "896px", margin: "0 auto", textAlign: "center" }}>
          {/* Logo */}
          <div style={{ marginBottom: "24px" }}>
            <span style={{ fontSize: "32px", fontWeight: 500, color: "white" }}>AKAL</span>
            <span className="tifinagh" style={{ display: "block", fontSize: "14px", color: "var(--color-menthe)", marginTop: "4px" }}>
              ⴰⴽⴰⵍ • La Terre
            </span>
          </div>

          <h1 style={{ fontSize: "44px", fontWeight: 500, lineHeight: 1.2, color: "white", margin: "0 0 16px" }}>
            Trouvez la terre<br />qui vous correspond
          </h1>
          <p style={{ fontSize: "18px", color: "var(--color-menthe)", maxWidth: "560px", margin: "0 auto" }}>
            AKAL transforme chaque parcelle en actif décisionnel grâce à l&apos;intelligence agronomique.
          </p>

          {/* Barre de recherche hero */}
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
            <select style={heroFieldStyle} defaultValue="">
              <option value="">Région</option>
              <option>Meknès-Tafilalet</option>
              <option>Souss-Massa</option>
              <option>Oriental</option>
            </select>
            <input placeholder="Budget max (MAD)" style={heroFieldStyle} />
            <Link href="/parcelles" style={{ flex: "1 1 140px" }}>
              <button
                className="btn-primary"
                style={{ width: "100%", backgroundColor: "var(--color-prairie)", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
              >
                <Search size={16} /> Rechercher
              </button>
            </Link>
          </div>

          {/* Stats */}
          <div style={{ display: "flex", justifyContent: "center", gap: "48px", paddingTop: "32px", flexWrap: "wrap" }}>
            {STATS.map(([n, l]) => (
              <div key={l} style={{ textAlign: "center" }}>
                <div style={{ fontSize: "24px", fontWeight: 500, color: "white" }}>{n}</div>
                <div style={{ fontSize: "12px", color: "var(--color-menthe)" }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── Parcelles vedettes ───── */}
      <section style={{ padding: "64px 24px", maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "32px", flexWrap: "wrap", gap: "12px" }}>
          <h2 style={{ fontSize: "24px", fontWeight: 500, color: "var(--color-texte)" }}>
            Les dernières opportunités foncières
          </h2>
          <Link href="/parcelles" style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "14px", fontWeight: 500, color: "var(--color-foret)", textDecoration: "none" }}>
            Voir toutes les annonces <ArrowRight size={14} />
          </Link>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" }}>
          {vedettes.map((p) => (
            <CardParcelle key={p.id} parcelle={p} enComparaison={false} onToggleComparaison={() => {}} />
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: "40px" }}>
          <Link href="/parcelles">
            <button className="btn-secondary">Voir toutes les annonces →</button>
          </Link>
        </div>
      </section>

      {/* ───── Comment ça marche ───── */}
      <section style={{ padding: "64px 24px", backgroundColor: "var(--color-rosee)" }}>
        <div style={{ maxWidth: "960px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "24px", fontWeight: 500, textAlign: "center", color: "var(--color-texte)", marginBottom: "40px" }}>
            Comment ça marche
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "24px" }}>
            {ETAPES.map(({ num, Icon, titre, desc }) => (
              <div key={num} className="card" style={{ padding: "24px" }}>
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
            ))}
          </div>
        </div>
      </section>

      {/* ───── CTA propriétaire ───── */}
      <section style={{ padding: "64px 24px", textAlign: "center", backgroundColor: "var(--color-foret)" }}>
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