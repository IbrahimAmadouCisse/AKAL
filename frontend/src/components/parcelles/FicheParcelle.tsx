"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import type { Parcelle } from "@/data/parcelles";
import BadgeStatut from "./BadgeStatut";
import ScoreBar from "./ScoreBar";
import CarrouselPhotos from "./CarrouselPhotos";
import BlocCaracteristiques from "./BlocCaracteristiques";
import SimulateurROI from "./SimulateurROI";
import {
  MapPin,
  Heart,
  Droplets,
  Phone,
  Share2,
  FileText,
  ChevronLeft,
  MessageSquare,
} from "@/components/icons/Icons";
import { useFavori } from "@/hooks/useFavori";
import { useToast } from "@/components/toast/ToastProvider";
import { formatPrixMAD } from "@/lib/format";
import Reveal from "@/components/motion/Reveal";

const CarteFiche = dynamic(() => import("./CarteLeafletFiche"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        height: "100%",
        borderRadius: "var(--radius-card)",
        backgroundColor: "var(--color-menthe)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--color-foret)",
        fontSize: "14px",
      }}
    >
      Chargement de la carte…
    </div>
  ),
});

const DESCRIPTIONS: string[] = [
  "Ce terrain présente des caractéristiques agronomiques remarquables, avec un sol bien équilibré et une exposition favorable. La parcelle bénéficie d'une accessibilité routière satisfaisante, facilitant les opérations agricoles et la logistique.",
  "L'état général du foncier est bon. Les documents cadastraux sont disponibles et consultables sur demande. Le vendeur est disponible pour organiser une visite de terrain afin d'apprécier les qualités de la parcelle in situ.",
  "Une opportunité à saisir pour tout investisseur souhaitant développer une activité agricole durable au Maroc, dans une région à fort potentiel de valorisation.",
];

function agriScoreLegende(score: number): string {
  if (score >= 75) return "Excellentes conditions agropédologiques. Sol fertile, bonne rétention hydrique.";
  if (score >= 50) return "Conditions correctes. Quelques aménagements peuvent améliorer le potentiel.";
  return "Potentiel limité. Convient à des cultures extensives ou à la pâture.";
}

export default function FicheParcelle({ parcelle: a }: { parcelle: Parcelle }) {
  const { favori, toggle: toggleFavori } = useFavori(a.titre);
  const { showToast } = useToast();
  const bientotDisponible = () => showToast("Bientôt disponible", "info");

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "24px 20px 64px" }}>

      {/* Fil d'Ariane */}
      <nav
        aria-label="Fil d'Ariane"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          fontSize: "13px",
          color: "var(--color-tertiaire)",
          marginBottom: "20px",
          flexWrap: "wrap",
        }}
      >
        <Link href="/" style={{ color: "var(--color-tertiaire)", textDecoration: "none" }}>
          Accueil
        </Link>
        <span>/</span>
        <Link href="/parcelles" style={{ color: "var(--color-tertiaire)", textDecoration: "none" }}>
          Catalogue
        </Link>
        <span>/</span>
        <span style={{ color: "var(--color-texte)" }}>{a.titre}</span>
      </nav>

      {/* Retour (mobile only) */}
      <Link
        href="/parcelles"
        className="hidden-desktop"
        style={{ alignItems: "center", gap: "6px", fontSize: "14px", color: "var(--color-foret)", textDecoration: "none", marginBottom: "16px" }}
      >
        <ChevronLeft size={16} />
        Retour au catalogue
      </Link>

      {/* ── Layout 2 colonnes ────────────────────────────────────── */}
      <div className="fiche-layout">

        {/* Colonne principale */}
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "28px" }}>

          {/* Carrousel photos */}
          <CarrouselPhotos photos={a.photos} titre={a.titre} badge={a.badge} />

          {/* Titre + localisation + badges */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              <BadgeStatut statut={a.statut} />
              {a.eau && (
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    padding: "4px 10px",
                    borderRadius: "999px",
                    fontSize: "12px",
                    fontWeight: 500,
                    backgroundColor: "#EBF5FB",
                    color: "#1A6EA4",
                  }}
                >
                  <Droplets size={11} />
                  Irriguée
                </span>
              )}
            </div>

            <h1 style={{ fontSize: "22px", fontWeight: 500, color: "var(--color-nuit)", lineHeight: 1.3, margin: 0 }}>
              {a.titre}
            </h1>

            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "14px", color: "var(--color-tertiaire)" }}>
              <MapPin size={14} />
              <span>{a.ville}, {a.region}</span>
            </div>
          </div>

          {/* AgriScore */}
          <Reveal>
            <div className="card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "14px", fontWeight: 500, color: "var(--color-texte)" }}>AgriScore</span>
                <span
                  style={{
                    fontSize: "11px",
                    color: "var(--color-tertiaire)",
                    backgroundColor: "var(--color-fond-input)",
                    padding: "2px 8px",
                    borderRadius: "999px",
                  }}
                >
                  Indice agronomique / 100
                </span>
              </div>
              <ScoreBar score={a.score} />
              <p style={{ fontSize: "12px", color: "var(--color-secondaire)", margin: 0 }}>
                {agriScoreLegende(a.score)}
              </p>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <BlocCaracteristiques parcelle={a} />
          </Reveal>

          {/* Description */}
          <Reveal delay={160}>
            <section>
              <h2
                style={{
                  fontSize: "16px",
                  fontWeight: 500,
                  color: "var(--color-nuit)",
                  margin: "0 0 16px",
                  paddingBottom: "10px",
                  borderBottom: "1px solid var(--color-bordure)",
                }}
              >
                Description
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {DESCRIPTIONS.map((p, i) => (
                  <p key={i} style={{ fontSize: "14px", lineHeight: 1.75, color: "var(--color-secondaire)", margin: 0 }}>
                    {p}
                  </p>
                ))}
              </div>
            </section>
          </Reveal>

          <Reveal delay={240}>
            <SimulateurROI prix={a.prix} culture={a.culture} />
          </Reveal>

          {/* Localisation */}
          <Reveal delay={320}>
            <section>
              <h2
                style={{
                  fontSize: "16px",
                  fontWeight: 500,
                  color: "var(--color-nuit)",
                  margin: "0 0 16px",
                  paddingBottom: "10px",
                  borderBottom: "1px solid var(--color-bordure)",
                }}
              >
                Localisation
              </h2>
              <div style={{ height: "320px", borderRadius: "var(--radius-card)", overflow: "hidden" }}>
                <CarteFiche parcelle={a} />
              </div>
            </section>
          </Reveal>
        </div>

        {/* ── Colonne contact (sticky) ─────────────────────────── */}
        <aside className="fiche-aside">
          <div className="card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>

            {/* Prix */}
            <div>
              <div style={{ fontSize: "26px", fontWeight: 500, color: "var(--color-foret)" }}>
                {formatPrixMAD(a.prix)}
              </div>
              <div style={{ fontSize: "13px", color: "var(--color-tertiaire)", marginTop: "4px" }}>
                {a.prixM2} MAD/m² · {a.surface} ha
              </div>
            </div>

            <div style={{ height: "1px", backgroundColor: "var(--color-bordure)" }} />

            {/* CTAs */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <button
                type="button"
                onClick={bientotDisponible}
                className="btn-primary"
                style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
              >
                <MessageSquare size={15} />
                Contacter le vendeur
              </button>
              <button
                type="button"
                onClick={bientotDisponible}
                className="btn-secondary"
                style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
              >
                <FileText size={15} />
                Télécharger la fiche PDF
              </button>
            </div>

            <div style={{ height: "1px", backgroundColor: "var(--color-bordure)" }} />

            {/* Conseiller */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <span
                style={{
                  fontSize: "10px",
                  color: "var(--color-tertiaire)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                Votre conseiller AKAL
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    backgroundColor: "var(--color-foret)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    fontSize: "14px",
                    fontWeight: 500,
                    color: "white",
                  }}
                >
                  YA
                </div>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 500, color: "var(--color-nuit)" }}>
                    Youssef Aït Brahim
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      fontSize: "13px",
                      color: "var(--color-tertiaire)",
                      marginTop: "2px",
                    }}
                  >
                    <Phone size={12} />
                    +212 6 12 34 56 78
                  </div>
                </div>
              </div>
            </div>

            <div style={{ height: "1px", backgroundColor: "var(--color-bordure)" }} />

            {/* Favoris + partager */}
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                type="button"
                aria-pressed={favori}
                onClick={toggleFavori}
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  padding: "10px",
                  borderRadius: "8px",
                  border: `1px solid ${favori ? "var(--color-terre)" : "var(--color-bordure)"}`,
                  backgroundColor: favori ? "#FEF3EE" : "transparent",
                  color: favori ? "var(--color-terre)" : "var(--color-secondaire)",
                  fontSize: "13px",
                  cursor: "pointer",
                  transition: "all var(--duration-base) var(--ease-premium)",
                }}
              >
                <Heart key={String(favori)} size={14} fill={favori ? "var(--color-terre)" : "none"} className={favori ? "heart-pop" : undefined} />
                {favori ? "Sauvegardé" : "Sauvegarder"}
              </button>
              <button
                type="button"
                onClick={bientotDisponible}
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  padding: "10px",
                  borderRadius: "8px",
                  border: "1px solid var(--color-bordure)",
                  backgroundColor: "transparent",
                  color: "var(--color-secondaire)",
                  fontSize: "13px",
                  cursor: "pointer",
                  transition: "background-color var(--duration-base) var(--ease-premium)",
                }}
              >
                <Share2 size={14} />
                Partager
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* ── Barre contact fixe mobile ──────────────────────────── */}
      <div
        className="hidden-desktop"
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          backgroundColor: "white",
          borderTop: "1px solid var(--color-bordure)",
          padding: "12px 16px",
          alignItems: "center",
          gap: "12px",
          boxShadow: "0 -4px 16px rgba(0,0,0,0.08)",
        }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "16px", fontWeight: 500, color: "var(--color-foret)" }}>
            {formatPrixMAD(a.prix)}
          </div>
          <div style={{ fontSize: "12px", color: "var(--color-tertiaire)" }}>
            {a.prixM2} MAD/m²
          </div>
        </div>
        <button
          type="button"
          onClick={bientotDisponible}
          className="btn-primary"
          style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}
        >
          <MessageSquare size={14} />
          Contacter
        </button>
      </div>
    </div>
  );
}
