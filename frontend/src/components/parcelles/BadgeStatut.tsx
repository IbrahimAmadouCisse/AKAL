import type { StatutFoncier } from "@/data/parcelles";

// Mappe chaque statut foncier vers la classe CSS définie dans globals.css.
const CLASSE_PAR_STATUT: Record<StatutFoncier, string> = {
  Immatriculé: "badge-immatricule",
  Melkia: "badge-melkia",
  Soulaliya: "badge-soulaliya",
  Guich: "badge-guich",
  Habous: "badge-habous",
};

export default function BadgeStatut({ statut }: { statut: StatutFoncier }) {
  return <span className={CLASSE_PAR_STATUT[statut]}>{statut}</span>;
}
