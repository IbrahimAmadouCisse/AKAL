// Données fictives pour le catalogue de parcelles.
// À remplacer plus tard par un fetch vers l'API back (Ibrahim).

export type StatutFoncier =
  | "Immatriculé"
  | "Melkia"
  | "Soulaliya"
  | "Guich"
  | "Habous";

export type Parcelle = {
  id: number;
  titre: string;
  region: string;
  ville: string;
  surface: number; // en hectares
  prix: number; // en MAD
  prixM2: number; // MAD/m²
  culture: string;
  statut: StatutFoncier;
  eau: boolean;
  score: number; // AgriScore /100
  badge: string | null;
  coords: [number, number]; // [latitude, longitude]
  // Galerie : à terme, URLs Cloudinary. Pour le mock, images Unsplash.
  // photos[0] = image principale (utilisée dans les cards du catalogue).
  photos: string[];
};

export const PARCELLES: Parcelle[] = [
  {
    id: 1,
    titre: "Oliveraie certifiée bio — Meknès",
    region: "Meknès-Tafilalet",
    ville: "Aït Ourir",
    coords: [31.5722, -7.6694],
    surface: 4.2,
    prix: 1_260_000,
    prixM2: 30,
    culture: "Olivier",
    statut: "Immatriculé",
    eau: true,
    score: 82,
    badge: "Nouveau",
    photos: [
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=600&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=600&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800&h=600&fit=crop&auto=format",
    ],
  },
  {
    id: 2,
    titre: "Terrain irrigué polyculture — Souss",
    region: "Souss-Massa",
    ville: "Biougra",
    coords: [30.2128, -9.3700],
    surface: 8.7,
    prix: 2_088_000,
    prixM2: 24,
    culture: "Maraîchage",
    statut: "Melkia",
    eau: true,
    score: 67,
    badge: null,
    photos: [
      "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&h=600&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1560493676-04071c5f467b?w=800&h=600&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=800&h=600&fit=crop&auto=format",
    ],
  },
  {
    id: 3,
    titre: "Parcelle céréalière en bour — Meknès",
    region: "Meknès-Tafilalet",
    ville: "El Hajeb",
    coords: [33.6914, -5.3711],
    surface: 15.0,
    prix: 1_800_000,
    prixM2: 12,
    culture: "Céréales",
    statut: "Guich",
    eau: false,
    score: 54,
    badge: null,
    photos: [
      "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&h=600&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1467688480561-1ea027f2e8bd?w=800&h=600&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?w=800&h=600&fit=crop&auto=format",
    ],
  },
  {
    id: 4,
    titre: "Vignoble établi — Benslimane",
    region: "Casablanca-Settat",
    ville: "Benslimane",
    coords: [33.6128, -7.1228],
    surface: 3.1,
    prix: 1_550_000,
    prixM2: 50,
    culture: "Vigne",
    statut: "Immatriculé",
    eau: true,
    score: 91,
    badge: "Nouveau",
    photos: [
      "https://images.unsplash.com/photo-1543158181-e6f9f6712055?w=800&h=600&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?w=800&h=600&fit=crop&auto=format",
    ],
  },
  {
    id: 5,
    titre: "Agrumes — vallée du Gharb",
    region: "Rabat-Salé-Kénitra",
    ville: "Sidi Kacem",
    coords: [34.2214, -5.7081],
    surface: 6.5,
    prix: 1_950_000,
    prixM2: 30,
    culture: "Agrumes",
    statut: "Soulaliya",
    eau: true,
    score: 73,
    badge: null,
    photos: [
      "https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?w=800&h=600&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1587321773736-1d60aa5fe9d8?w=800&h=600&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1571576309635-f41d70e4e7e5?w=800&h=600&fit=crop&auto=format",
    ],
  },
  {
    id: 6,
    titre: "Terrain à aménager — Taourirt",
    region: "Oriental",
    ville: "Taourirt",
    coords: [34.4072, -2.8975],
    surface: 22.0,
    prix: 880_000,
    prixM2: 4,
    culture: "Polyculture",
    statut: "Melkia",
    eau: false,
    score: 41,
    badge: null,
    photos: [
      "https://images.unsplash.com/photo-1530267981375-f0de937f5f13?w=800&h=600&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1483871788521-4f224a86ef37?w=800&h=600&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1605000797498-6f2d4ef407d1?w=800&h=600&fit=crop&auto=format",
    ],
  },
];

export const REGIONS = [
  "Toutes les régions",
  "Meknès-Tafilalet",
  "Souss-Massa",
  "Casablanca-Settat",
  "Rabat-Salé-Kénitra",
  "Oriental",
];

export const CULTURES = [
  { label: "Céréales", emoji: "🌾" },
  { label: "Olivier", emoji: "🫒" },
  { label: "Maraîchage", emoji: "🍅" },
  { label: "Vigne", emoji: "🍇" },
  { label: "Agrumes", emoji: "🍊" },
];

export const STATUTS: StatutFoncier[] = [
  "Immatriculé",
  "Melkia",
  "Soulaliya",
  "Guich",
  "Habous",
];

// ---------------------------------------------------------------------------
// Filtres & tri (front uniquement, mock data).
// Logique pure et testable, prête à être remplacée par des query params API.
// ---------------------------------------------------------------------------

export type AccesEau = "Tous" | "Irriguée" | "Bour";

export type FiltresState = {
  recherche: string;
  region: string; // "Toutes les régions" = pas de filtre
  cultures: string[]; // vide = toutes
  statuts: StatutFoncier[]; // vide = tous
  prixMin: number | null;
  prixMax: number | null;
  surfaceMin: number | null;
  surfaceMax: number | null;
  eau: AccesEau;
};

export const FILTRES_INITIAUX: FiltresState = {
  recherche: "",
  region: "Toutes les régions",
  cultures: [],
  statuts: [],
  prixMin: null,
  prixMax: null,
  surfaceMin: null,
  surfaceMax: null,
  eau: "Tous",
};

export type Tri = "recent" | "prix_asc" | "prix_desc" | "surface" | "score";

// Normalise une chaîne pour comparaison insensible à la casse / aux accents.
function normaliser(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function filtrerParcelles(
  parcelles: Parcelle[],
  f: FiltresState,
): Parcelle[] {
  return parcelles.filter((p) => {
    // Recherche textuelle (titre, ville, région, culture)
    if (f.recherche.trim()) {
      const q = normaliser(f.recherche.trim());
      const cible = normaliser(`${p.titre} ${p.ville} ${p.region} ${p.culture}`);
      if (!cible.includes(q)) return false;
    }

    // Région
    if (f.region !== "Toutes les régions" && p.region !== f.region) return false;

    // Cultures (multi — OU logique)
    if (f.cultures.length > 0 && !f.cultures.includes(p.culture)) return false;

    // Statut foncier (multi — OU logique)
    if (f.statuts.length > 0 && !f.statuts.includes(p.statut)) return false;

    // Prix
    if (f.prixMin != null && p.prix < f.prixMin) return false;
    if (f.prixMax != null && p.prix > f.prixMax) return false;

    // Surface
    if (f.surfaceMin != null && p.surface < f.surfaceMin) return false;
    if (f.surfaceMax != null && p.surface > f.surfaceMax) return false;

    // Accès à l'eau
    if (f.eau === "Irriguée" && !p.eau) return false;
    if (f.eau === "Bour" && p.eau) return false;

    return true;
  });
}

export function trierParcelles(liste: Parcelle[], tri: Tri): Parcelle[] {
  const copie = [...liste];
  switch (tri) {
    case "prix_asc":
      return copie.sort((a, b) => a.prix - b.prix);
    case "prix_desc":
      return copie.sort((a, b) => b.prix - a.prix);
    case "surface":
      return copie.sort((a, b) => b.surface - a.surface);
    case "score":
      return copie.sort((a, b) => b.score - a.score);
    case "recent":
    default:
      // À défaut de date dans le mock, on garde l'ordre source (id décroissant
      // = plus récent en premier, à ajuster quand l'API fournira `createdAt`).
      return copie.sort((a, b) => b.id - a.id);
  }
}

// Indique si au moins un filtre est actif (utile pour un bouton "Réinitialiser").
export function filtresActifs(f: FiltresState): boolean {
  return (
    f.recherche.trim() !== "" ||
    f.region !== "Toutes les régions" ||
    f.cultures.length > 0 ||
    f.statuts.length > 0 ||
    f.prixMin != null ||
    f.prixMax != null ||
    f.surfaceMin != null ||
    f.surfaceMax != null ||
    f.eau !== "Tous"
  );
}