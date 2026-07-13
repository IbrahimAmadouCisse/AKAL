"""
Locust load test — AKAL Catalogue & Détail Annonces.

Scénarios :
    1. CatalogueBrowser (poids 3) : requêtes filtrées sur /annonces/
    2. DetailViewer    (poids 1) : consultation de détails via slug

Usage :
    locust -f locustfile.py --host=http://127.0.0.1:8000

    Puis ouvrir http://localhost:8089 pour configurer le nombre
    d'utilisateurs virtuels et le taux de spawn.
"""

import random
import re

from locust import HttpUser, between, task


# ══════════════════════════════════════════════════════════════
# DONNÉES DE FILTRES (alignées sur AnnonceFilter)
# ══════════════════════════════════════════════════════════════

REGIONS = [1, 2, 3, 4, 5, 6]

STATUTS_FONCIERS = ['melkia', 'soulaliya', 'guich', 'habous', 'immatricule']

CULTURES = ['Blé', 'Olivier', 'Arganier', 'Maraîchage', 'Agrumes',
            'Fourrage', 'Palmier dattier', 'Vigne', 'Amandier', 'Cactus']

ACCES_EAU = ['irriguee', 'bour', 'mixte']

SORT_OPTIONS = ['prix', '-prix', 'date_publication', '-date_publication']


def _random_filters():
    """
    Génère un dict de filtres aléatoires pour le catalogue.

    Combine aléatoirement entre 1 et 4 filtres parmi ceux
    disponibles dans AnnonceFilter, pour simuler un usage réaliste.
    """
    filters = {}

    # Chaque filtre a une probabilité d'être inclus
    if random.random() < 0.6:
        filters['region'] = random.choice(REGIONS)

    if random.random() < 0.5:
        filters['statut_foncier'] = random.choice(STATUTS_FONCIERS)

    if random.random() < 0.4:
        filters['culture'] = random.choice(CULTURES)

    if random.random() < 0.3:
        filters['acces_eau'] = random.choice(ACCES_EAU)

    if random.random() < 0.4:
        prix_min = random.randint(50_000, 1_000_000)
        filters['prix_min'] = prix_min
        filters['prix_max'] = prix_min + random.randint(500_000, 4_000_000)

    if random.random() < 0.3:
        surface_min = random.randint(1, 50)
        filters['surface_min'] = surface_min
        filters['surface_max'] = surface_min + random.randint(10, 450)

    if random.random() < 0.5:
        filters['sort'] = random.choice(SORT_OPTIONS)

    # Pagination aléatoire
    if random.random() < 0.3:
        filters['page'] = random.randint(1, 20)

    # S'assurer d'avoir au moins 1 filtre
    if not filters:
        filters['region'] = random.choice(REGIONS)

    return filters


# ══════════════════════════════════════════════════════════════
# UTILISATEURS VIRTUELS LOCUST
# ══════════════════════════════════════════════════════════════

class CatalogueBrowser(HttpUser):
    """
    Simule un utilisateur qui browse le catalogue avec des filtres aléatoires.

    Poids 3 : représente la majorité du trafic (recherche > consultation).
    Wait time : 1-3 secondes entre chaque requête.
    """
    weight = 3
    wait_time = between(1, 3)

    @task(4)
    def browse_catalogue_filtered(self):
        """Requête catalogue avec combinaison aléatoire de filtres."""
        params = _random_filters()
        self.client.get('/annonces/', params=params, name='/annonces/?[filtered]')

    @task(2)
    def browse_catalogue_search(self):
        """Requête catalogue avec recherche textuelle."""
        search_terms = [
            'terrain', 'irrigué', 'olivier', 'montagne', 'fertile',
            'investissement', 'blé', 'arganier', 'plaine', 'clôturé',
        ]
        params = {'q': random.choice(search_terms)}
        # Ajouter parfois un filtre supplémentaire
        if random.random() < 0.5:
            params['region'] = random.choice(REGIONS)
        self.client.get('/annonces/', params=params, name='/annonces/?q=[search]')

    @task(1)
    def browse_catalogue_no_filter(self):
        """Requête catalogue sans filtre (page d'accueil du catalogue)."""
        self.client.get('/annonces/', name='/annonces/')


class DetailViewer(HttpUser):
    """
    Simule un utilisateur qui consulte les détails d'une annonce.

    Workflow : visite le catalogue d'abord, puis clique sur une annonce.
    Poids 1 : trafic secondaire par rapport à la recherche.
    Wait time : 2-5 secondes entre chaque requête.
    """
    weight = 1
    wait_time = between(2, 5)

    # Cache local des slugs découverts pour éviter de refaire
    # le parsing à chaque fois
    discovered_slugs = []

    @task
    def view_detail(self):
        """
        Visite une page de détail.

        Si aucun slug n'est connu, fait d'abord une requête catalogue
        pour en découvrir via le HTML (liens /annonces/<slug>/).
        """
        if not self.discovered_slugs:
            self._discover_slugs()

        if self.discovered_slugs:
            slug = random.choice(self.discovered_slugs)
            self.client.get(
                f'/annonces/{slug}/',
                name='/annonces/[slug]/',
            )
        else:
            # Fallback : browse le catalogue si aucun slug trouvé
            self.client.get('/annonces/', name='/annonces/ (fallback)')

    def _discover_slugs(self):
        """Parse la page catalogue pour extraire des slugs d'annonces."""
        with self.client.get(
            '/annonces/',
            params={'region': random.choice(REGIONS)},
            name='/annonces/ (discover)',
            catch_response=True,
        ) as response:
            if response.status_code == 200:
                # Extraction des slugs depuis les liens HTML
                # Pattern : /annonces/<slug>/
                slugs = re.findall(
                    r'/annonces/([\w-]+)/',
                    response.text,
                )
                # Filtrer les faux positifs (pages statiques, etc.)
                valid_slugs = [s for s in slugs if len(s) > 10]
                if valid_slugs:
                    self.discovered_slugs = list(set(valid_slugs))
                    response.success()
                else:
                    response.success()
            else:
                response.failure(f'Status {response.status_code}')
