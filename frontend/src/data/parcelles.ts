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
  // Photo : à terme, URL Cloudinary. Pour le mock, une image Unsplash.
  photo: string;
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
    photo: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&h=450&fit=crop&auto=format",
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
    photo: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&h=450&fit=crop&auto=format",
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
    photo: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600&h=450&fit=crop&auto=format",
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
    photo: "https://images.unsplash.com/photo-1543158181-e6f9f6712055?w=600&h=450&fit=crop&auto=format",
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
    photo: "https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?w=600&h=450&fit=crop&auto=format",
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
    photo: "https://images.unsplash.com/photo-1530267981375-f0de937f5f13?w=600&h=450&fit=crop&auto=format",
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