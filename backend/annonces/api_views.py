"""
Vues API REST (DRF) de l'app annonces.

Endpoints conformes au contrat frontend/backend (§4) :
    - GET /api/annonces/        → Liste paginée avec filtres
    - GET /api/annonces/<slug>/ → Détail complet d'une annonce
"""

from django_filters import rest_framework as dj_filters
from rest_framework import generics, filters

from .models import Annonce, Parcelle
from .serializers import AnnonceListSerializer, AnnonceDetailSerializer


# ──────────────────────────────────────────────
# FilterSet DRF pour l'endpoint liste
# ──────────────────────────────────────────────

class AnnonceAPIFilter(dj_filters.FilterSet):
    """
    FilterSet pour l'API REST /api/annonces/.

    Paramètres query string :
        ?region=           → ID de la région
        ?type_culture=     → Culture (recherche dans metadata JSONField)
        ?statut_foncier=   → Statut foncier exact
        ?acces_eau=        → Accès eau exact
        ?prix_min=         → Prix minimum (>=)
        ?prix_max=         → Prix maximum (<=)
        ?surface_min=      → Surface minimum en ha (>=)
        ?surface_max=      → Surface maximum en ha (<=)
    """

    region = dj_filters.NumberFilter(
        field_name='parcelle__commune__province__region_id',
        label='Région (ID)',
    )
    type_culture = dj_filters.CharFilter(
        method='filter_type_culture',
        label='Type de culture',
    )
    statut_foncier = dj_filters.ChoiceFilter(
        field_name='parcelle__statut_foncier',
        choices=Parcelle.StatutFoncier.choices,
        label='Statut foncier',
    )
    acces_eau = dj_filters.ChoiceFilter(
        field_name='parcelle__acces_eau',
        choices=Parcelle.AccesEau.choices,
        label='Accès eau',
    )
    prix_min = dj_filters.NumberFilter(
        field_name='prix',
        lookup_expr='gte',
        label='Prix minimum (MAD)',
    )
    prix_max = dj_filters.NumberFilter(
        field_name='prix',
        lookup_expr='lte',
        label='Prix maximum (MAD)',
    )
    surface_min = dj_filters.NumberFilter(
        field_name='parcelle__surface',
        lookup_expr='gte',
        label='Surface minimum (ha)',
    )
    surface_max = dj_filters.NumberFilter(
        field_name='parcelle__surface',
        lookup_expr='lte',
        label='Surface maximum (ha)',
    )

    class Meta:
        model = Annonce
        fields = []

    def filter_type_culture(self, queryset, name, value):
        """Filtre sur le type de culture dans le JSONField metadata."""
        if not value:
            return queryset
        return queryset.filter(
            parcelle__metadata__culture__icontains=value
        )


# ──────────────────────────────────────────────
# Pagination custom
# ──────────────────────────────────────────────

from rest_framework.pagination import PageNumberPagination


class AnnoncePagination(PageNumberPagination):
    """Pagination conforme au contrat : page_size=12, max=50."""
    page_size = 12
    page_size_query_param = 'page_size'
    max_page_size = 50


# ──────────────────────────────────────────────
# Vues API
# ──────────────────────────────────────────────

class AnnonceListAPIView(generics.ListAPIView):
    """
    GET /api/annonces/

    Liste paginée des annonces en ligne avec filtres et tri.

    Pagination : PageNumberPagination (page_size=12, max=50)
    Réponse : { count, next, previous, results: [...] }

    Filtres query params :
        region, type_culture, statut_foncier, acces_eau,
        prix_min, prix_max, surface_min, surface_max

    Ordering (tri) :
        ?ordering=date_publication (ou -date_publication)
        ?ordering=prix (ou -prix, mapped depuis prix_mad)
        ?ordering=parcelle__surface (ou -, mapped depuis surface_ha)
    """

    serializer_class = AnnonceListSerializer
    pagination_class = AnnoncePagination
    filterset_class = AnnonceAPIFilter
    filter_backends = [
        dj_filters.DjangoFilterBackend,
        filters.OrderingFilter,
    ]
    ordering_fields = ['date_publication', 'prix', 'parcelle__surface']
    ordering = ['-date_publication']  # Tri par défaut

    def get_queryset(self):
        """Annonces en ligne avec relations pré-chargées."""
        return (
            Annonce.objects
            .en_ligne()
            .with_relations()
            .select_related('parcelle__agriscore')
        )


class AnnonceDetailAPIView(generics.RetrieveAPIView):
    """
    GET /api/annonces/<slug>/

    Détail complet d'une annonce (lookup par slug).
    """

    serializer_class = AnnonceDetailSerializer
    lookup_field = 'slug'

    def get_queryset(self):
        """Annonces en ligne avec toutes les relations."""
        return (
            Annonce.objects
            .en_ligne()
            .with_relations()
            .select_related('parcelle__agriscore')
        )
