# AKAL — Contrat de données
**Version :** 1.1 — Juillet 2026 *(fusion du Contrat de données v1.0 et du draft Contrat API v1)*
**Statut :** À relire par Ibrahim (PR), puis soumis à validation académique (échéance explicite, silence vaut accord sous 5 jours ouvrés)
**Parties :** Back-end Django/DRF (producteur — Ibrahim) · Front-end Next.js (consommateur — Mégane) · Pipeline d'enrichissement Prefect (producteur secondaire — Ibrahim)

**Changelog v1.0 → v1.1 :**
- Format d'erreurs : abandon du format custom au profit du format natif DRF (coût/bénéfice)
- `agriscore` explicitement nullable + comportement front défini
- Médias : bucket MinIO public en lecture tranché (vs URLs pré-signées)
- Query params de filtrage détaillés (`page_size` max 50, `ordering`)
- Convention d'URL `/api/geo/regions/<code>/communes/` réservée pour MT4
- Propriétaire anonymisé dans les DTO publics (RGPD / loi 09-08)
- `type_culture` en enum fermée confirmée côté API

---

## 1. Objet et portée

Ce contrat fixe **la structure, la sémantique et les règles d'échange des données** entre les composants d'AKAL. Il fait autorité sur :

1. Le schéma des entités métier (source de vérité : modèles Django, base PostgreSQL/PostGIS unique du monolithe modulaire) ;
2. Le contrat de l'API REST publique consommée par le front (périmètre v1 : **lecture**, jalon J1) ;
3. Le contrat de l'endpoint interne consommé par le pipeline Prefect.

**Documentation vivante :** le schéma OpenAPI généré par drf-spectacular (`/api/schema/swagger-ui/`, JSON brut sur `/api/schema/`) fait foi en cas de divergence après implémentation ; ce document est alors mis à jour, jamais l'inverse silencieusement.

Toute divergence constatée entre ce contrat et l'implémentation est remontée **par écrit** (issue GitHub, label `api-mismatch`), jamais à l'oral.

---

## 2. Conventions transverses

| Sujet | Règle |
|---|---|
| Nommage | Charte de nommage AKAL v1 — métier FR, technique EN, `snake_case` partout côté API. Si le front veut du camelCase en interne, la conversion se fait côté front (`mapAnnonceToParcelle()`), jamais imposée au back |
| Identifiants | **UUID v4 exposés à l'API** ; les PK entières restent internes (anti-énumération du catalogue et des comptes) |
| Dates | ISO 8601 UTC — `2026-07-13T14:30:00Z` |
| Monnaie | MAD implicite, entier — champ `prix_mad`. Pas de champ `devise` (multi-devise hors scope) |
| Surfaces | Hectares implicites, decimal(10,2) — champ `surface_ha`. Pas de champ `unite_surface` |
| Géométries | SRID 4326 (WGS 84), GeoJSON à l'API |
| Encodage | UTF-8 partout (Tifinagh et arabe inclus) |
| Tableaux | Toujours `[]` si vide, jamais `null` (simplifie le rendu front) |
| Base URL | Variable d'environnement front (`NEXT_PUBLIC_API_URL`), jamais en dur. Dev local : `http://localhost:8000/api/` |
| Format d'échange | JSON uniquement (`Content-Type: application/json`) |
| Nullabilité | Explicite champ par champ ; tout champ non marqué nullable est requis |

---

## 3. Schéma des entités

> Ce schéma intègre les **correctifs pré-migrations** (étape 0.5 — Ibrahim, feature branch, pas de merge sans validation) : ajout de `type_culture`, correction de la contrainte CONVERSATION, AgriScore en OneToMany, isolation des géométries lourdes, ordre photos unifié, extraction du compteur `vues`.

### 3.1 Parcelle — le bien foncier lui-même
La séparation Parcelle / Annonce est structurante : AgriScore et l'enrichissement géospatial décrivent **la terre**, pas l'annonce. C'est ce qui permet l'historique de prix par parcelle (futur jeu d'entraînement ML). **Cette séparation est préservée dans les DTO API** (sous-objet `parcelle`), jamais aplatie.

| Champ | Type | Contraintes | Notes |
|---|---|---|---|
| `id` | UUID | PK | |
| `titre` | varchar(100) | requis | |
| `region` / `province` / `commune` | FK référentiel geo | requis | Sélecteur en cascade |
| `latitude` / `longitude` | decimal | requis | Point de référence léger |
| `surface_ha` | decimal(10,2) | requis, > 0 | |
| `type_culture` | varchar (**enum fermée**) | requis | `agrumes`, `cereales`, `olivier`, `maraichage`, `arboriculture`, `vigne`, … — jamais de texte libre (fiabilité des filtres + homogénéité AgriScore) |
| `statut_foncier` | varchar (choices) | requis | `melkia`, `soulaliya`, `guich`, `habous`, `immatricule` |
| `acces_eau` | varchar (choices) | requis | `irriguee`, `bour`, `mixte` |
| `topographie` | varchar (choices) | optionnel | |
| `metadata` | JSONField | `default=dict` | Réservé enrichissement Phase 3 (NDVI, sol, pluviométrie) — clés snake_case |
| `created_at` / `updated_at` | datetime | auto | |

### 3.2 DonneesGeo — géométries lourdes isolées
| Champ | Type | Contraintes | Notes |
|---|---|---|---|
| `parcelle` | OneToOne → Parcelle | requis | |
| `contour` | PolygonField (PostGIS) | optionnel | Retiré de PARCELLE — **jamais sérialisé dans les endpoints liste**, servi uniquement sur le détail à la demande |

### 3.3 Annonce — la mise en marché
| Champ | Type | Contraintes | Notes |
|---|---|---|---|
| `id` | UUID | PK | |
| `slug` | slug | unique, requis | Clé d'accès API détail — ex. `parcelle-5ha-berrechid-agrumes` |
| `parcelle` | FK → Parcelle | requis | Plusieurs annonces possibles dans le temps pour une même parcelle |
| `vendeur` | FK → User | requis | Jamais exposé nominativement (voir §4.5) |
| `titre` | varchar(50) | requis | |
| `description` | text(500) | requis | |
| `prix_mad` | integer | requis, > 0 | |
| `statut` | varchar (choices) | requis | `en_attente`, `en_ligne`, `archivee`, `vendue` — vocabulaire unique partagé avec le dashboard propriétaire |
| `date_publication` | datetime | nullable | Renseigné au passage `en_ligne` |
| `created_at` / `updated_at` | datetime | auto | `updated_at` ne reflète que les modifications éditoriales |

### 3.4 StatistiqueAnnonce — compteurs extraits
| Champ | Type | Notes |
|---|---|---|
| `annonce` | FK → Annonce | Le compteur `vues` est sorti d'ANNONCE : il polluait `updated_at` et interdisait l'analyse temporelle |
| `date` | date | Une ligne par jour → séries temporelles pour le dashboard GIO |
| `vues` | integer | |

### 3.5 AgriScore — historisé
| Champ | Type | Contraintes | Notes |
|---|---|---|---|
| `parcelle` | **FK → Parcelle** | requis | OneToMany : l'historique des scores est le futur jeu d'entraînement ML |
| `score_global` | integer 0–100 | requis | |
| `sous_scores` | JSONField | requis | ⚠️ **Clés PROVISOIRES en attente de finalisation des critères (MT4)** : `fertilite`, `situation_hydrique`, `accessibilite`, `situation_juridique`, `potentiel_valorisation`. Le front ne doit pas typer ces clés en dur — itérer dynamiquement sur l'objet |
| `version_ponderation` | varchar | requis | Traçabilité : quel jeu de poids a produit ce score |
| `created_at` | datetime | auto | |

**Règles :**
- Le « score courant » d'une parcelle = le plus récent `created_at`. Jamais de mise à jour en place.
- `score_courant` est **nullable côté API** : si aucun score n'a encore été calculé, le champ vaut `null` et le front affiche « Score en cours de calcul » — jamais d'erreur, jamais de 0 trompeur.

### 3.6 Photo
| Champ | Type | Contraintes | Notes |
|---|---|---|---|
| `annonce` | FK → Annonce | requis | |
| `image` | ImageField | requis | Stockage objet (MinIO en prod via django-storages) — jamais en base |
| `ordre` | integer | requis, unique par annonce, commence à 0 | **`ordre` est la source de vérité unique. La photo principale = `ordre 0`. Aucun champ `is_principale` / `is_cover`** (double logique conflictuelle, supprimée au correctif schéma n°5) |

### 3.7 Conversation / Message
| Champ | Type | Contraintes | Notes |
|---|---|---|---|
| `annonce` | FK → Annonce | requis | |
| `initiateur` | FK → User | requis | |
| — | contrainte | `UNIQUE(annonce, initiateur)` → `uniq_conversation_annonce_initiateur` | `destinataire_id` retiré : le destinataire est déductible (vendeur de l'annonce), l'inclure permettait des doublons |

Message : `conversation` (FK), `auteur` (FK User), `contenu` (text), `is_lu` (bool), `created_at`.

### 3.8 User / Favori
- User custom : rôle `proprietaire` / `investisseur`, email unique vérifié.
- Favori : `UNIQUE(user, annonce)` → `uniq_favori_user_annonce`.

---

## 4. Contrat API REST (front ↔ back) — périmètre v1 : lecture

Authentification : **hors périmètre v1** (endpoints de lecture publics). Avenant v1.1 pour l'écriture (auth JWT httpOnly, favoris, dépôt, messagerie) — le front travaille sur mocks (`NEXT_PUBLIC_USE_MOCKS`) en attendant.

### 4.1 Endpoints

| Méthode | URL | Retour |
|---|---|---|
| GET | `/api/annonces/` | Liste paginée, filtres en query params |
| GET | `/api/annonces/<slug>/` | Détail complet (annonce + parcelle + photos + score courant). `404` si slug inconnu |
| GET | `/api/geo/regions/` | Référentiel régions — **non paginé** (référentiel fixe) : `[{ "code": "casablanca-settat", "nom": "Casablanca-Settat" }, …]` |
| — | `/api/geo/regions/<code>/communes/` | **Convention d'URL réservée**, non implémentée en v1. La cartographie MT4/GIO en aura besoin ; on fixe la convention maintenant pour ne pas la casser plus tard |

### 4.2 Query params de `/api/annonces/`

| Param | Type | Exemple | Description |
|---|---|---|---|
| `page` | int | `?page=2` | Numéro de page |
| `page_size` | int | `?page_size=20` | Défaut **12** (grille catalogue), **max 50** borné côté back (anti-abus) |
| `region` | slug | `?region=casablanca-settat` | Filtre par code région |
| `type_culture` | enum | `?type_culture=agrumes` | Aligné sur le nom du champ en base — zéro renommage dans le serializer |
| `statut_foncier` | enum | `?statut_foncier=melkia` | |
| `acces_eau` | enum | `?acces_eau=irriguee` | |
| `prix_min` / `prix_max` | int | `?prix_min=100000` | En MAD |
| `surface_min` / `surface_max` | decimal | `?surface_min=1` | En hectares |
| `ordering` | string | `?ordering=-date_publication` | Champs autorisés : `date_publication`, `prix_mad`, `surface_ha` — préfixe `-` pour desc |

### 4.3 Pagination — DRF `PageNumberPagination` standard

```json
{
  "count": 132,
  "next": "http://localhost:8000/api/annonces/?page=3",
  "previous": "http://localhost:8000/api/annonces/?page=1",
  "results": []
}
```

Justification : comportement par défaut de DRF (zéro code back), `next`/`previous` en URLs absolues prêtes à l'emploi (zéro recalcul front), documenté nativement par drf-spectacular.

### 4.4 Structure JSON d'une annonce

```json
{
  "id": "3f2b6c9e-8a41-4d2c-9f1e-7b5a2c8d4e10",
  "slug": "parcelle-5ha-berrechid-agrumes",
  "titre": "Parcelle agricole 5 ha — Berrechid",
  "description": "Terrain agricole irrigué, exposition sud…",
  "prix_mad": 450000,
  "statut": "en_ligne",
  "date_publication": "2026-06-01T09:30:00Z",
  "parcelle": {
    "id": "a1c4e7f0-2b5d-4e8a-b3c6-d9f2a5b8c1e4",
    "surface_ha": 5.00,
    "type_culture": "agrumes",
    "statut_foncier": "melkia",
    "acces_eau": "irriguee",
    "region": { "code": "casablanca-settat", "nom": "Casablanca-Settat" },
    "localisation": {
      "latitude": 33.2653,
      "longitude": -7.5878,
      "adresse_approximative": "Berrechid, Maroc"
    }
  },
  "score_courant": {
    "score_global": 78,
    "sous_scores": {
      "fertilite": 82,
      "situation_hydrique": 70,
      "accessibilite": 75,
      "situation_juridique": 80,
      "potentiel_valorisation": 76
    },
    "version_ponderation": "v1.0"
  },
  "photos": [
    {
      "id": "b2d5f8a1-3c6e-4f9b-a4d7-e0a3b6c9d2f5",
      "url": "https://media.akal.ma/annonces/3f2b6c9e/photo-0.webp",
      "ordre": 0
    }
  ],
  "proprietaire": { "id": "c3e6a9b2-4d7f-4a0c-b5e8-f1b4c7d0e3a6" },
  "created_at": "2026-05-28T14:12:00Z",
  "updated_at": "2026-06-01T09:30:00Z"
}
```

**Règles de sérialisation :**
- Le sous-objet `parcelle` est **toujours présent** — jamais aplati dans l'annonce (la séparation Parcelle/Annonce est la décision architecturale porteuse du dataset ML).
- La version **liste** est un sous-ensemble allégé : `id`, `slug`, `titre`, `prix_mad`, `statut`, `parcelle` (sans `localisation.adresse_approximative`), `score_courant.score_global` seul, `photo_principale` (URL de la photo `ordre 0`), `created_at`.
- `score_courant` : `null` si aucun score calculé → le front affiche « Score en cours », jamais d'erreur.
- `photos` : toujours un tableau trié par `ordre` croissant, `[]` si vide.
- Le contour PostGIS (`DonneesGeo`) n'apparaît **ni en liste ni en détail v1** — endpoint dédié futur si besoin carto.

### 4.5 Exposition du propriétaire (RGPD / loi 09-08)
Le DTO public n'expose **jamais** le nom réel, l'email ou le téléphone du vendeur — uniquement son UUID. L'identité n'est révélée qu'après mise en relation via la messagerie (hors périmètre v1). Usage standard des marketplaces + minimisation des données conforme au plan directeur (MT6/SIO).

### 4.6 Format des erreurs — natif DRF, sans surcouche

Erreur simple (404) :
```json
{ "detail": "Annonce introuvable." }
```

Erreur de validation par champ (400, futurs endpoints d'écriture) :
```json
{ "prix_mad": ["Ce champ doit être un nombre positif."] }
```

Justification : zéro travail back (comportement natif DRF), documenté automatiquement par drf-spectacular, cas d'erreur métier riches rares en v1 lecture. Côté front, la lecture d'erreur est centralisée dans un unique helper de `lib/api.ts` (`detail` pour les erreurs simples, clés de champ pour les 400).

**Codes HTTP (lecture v1) :** `200` succès · `400` paramètres invalides · `404` ressource introuvable · `500` erreur serveur.

### 4.7 URLs médias — piège MinIO/`/media` tranché

**Décision : URLs absolues + bucket MinIO public en lecture.**

1. `MEDIA_URL` pointe vers l'endpoint public MinIO (ou un CDN devant), **jamais** vers le domaine de l'API Django.
2. Chaque URL reçue est directement utilisable dans `<img src>` — **le front ne concatène jamais de préfixe**.
3. Bucket **public en lecture** plutôt que pré-signé : les photos d'annonces sont publiques par nature, les URLs stables permettent le cache navigateur/CDN et le SSR Next.js sans expiration. Les documents sensibles futurs (CIN, titres fonciers — F16) iront dans un bucket privé pré-signé distinct, hors périmètre v1.

---

## 5. Contrat interne pipeline (Prefect ↔ back)

| Sujet | Règle |
|---|---|
| Endpoint | `PATCH /api/internal/parcelles/<id>/metadata/` |
| Auth | Token de service dédié, jamais le token d'un utilisateur |
| Payload | Fusion partielle du JSONField `metadata` — clés snake_case : `ndvi_moyen`, `type_sol`, `pluviometrie_mm`, `date_enrichissement` |
| Idempotence | Rejouer le même enrichissement ne crée aucun doublon ni effet de bord |
| Interdiction | Le pipeline n'écrit **jamais** directement en base : toujours via l'endpoint interne |

---

## 6. Règles de qualité des données

1. Une annonce ne passe `en_ligne` que si : parcelle géolocalisée, `type_culture` renseigné, ≥ 1 photo, prix > 0.
2. Aucun champ métier libre là où une enum existe (`type_culture`, `statut_foncier`, `acces_eau`, `statut`).
3. Les données scrapées (R-04) entrent avec un flag `source = "scraping"` et ne sont jamais mélangées silencieusement aux dépôts propriétaires.
4. Suppression d'une annonce = archivage logique (`statut = archivee`), jamais de DELETE physique tant que des conversations y sont rattachées.

---

## 7. Gouvernance et versioning

- **Sources de vérité :** ce document (intention) + le schéma OpenAPI généré (implémentation). En cas de conflit après implémentation, le Swagger gagne et ce document est mis à jour par PR.
- **Modification :** PR sur ce fichier, revue croisée obligatoire (Mégane + Ibrahim). Changement cassant (suppression/renommage de champ, changement de type) → incrément de version majeure et préavis d'un sprint.
- **Validation académique :** soumis à M. Baroud avec échéance explicite ; sans réponse sous 5 jours ouvrés, le contrat est réputé validé (consentement tracé, conforme au protocole du plan directeur).

### Prochaines étapes
1. Ibrahim relit et amende ce document (PR, commentaires ou édition directe).
2. Ibrahim applique les correctifs schéma §3 sur feature branch (étape 0.5) + pose drf-spectacular.
3. Validation croisée : comparaison Swagger généré ↔ ce document, correction des écarts.
4. Merge dans `docs/AKAL_Contrat_Donnees_v1.1.md` + envoi à M. Baroud avec échéance.
