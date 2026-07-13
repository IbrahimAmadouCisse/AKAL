"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Parcelle } from "@/data/parcelles";
import BadgeStatut from "./BadgeStatut";
import ScoreBar from "./ScoreBar";
import { MapPin, Heart, Droplets, ArrowRight } from "@/components/icons/Icons";
import { useFavori } from "@/hooks/useFavori";
import { formatPrixMAD } from "@/lib/format";

type Props = {
  parcelle: Parcelle;
  enComparaison?: boolean;
  onToggleComparaison?: (id: number) => void;
  // Masque la case "Comparer" là où la comparaison n'est pas branchée
  // (ex. cartes vedettes de la home, hors du state de /parcelles).
  showComparaison?: boolean;
};

export default function CardParcelle({
  parcelle,
  enComparaison = false,
  onToggleComparaison,
  showComparaison = true,
}: Props) {
  const a = parcelle;
  const { favori, toggle: toggleFavori } = useFavori(a.titre);
  const [chargee, setChargee] = useState(false);

  return (
    <article className="card-parcelle">
      {/* Photo */}
      <div className="card-parcelle__media-wrap">
        {!chargee && <div className="card-parcelle__skeleton" />}
        <Image
          src={a.photos[0]}
          alt={a.titre}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
          className={`card-parcelle__media${chargee ? " is-loaded" : ""}`}
          onLoad={() => setChargee(true)}
        />

        {/* Badges en surimpression */}
        <div className="card-parcelle__badges">
          {a.badge && <span className="card-parcelle__badge">{a.badge}</span>}
          <BadgeStatut statut={a.statut} />
        </div>

        {/* Favori */}
        <button
          type="button"
          aria-label={favori ? "Retirer des favoris" : "Ajouter aux favoris"}
          aria-pressed={favori}
          onClick={toggleFavori}
          className={`card-parcelle__favori-btn${favori ? " is-active" : ""}`}
        >
          <Heart
            key={String(favori)}
            size={14}
            fill={favori ? "var(--color-terre)" : "none"}
            className={`card-parcelle__favori-icon${favori ? " is-active heart-pop" : ""}`}
          />
        </button>

        {/* CTA rapide — glisse au survol de la card (ou au focus clavier) */}
        <Link href={`/parcelles/${a.id}`} className="card-parcelle__cta-slide">
          Voir la fiche <ArrowRight size={11} />
        </Link>
      </div>

      {/* Corps */}
      <div className="card-parcelle__body">
        <Link href={`/parcelles/${a.id}`} className="card-parcelle__title-link">
          <h3 className="card-parcelle__title">{a.titre}</h3>
        </Link>

        <div className="card-parcelle__location">
          <MapPin size={11} />
          <span>{a.ville}, {a.region}</span>
        </div>

        {/* Tags */}
        <div className="card-parcelle__tags">
          {[`${a.surface} ha`, `${a.prixM2} MAD/m²`, a.culture].map((t) => (
            <span key={t} className="card-parcelle__tag">
              {t}
            </span>
          ))}
          {a.eau && <Droplets size={13} className="card-parcelle__water-icon" aria-label="Accès à l'eau" />}
        </div>

        <ScoreBar score={a.score} />

        {/* Prix + comparateur */}
        <div className="card-parcelle__footer">
          <span className="card-parcelle__price">{formatPrixMAD(a.prix)}</span>
          {showComparaison && (
            <label className="card-parcelle__compare-label">
              <input
                type="checkbox"
                checked={enComparaison}
                onChange={() => onToggleComparaison?.(a.id)}
                className="card-parcelle__compare-checkbox"
              />
              Comparer
            </label>
          )}
        </div>
      </div>
    </article>
  );
}
