"""
Tests pour l'app annonces.

Couvre :
    - AnnonceQuerySet.en_ligne() et with_relations()
    - AnnonceFilter (filtres à facettes : prix, région, texte, culture)
    - Algorithme de recommandation parcelles_similaires
    - CatalogueView.paginate_queryset (comportement sur pages invalides)
"""
from decimal import Decimal

from django.contrib.gis.geos import Point
from django.test import RequestFactory, TestCase
from django.utils import timezone

from accounts.models import User
from geo.models import Commune, Province, Region

from .filters import AnnonceFilter
from .models import Annonce, Parcelle
from .views import CatalogueView


# ──────────────────────────────────────────────────────────────────────
# Mixin : helpers partagés entre les classes de tests
# ──────────────────────────────────────────────────────────────────────

class AnnonceMixin:
    """
    Méthodes utilitaires pour créer des fixtures minimales.
    À mixer avec TestCase dans chaque classe de test.
    """

    commune_fm: Commune
    commune_ms: Commune
    user: User

    def _geo_and_user(self):
        """Crée régions, provinces, communes et un utilisateur de test."""
        r_fm = Region.objects.create(id=1, nom='Fès-Meknès', code='FM')
        r_ms = Region.objects.create(id=2, nom='Marrakech-Safi', code='MS')
        p_mek = Province.objects.create(id=101, region=r_fm, nom='Meknès', code='MEK')
        p_mrk = Province.objects.create(id=102, region=r_ms, nom='Marrakech', code='MRK')
        self.commune_fm = Commune.objects.create(id=1001, province=p_mek, nom='Aïn Taoujdate')
        self.commune_ms = Commune.objects.create(id=1002, province=p_mrk, nom='Tahannaout')
        self.user = User.objects.create_user(
            email='test@akal.ma', password='x',
            nom='Test', prenom='Dev', role='PROPRIETAIRE',
        )

    def _parcelle(self, commune=None, surface='5.00', culture=None,
                  lat=33.94, lng=-5.22):
        return Parcelle.objects.create(
            commune=commune or self.commune_fm,
            surface=Decimal(surface),
            statut_foncier='melkia',
            acces_eau='irriguee',
            topographie='plat',
            acces_routier='goudron',
            geom=Point(lng, lat, srid=4326),
            metadata={'culture': culture or ['Blé']},
        )

    def _annonce(self, parcelle, titre='Test', prix='500000',
                 statut='en_ligne', description='description de test'):
        return Annonce.objects.create(
            parcelle=parcelle,
            proprietaire=self.user,
            titre=titre,
            description=description,
            prix=Decimal(prix),
            statut_annonce=statut,
            date_publication=timezone.now() if statut == 'en_ligne' else None,
        )


# ──────────────────────────────────────────────────────────────────────
# AnnonceQuerySet.en_ligne() et with_relations()
# ──────────────────────────────────────────────────────────────────────

class EnLigneQuerySetTests(AnnonceMixin, TestCase):

    def setUp(self):
        self._geo_and_user()

    def test_retourne_annonces_en_ligne(self):
        p = self._parcelle()
        a = self._annonce(p, statut='en_ligne')
        self.assertIn(a, Annonce.objects.en_ligne())

    def test_exclut_brouillon(self):
        p = self._parcelle()
        a = self._annonce(p, statut='brouillon')
        self.assertNotIn(a, Annonce.objects.en_ligne())

    def test_exclut_archivee(self):
        p = self._parcelle()
        a = self._annonce(p, statut='archivee')
        self.assertNotIn(a, Annonce.objects.en_ligne())

    def test_exclut_vendue(self):
        p = self._parcelle()
        a = self._annonce(p, statut='vendue')
        self.assertNotIn(a, Annonce.objects.en_ligne())

    def test_with_relations_evite_n_plus_1(self):
        """select_related + prefetch_related : 3 annonces en 2 requêtes SQL."""
        for i in range(3):
            self._annonce(self._parcelle(), titre=f'Test {i}')

        with self.assertNumQueries(2):  # 1 JOIN principal + 1 prefetch photos
            annonces = list(Annonce.objects.en_ligne().with_relations())
            for a in annonces:
                _ = a.parcelle.commune.province.region.nom
                _ = a.proprietaire.email


# ──────────────────────────────────────────────────────────────────────
# AnnonceFilter — filtres à facettes
# ──────────────────────────────────────────────────────────────────────

class AnnonceFilterTests(AnnonceMixin, TestCase):

    def setUp(self):
        self._geo_and_user()
        # Deux annonces aux caractéristiques distinctes
        p_fm = self._parcelle(commune=self.commune_fm, culture=['Blé', 'Olivier'])
        p_ms = self._parcelle(commune=self.commune_ms, culture=['Arganier'])
        self.a_fm = self._annonce(p_fm, titre='Terrain blé Meknès',
                                  description='sol argilo-limoneux', prix='400000')
        self.a_ms = self._annonce(p_ms, titre='Arganier Marrakech',
                                  description='forêt arganier', prix='900000')

    def _filter(self, params):
        return AnnonceFilter(data=params, queryset=Annonce.objects.en_ligne()).qs

    # ── Prix ─────────────────────────────────────────────────────────

    def test_prix_min_exclut_annonces_moins_cheres(self):
        qs = self._filter({'prix_min': '500000'})
        self.assertNotIn(self.a_fm, qs)   # 400 000 < 500 000
        self.assertIn(self.a_ms, qs)      # 900 000 >= 500 000

    def test_prix_max_exclut_annonces_plus_cheres(self):
        qs = self._filter({'prix_max': '500000'})
        self.assertIn(self.a_fm, qs)      # 400 000 <= 500 000
        self.assertNotIn(self.a_ms, qs)   # 900 000 > 500 000

    def test_fourchette_prix_retient_seul_element_dans_la_plage(self):
        qs = self._filter({'prix_min': '350000', 'prix_max': '450000'})
        self.assertIn(self.a_fm, qs)
        self.assertNotIn(self.a_ms, qs)

    # ── Région ───────────────────────────────────────────────────────

    def test_filtre_region_retient_bonne_region(self):
        qs = self._filter({'region': '1'})   # Fès-Meknès
        self.assertIn(self.a_fm, qs)
        self.assertNotIn(self.a_ms, qs)

    def test_filtre_multi_region(self):
        qs = self._filter({'region': '1,2'})
        self.assertIn(self.a_fm, qs)
        self.assertIn(self.a_ms, qs)

    # ── Recherche textuelle ───────────────────────────────────────────

    def test_recherche_sur_titre(self):
        qs = self._filter({'q': 'Meknès'})
        self.assertIn(self.a_fm, qs)
        self.assertNotIn(self.a_ms, qs)

    def test_recherche_sur_description(self):
        qs = self._filter({'q': 'argilo'})
        self.assertIn(self.a_fm, qs)
        self.assertNotIn(self.a_ms, qs)

    def test_recherche_sans_resultats_retourne_qs_vide(self):
        qs = self._filter({'q': 'xyz_inexistant'})
        self.assertFalse(qs.exists())

    # ── Culture ───────────────────────────────────────────────────────

    def test_filtre_culture_element_exact(self):
        qs = self._filter({'culture': 'Arganier'})
        self.assertIn(self.a_ms, qs)
        self.assertNotIn(self.a_fm, qs)

    def test_filtre_culture_element_dans_liste_multi(self):
        # a_fm a culture=['Blé', 'Olivier'] — rechercher 'Olivier' doit le retourner
        qs = self._filter({'culture': 'Olivier'})
        self.assertIn(self.a_fm, qs)
        self.assertNotIn(self.a_ms, qs)

    def test_filtre_culture_pas_de_correspondance_partielle(self):
        # 'Blé' ne doit pas matcher 'Arganier' (no icontains substring leak)
        qs = self._filter({'culture': 'Blé'})
        self.assertNotIn(self.a_ms, qs)


# ──────────────────────────────────────────────────────────────────────
# Algorithme de recommandation parcelles_similaires
# ──────────────────────────────────────────────────────────────────────

class ParcelleSimilairesTests(AnnonceMixin, TestCase):
    """
    Teste la logique de recommandation directement au niveau queryset
    (identique à AnnonceDetailView.get_context_data et
    AnnonceDetailSerializer.get_similaires).
    """

    def setUp(self):
        self._geo_and_user()

    def _similaires(self, ref_annonce):
        """Reproduit exactement l'algorithme de recommandation."""
        from django.db.models import Q
        prix_min = ref_annonce.prix * Decimal('0.8')
        prix_max = ref_annonce.prix * Decimal('1.2')
        region_id = ref_annonce.parcelle.commune.province.region_id
        q = Q(parcelle__commune__province__region_id=region_id)
        cultures = ref_annonce.parcelle.metadata.get('culture', [])
        if isinstance(cultures, str):
            cultures = [cultures]
        for culture in cultures:
            q |= Q(parcelle__metadata__culture__contains=[culture])
        return (
            Annonce.objects.en_ligne()
            .exclude(id=ref_annonce.id)
            .filter(prix__gte=prix_min, prix__lte=prix_max)
            .filter(q)
            .with_relations()
            .distinct()
        )

    def test_meme_region_et_prix_recommandee(self):
        ref = self._annonce(self._parcelle(commune=self.commune_fm, culture=['Blé']), prix='500000')
        candidat = self._annonce(self._parcelle(commune=self.commune_fm, culture=['Orge']), prix='480000')
        self.assertIn(candidat, self._similaires(ref))

    def test_meme_culture_autre_region_recommandee(self):
        ref = self._annonce(self._parcelle(commune=self.commune_fm, culture=['Blé']), prix='500000')
        candidat = self._annonce(self._parcelle(commune=self.commune_ms, culture=['Blé']), prix='490000')
        self.assertIn(candidat, self._similaires(ref))

    def test_autre_region_et_autre_culture_exclue(self):
        ref = self._annonce(self._parcelle(commune=self.commune_fm, culture=['Blé']), prix='500000')
        hors_scope = self._annonce(self._parcelle(commune=self.commune_ms, culture=['Arganier']), prix='490000')
        self.assertNotIn(hors_scope, self._similaires(ref))

    def test_prix_au_dessus_fourchette_exclu(self):
        ref = self._annonce(self._parcelle(commune=self.commune_fm), prix='500000')
        trop_cher = self._annonce(self._parcelle(commune=self.commune_fm), prix='700000')
        # 700 000 > 500 000 * 1.2 = 600 000
        self.assertNotIn(trop_cher, self._similaires(ref))

    def test_prix_en_dessous_fourchette_exclu(self):
        ref = self._annonce(self._parcelle(commune=self.commune_fm), prix='500000')
        trop_pas_cher = self._annonce(self._parcelle(commune=self.commune_fm), prix='300000')
        # 300 000 < 500 000 * 0.8 = 400 000
        self.assertNotIn(trop_pas_cher, self._similaires(ref))

    def test_annonce_courante_exclue(self):
        ref = self._annonce(self._parcelle(commune=self.commune_fm), prix='500000')
        self.assertNotIn(ref, self._similaires(ref))

    def test_limite_a_trois_resultats(self):
        ref = self._annonce(self._parcelle(commune=self.commune_fm), prix='500000')
        for _ in range(5):
            self._annonce(self._parcelle(commune=self.commune_fm), prix='490000')
        self.assertEqual(self._similaires(ref)[:3].count(), 3)

    def test_statut_non_en_ligne_exclu_des_similaires(self):
        ref = self._annonce(self._parcelle(commune=self.commune_fm), prix='500000')
        brouillon = self._annonce(self._parcelle(commune=self.commune_fm),
                                  prix='490000', statut='brouillon')
        self.assertNotIn(brouillon, self._similaires(ref))


# ──────────────────────────────────────────────────────────────────────
# CatalogueView.paginate_queryset — comportements aux limites
# ──────────────────────────────────────────────────────────────────────

class PaginationTests(AnnonceMixin, TestCase):

    def setUp(self):
        self._geo_and_user()
        # 15 annonces → 2 pages à page_size=12
        for i in range(15):
            self._annonce(self._parcelle(), titre=f'Annonce {i:02d}')

    def _view_for_page(self, page):
        request = RequestFactory().get('/', {'page': page})
        view = CatalogueView()
        view.request = request
        view.kwargs = {}
        view.args = []
        return view

    def test_page_non_entiere_retourne_page_1(self):
        _, page, _, _ = self._view_for_page('abc').paginate_queryset(
            Annonce.objects.en_ligne(), 12
        )
        self.assertEqual(page.number, 1)

    def test_page_hors_limites_retourne_derniere_page(self):
        qs = Annonce.objects.en_ligne()
        paginator, page, _, _ = self._view_for_page('999').paginate_queryset(qs, 12)
        self.assertEqual(page.number, paginator.num_pages)

    def test_page_last_retourne_derniere_page(self):
        qs = Annonce.objects.en_ligne()
        paginator, page, _, _ = self._view_for_page('last').paginate_queryset(qs, 12)
        self.assertEqual(page.number, paginator.num_pages)

    def test_page_valide_retourne_bonne_page(self):
        _, page, _, _ = self._view_for_page('2').paginate_queryset(
            Annonce.objects.en_ligne(), 12
        )
        self.assertEqual(page.number, 2)
