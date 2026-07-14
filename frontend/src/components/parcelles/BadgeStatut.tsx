import type { StatutFoncier } from "@/types/parcelle";

// Mappe chaque slug de statut foncier (valeur brute API) vers sa classe CSS
// (globals.css) et son libellé d'affichage français. Exporté pour être
// réutilisé là où un <span> n'est pas possible (ex. <option> de FiltresSidebar).
export const STATUT_FONCIER_LABEL: Record<StatutFoncier, { classe: string; label: string }> = {
  immatricule: { classe: "badge-immatricule", label: "Immatriculé" },
  melkia: { classe: "badge-melkia", label: "Melkia" },
  soulaliya: { classe: "badge-soulaliya", label: "Soulaliya" },
  guich: { classe: "badge-guich", label: "Guich" },
  habous: { classe: "badge-habous", label: "Habous" },
};

export default function BadgeStatut({ statut }: { statut: StatutFoncier }) {
  const { classe, label } = STATUT_FONCIER_LABEL[statut];
  return <span className={classe}>{label}</span>;
}
