# AKAL — Charte de nommage
**Version :** 1.0 — Juillet 2026
**Statut :** Applicable à partir du prochain commit (non rétroactive, sauf noms de champs et de contraintes du schéma, à corriger avant les migrations)
**Responsables :** Mégane (front-end, documents), Ibrahim (back-end, base de données)

---

## 1. Principe transverse — la règle du franglais

Le piège principal d'un projet marocain sur stack anglophone est le mélange incohérent français/anglais. La règle est tranchée une fois pour toutes :

> **Le vocabulaire métier reste en français. Le vocabulaire technique reste en anglais. Jamais de mélange dans un même identifiant.**

| Catégorie | Langue | Exemples |
|---|---|---|
| Entités et champs métier | Français | `Parcelle`, `Annonce`, `statut_foncier`, `type_culture`, `melkia`, `surface_ha` |
| Champs et préfixes techniques | Anglais | `created_at`, `updated_at`, `is_active`, `slug`, `metadata` |
| Verbes et actions de code | Anglais | `getParcelle()`, `formatPrix()`, `useFiltresParcelles` |
| Interdits | Mélange interne | ❌ `cultureType`, ❌ `parcelleList` → ✅ `typeCulture`, ✅ `listeParcelles` ou `parcelles` |

Règle de composition : préfixe technique anglais + nom de domaine français est autorisé (`useFiltresParcelles`, `is_vendue`), l'inverse ne l'est pas.

---

## 2. Git

### 2.1 Branches
Format : `type/scope-description` — tout en kebab-case, sans majuscules ni accents.

```
feat/catalogue-parcelles
fix/conversation-unique-constraint
refactor/card-parcelle-css
docs/plan-directeur
chore/ci-lint
test/agriscore-calcul
```

Types autorisés : `feat`, `fix`, `refactor`, `docs`, `chore`, `test`.

### 2.2 Commits — Conventional Commits
Format : `type(scope): description à l'impératif`

```
feat(catalogue): add filtre statut foncier
fix(schema): remove destinataire_id from CONVERSATION unique constraint
refactor(front): migrate CardParcelle inline styles to CSS classes
docs(api): add contrat de donnees v1
```

- **Scope** = module ou domaine : `catalogue`, `annonce`, `agriscore`, `messagerie`, `pipeline`, `schema`, `front`, `infra`, `api`.
- Description en anglais (verbes techniques), noms métier français conservés tels quels.
- Un commit = un changement logique. Pas de commit fourre-tout.

### 2.3 Pull Requests
Titre = même format que le commit principal. Corps : contexte, changements, points de vigilance pour le relecteur.

---

## 3. Front-end (Next.js + Tailwind v4)

| Élément | Convention | Exemples |
|---|---|---|
| Composants React | PascalCase, préfixe de famille | `CardParcelle.tsx`, `BadgeStatutFoncier.tsx`, `SkeletonCatalogue.tsx` |
| Hooks | camelCase, préfixe `use` | `useFiltresParcelles.ts`, `useDebounce.ts` |
| Utils / lib | camelCase | `formatPrix.ts`, `apiClient.ts`, `mapAnnonceToParcelle.ts` |
| Types TypeScript | PascalCase | `Parcelle`, `AnnonceDTO`, `FiltresCatalogue` |
| Dossiers | kebab-case | `components/catalogue/`, `components/ui/`, `lib/` |
| Pages (App Router) | kebab-case | `app/annonces/[slug]/page.tsx` |

### 3.1 Familles de composants
Les composants partageant une fonction UI sont préfixés par famille : `Card*`, `Badge*`, `Skeleton*`, `Modal*`, `Form*`. Cela regroupe naturellement les fichiers et rend le design system lisible.

### 3.2 CSS — BEM allégé + tokens
- Classes en kebab-case, BEM allégé : `.card-parcelle`, `.card-parcelle__score`, `.card-parcelle--vendue`
- Tokens de design centralisés dans `globals.css` (Tailwind v4, config CSS-only), préfixe `--akal-*` :

```css
--akal-foret: #2D6A4F;
--akal-nuit-verte: #1B3A2D;
--akal-prairie: #52B788;
--akal-terre-cuite: #C4622D;
--akal-ble-dore: #D4A017;
--akal-radius-card: 12px;
```

- Aucune couleur en dur dans les composants : toujours passer par un token.

---

## 4. Back-end (Django + DRF)

| Élément | Convention | Exemples |
|---|---|---|
| Apps Django | snake_case, pluriel métier | `annonces`, `comptes`, `messagerie`, `scoring`, `geo` |
| Modèles | PascalCase **singulier** | `Parcelle`, `Annonce`, `AgriScore`, `Conversation`, `DonneesGeo` |
| Champs | snake_case, unité incluse si ambiguë | `surface_ha`, `prix_mad`, `type_culture`, `statut_foncier` |
| Champs techniques | anglais standard Django | `created_at`, `updated_at`, `is_active`, `slug` |
| Booléens | préfixe `is_` / `has_` | `is_vendue`, `has_acces_eau` |
| Managers / méthodes | snake_case anglais + domaine FR | `get_parcelles_actives()`, `calculer_score()` |
| Services (couche inter-modules) | `services.py` par app | `scoring/services.py : calculer_agriscore(parcelle)` |

### 4.1 Endpoints DRF
- kebab-case, **pluriel**, préfixe `/api/` : `/api/annonces/`, `/api/parcelles/`, `/api/geo/regions/`
- Détail par slug : `/api/annonces/<slug>/`
- Endpoints service-à-service (pipeline Prefect) : préfixe `internal/` — `/api/internal/parcelles/<id>/metadata/`
- Jamais de verbe dans l'URL : l'action est portée par la méthode HTTP.

---

## 5. Base de données (PostgreSQL / PostGIS)

- **Tables** : nommage Django par défaut (`app_model` → `annonces_annonce`). Ne pas surcharger `db_table` sans raison.
- **Contraintes** : toujours nommées explicitement, format `type_table_champs` :

```python
class Meta:
    constraints = [
        models.UniqueConstraint(
            fields=["annonce", "initiateur"],
            name="uniq_conversation_annonce_initiateur",
        ),
    ]
```

- **Index** : `idx_table_champ` — `idx_annonce_statut`, `idx_parcelle_region`.
- **Clés JSONField** (`metadata` de `Parcelle`) : snake_case, mêmes règles franglais — `ndvi_moyen`, `type_sol`, `pluviometrie_mm`.
- **Migrations** : nommées explicitement quand elles sont structurantes — `python manage.py makemigrations --name add_type_culture_parcelle`.

---

## 6. Documents et livrables

Format : `AKAL_<Type>_<Sujet>_v<X>.<ext>`

```
AKAL_Note_Cadrage_v2.docx
AKAL_Plan_Directeur_v1.docx
AKAL_Contrat_Donnees_v1.md
AKAL_Charte_Nommage_v1.md
AKAL_Spec_AgriScore_v1.md
```

- Type : `Note`, `Plan`, `Contrat`, `Charte`, `Spec`, `Rapport`, `CR` (compte rendu).
- Version entière incrémentée à chaque diffusion externe (encadrant, école). Les brouillons internes restent en Git, pas en suffixe `_final_v3_ok`.

---

## 7. Gouvernance de la charte

- Toute modification passe par une PR sur ce fichier, validée par les deux stagiaires.
- Les exceptions ponctuelles sont documentées en commentaire de code avec la mention `# NOTE nommage:`.
- La charte s'applique en avançant : pas de refactoring massif rétroactif, **sauf** noms de champs et contraintes du schéma, à corriger avant les premières migrations de production.
