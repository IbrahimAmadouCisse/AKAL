# SPEC — Correctifs backend AKAL (conformité contrat v1.1 → v1.2)

> **Instructions pour l'outil de coding :** applique les tâches ci-dessous dans l'ordre, une par une.
> Après chaque tâche, exécute son critère de vérification avant de passer à la suivante.
> Ne modifie RIEN d'autre que ce qui est spécifié. Ne touche pas aux vues HTML de compatibilité,
> au pipeline, ni aux settings hors des points listés.
> Référence : `docs/AKAL_Contrat_Donnees_v1.1.md` (le contrat fait foi).
> Toutes les migrations se font sur la feature branch courante. Base de dev : les données
> peuvent être détruites/reseedées (`seed_demo`), aucune donnée de prod n'existe.

---

## T1 🔴 RGPD — ProprietaireSerializer n'expose que l'UUID
**Fichier :** `annonces/serializers.py` (~lignes 74-79)
**Constaté :** expose `nom`, `prenom`, `telephone` ; pas de champ `id`.
**Attendu (contrat §4.5, loi 09-08) :** le DTO public expose UNIQUEMENT `{ "id": "<uuid>" }`. Aucun nom, email, téléphone.
**Actions :**
1. Si le modèle User n'a pas de champ UUID : ajouter `uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)` + migration.
2. `ProprietaireSerializer` : `fields = ['id']` avec `id = serializers.UUIDField(source='uuid', read_only=True)` (adapter le `source` au nom réel du champ).
**Vérification :** `curl localhost:8000/api/annonces/<slug>/ | python -m json.tool` → le bloc `proprietaire` contient exactement une clé `id` (UUID), rien d'autre.

---

## T2 🔴 Liste — restaurer le sous-objet `parcelle` (interdiction d'aplatir)
**Fichier :** `annonces/serializers.py` (~lignes 102-117, `AnnonceListSerializer`)
**Constaté :** `surface_ha`, `region`, `statut_foncier`, `acces_eau` sont au niveau racine de l'annonce.
**Attendu (contrat §3.1 + §4.4) :** ces champs vivent dans un sous-objet `parcelle`, jamais à la racine.
**Actions :**
1. Créer `ParcelleListSerializer` : `id` (UUID), `surface_ha`, `statut_foncier`, `acces_eau`, `region` (voir T5), `localisation` (voir T6, version liste = latitude/longitude seulement).
2. Dans `AnnonceListSerializer` : remplacer les champs aplatis par `parcelle = ParcelleListSerializer(read_only=True)`.
3. Conserver à la racine : `id`, `slug`, `titre`, `prix_mad`, `statut`, `score_courant` (score_global seul), `photo_principale`, `created_at`.
**Vérification :** `curl localhost:8000/api/annonces/` → chaque résultat a une clé `parcelle` objet ; `surface_ha` n'existe PAS à la racine.

---

## T3 🔴 Renommages de champs modèle (alignement contrat §3)
**Fichiers :** `annonces/models.py` + migration
**Constaté / Attendu :**
| Modèle | Constaté | Attendu (contrat) |
|---|---|---|
| Annonce | `prix` | `prix_mad` |
| Annonce | `statut_annonce` | `statut` |
| Parcelle | `surface` | `surface_ha` |
**Actions :** renommer via `migrations.RenameField` (une seule migration nommée `rename_fields_contrat_v1_1`). Mettre à jour toutes les références (serializers, filters, admin, seed, ordering).
**Vérification :** `python manage.py makemigrations --check --dry-run` → aucun changement en attente ; `grep -rn "statut_annonce\|'prix'\|\"prix\"" annonces/ --include="*.py"` → zéro occurrence résiduelle hors migrations.

---

## T4 🟠 Ordering — noms de paramètres du contrat
**Fichier :** `annonces/api_views.py` (~ligne 131) et/ou `annonces/filters.py`
**Constaté :** `ordering_fields = ['date_publication', 'prix', 'parcelle__surface']` — `?ordering=-prix_mad` est ignoré silencieusement.
**Attendu (contrat §4.2) :** paramètres acceptés : `date_publication`, `prix_mad`, `surface_ha` (préfixe `-` pour desc). Aucun autre champ accepté.
**Action :** utiliser `django_filters.OrderingFilter` avec mapping explicite dans le FilterSet branché à l'API :
```python
ordering = django_filters.OrderingFilter(
    fields=(
        ('date_publication', 'date_publication'),
        ('prix_mad', 'prix_mad'),
        ('parcelle__surface_ha', 'surface_ha'),
    )
)
```
(retirer l'`OrderingFilter` DRF de la vue si doublon).
**Vérification :** `curl "localhost:8000/api/annonces/?ordering=-prix_mad"` → résultats triés prix décroissant ; `?ordering=prix` → ignoré ou 400, jamais appliqué.

---

## T5 🟠 Filtre et sérialisation `region`
**Fichiers :** `annonces/api_views.py` (~lignes 35-38), `annonces/serializers.py` (~lignes 56 et 104)
**Constaté :** filtre = `NumberFilter` sur `region_id` (le front envoie un code string → ne matche jamais) ; réponse = string `region.nom`.
**Attendu (contrat §4.2 + §4.4) :** filtre par code slug (`?region=casablanca-settat`) ; réponse = objet `{"code": ..., "nom": ...}`.
**Actions :**
1. Filtre : `region = django_filters.CharFilter(field_name='parcelle__region__code', lookup_expr='exact')`.
2. Serializer : `RegionSerializer(fields=['code','nom'])` imbriqué dans `ParcelleListSerializer` ET le serializer détail.
**Vérification :** `curl "localhost:8000/api/annonces/?region=<code-du-seed>"` → count > 0 et toutes les annonces de cette région ; le JSON contient `"region": {"code": "...", "nom": "..."}`.

---

## T6 🟠 Sous-objet `localisation`
**Fichier :** `annonces/serializers.py`
**Constaté :** `latitude`/`longitude` à plat sous `parcelle`, pas d'`adresse_approximative`.
**Attendu (contrat §4.4) :** `parcelle.localisation = {latitude, longitude, adresse_approximative}` en détail ; `{latitude, longitude}` seulement en liste.
**Actions :** `LocalisationSerializer` (SerializerMethodField ou serializer imbriqué). `adresse_approximative` : si aucun champ modèle n'existe, retourner `"<commune>, Maroc"` ou `null` — ne PAS inventer de champ modèle.
**Vérification :** détail → `parcelle.localisation.latitude` présent ; liste → `localisation` sans `adresse_approximative`.

---

## T7 🔴 Conversation — contrainte et retrait de `destinataire`
**Fichier :** `messaging/models.py` + migration `messaging/migrations/0002_*`
**Constaté :** `UniqueConstraint(['annonce','initiateur','destinataire'], name='unique_conversation')`, FK `destinataire` présente. Aucune migration.
**Attendu (contrat §3.7) :** FK `destinataire` SUPPRIMÉE (déductible = vendeur de l'annonce) ; contrainte `UniqueConstraint(fields=['annonce','initiateur'], name='uniq_conversation_annonce_initiateur')`.
**Actions :** retirer le champ, remplacer la contrainte, mettre à jour serializers/vues messaging qui référencent `destinataire` (le destinataire se calcule : `conversation.annonce.vendeur`). Migration unique.
**Vérification :** `python manage.py migrate` passe sur base vierge ; `grep -rn "destinataire" messaging/ --include="*.py"` → zéro occurrence hors migrations.

---

## T8 🔴 AgriScore — historisation
**Fichier :** modèle AgriScore + migration
**Constaté :** `OneToOneField(Parcelle)`, champ `version_algo`.
**Attendu (contrat §3.5) :** `ForeignKey(Parcelle, related_name='scores')` ; champ renommé `version_ponderation`.
**Actions :** `AlterField` OneToOne→FK + `RenameField`. Vérifier que la logique `score_courant` (api_views/serializers ~146-150) sélectionne bien LE PLUS RÉCENT : `parcelle.scores.order_by('-created_at').first()` (et retourne `None` si vide — comportement existant à conserver).
**Vérification :** en shell Django, créer 2 scores pour une même parcelle → pas d'IntegrityError ; l'API renvoie le plus récent.

---

## T9 ⚫ DÉCISION PO — retrait de `type_culture` (amendement contrat v1.2)
**Décision Product Owner (Mégane, datée) :** `type_culture` est RETIRÉ du périmètre. Ne PAS créer le champ modèle prévu au contrat v1.1.
**Constaté :** `SerializerMethodField` exposant `metadata.get('culture', [])` + filtre `icontains` sur JSONField (`annonces/filters.py:137-139`).
**Actions :**
1. Supprimer le champ `type_culture` des serializers (liste et détail).
2. Supprimer le filtre `culture`/`type_culture` du FilterSet API.
3. NE PAS toucher au JSONField `metadata` (la clé `culture` peut y rester pour le pipeline — elle n'est simplement plus exposée ni filtrable).
4. Retirer `type_culture` de toute règle de validation de publication si présente.
**Vérification :** le JSON API ne contient aucune clé `type_culture`/`culture` ; `?type_culture=x` n'a aucun effet.
**Note :** l'amendement du document contrat (v1.2) est fait côté Mégane, pas dans cette spec.

---

## T10 🟡 Nettoyage — un seul FilterSet branché
**Fichiers :** `annonces/filters.py` (`AnnonceFilter`) vs `annonces/api_views.py` (`AnnonceAPIFilter`)
**Constaté :** deux FilterSet parallèles incohérents ; seul `AnnonceAPIFilter` est branché à l'API.
**Actions :** si `AnnonceFilter` est encore utilisé par les vues HTML de compatibilité, ajouter un commentaire d'en-tête `# LEGACY — vues HTML uniquement. Le FilterSet de l'API est AnnonceAPIFilter (api_views.py). Ne pas modifier pour l'API.` Sinon, le supprimer.
**Vérification :** `grep -rn "AnnonceFilter" --include="*.py"` → chaque usage est identifié et commenté ou supprimé.

---

## T11 🟢 Cosmétique seed — codes région en slug
**Fichier :** `seed_demo.py`
**Action :** remplacer les codes `FM`, `SM`… par des slugs (`fes-meknes`, `souss-massa`, `casablanca-settat`…) conformes à l'exemple du contrat.
**Vérification :** `/api/geo/regions/` renvoie des codes en kebab-case.

---

## Vérification finale globale (obligatoire avant push)
```bash
python manage.py migrate --run-syncdb   # sur base vierge
python manage.py seed_demo             # ou la commande de seed existante
curl -s localhost:8000/api/annonces/ | python -m json.tool
```
Comparer manuellement la sortie au JSON d'exemple du contrat §4.4 (moins `type_culture`, retiré en T9). Checklist :
- [ ] `parcelle` en sous-objet, rien d'aplati
- [ ] `prix_mad`, `surface_ha`, `statut` (pas `prix`, `surface`, `statut_annonce`)
- [ ] `region` = `{code, nom}`, filtre `?region=<slug>` fonctionnel
- [ ] `?ordering=-prix_mad` et `?ordering=surface_ha` fonctionnels
- [ ] `proprietaire` = `{id: <uuid>}` uniquement
- [ ] annonce sans score → `"score_courant": null`
- [ ] aucune clé `type_culture`
- [ ] `grep destinataire messaging/` propre, deux scores possibles par parcelle

Commit suggéré : `fix(api): align serializers, filters and schema with contrat v1.1 (T1-T11)`
