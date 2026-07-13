// Formatage monétaire partagé (MAD) — évite de redéclarer Intl.NumberFormat("fr-MA")
// dans chaque composant qui affiche un prix.

const fmt = new Intl.NumberFormat("fr-MA");

export function formatPrixMAD(n: number): string {
  return `${fmt.format(Math.round(n))} MAD`;
}

// Version compacte pour les capitaux (ex: 1 260 000 -> "1 260 k").
export function formatPrixCourt(n: number): string {
  return n >= 1000 ? `${fmt.format(Math.round(n / 1000))} k` : fmt.format(Math.round(n));
}

export { fmt };
