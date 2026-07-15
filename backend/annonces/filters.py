"""
# LEGACY — Vues HTML uniquement.
# Le FilterSet de l'API est AnnonceAPIFilter (api_views.py). Ne pas modifier pour l'API.

FilterSet django-filter pour le modèle Annonce (vues template).

Centralise toute la logique de filtrage à facettes :
- Recherche textuelle (Q objects sur titre + description)
- Filtres exacts, in, et par plage (prix, surface)
- Tri dynamique (OrderingFilter)

Chaque paramètre GET est validé et converti automatiquement
par django-filter avant d'atteindre l'ORM.
"""

import django_filters
from django.db.models import Q

from .models import Annonce, Parcelle


class AnnonceFilter(django_filters.FilterSet):
    """
    # LEGACY — Vues HTML uniquement.
    # Le FilterSet de l'API est AnnonceAPIFilter (api_views.py). Ne pas modifier pour l'API.

    FilterSet pour les annonces du catalogue (vues template).

    Paramètres GET supportés :
        ?q=             → Recherche textuelle (titre OU description)
        ?region=        → ID région (supporte multi : ?region=1&region=3)
        ?statut_foncier=→ Statut foncier (supporte multi : ?statut_foncier=melkia&statut_foncier=guich)
        ?acces_eau=     → Accès eau (choix exact)
        ?prix_min=      → Prix minimum (>=)
        ?prix_max=      → Prix maximum (<=)
        ?surface_min=   → Surface minimum en ha (>=)
        ?surface_max=   → Surface maximum en ha (<=)
        ?sort=          → Tri : prix_mad, -prix_mad, date_publication, -date_publication
    """

    # ── Recherche textuelle ──────────────────────────────────
    q = django_filters.CharFilter(
        method='filter_search',
        label='Recherche',
    )

    # ── Filtres géographiques ────────────────────────────────
    region = django_filters.BaseInFilter(
        field_name='parcelle__commune__province__region_id',
        lookup_expr='in',
        label='Région(s)',
    )

    # ── Filtres sur la parcelle ──────────────────────────────
    statut_foncier = django_filters.BaseInFilter(
        field_name='parcelle__statut_foncier',
        lookup_expr='in',
        label='Statut foncier',
    )

    acces_eau = django_filters.ChoiceFilter(
        field_name='parcelle__acces_eau',
        choices=Parcelle.AccesEau.choices,
        label='Accès eau',
    )

    # ── Filtres par plage : prix ─────────────────────────────
    prix_min = django_filters.NumberFilter(
        field_name='prix_mad',
        lookup_expr='gte',
        label='Prix minimum (MAD)',
    )

    prix_max = django_filters.NumberFilter(
        field_name='prix_mad',
        lookup_expr='lte',
        label='Prix maximum (MAD)',
    )

    # ── Filtres par plage : surface ──────────────────────────
    surface_min = django_filters.NumberFilter(
        field_name='parcelle__surface_ha',
        lookup_expr='gte',
        label='Surface minimum (ha)',
    )

    surface_max = django_filters.NumberFilter(
        field_name='parcelle__surface_ha',
        lookup_expr='lte',
        label='Surface maximum (ha)',
    )

    # ── Tri dynamique ────────────────────────────────────────
    sort = django_filters.OrderingFilter(
        fields=(
            ('prix_mad', 'prix_mad'),
            ('date_publication', 'date_publication'),
        ),
        field_labels={
            'prix_mad': 'Prix',
            'date_publication': 'Date de publication',
        },
        label='Trier par',
    )

    class Meta:
        model = Annonce
        fields = []  # Tous les champs sont déclarés explicitement ci-dessus

    # ── Méthodes de filtrage custom ──────────────────────────

    def filter_search(self, queryset, name, value):
        """
        Recherche textuelle insensible à la casse.

        Combine les champs titre et description avec un OR logique
        via des Q objects Django.
        """
        if not value:
            return queryset
        return queryset.filter(
            Q(titre__icontains=value) | Q(description__icontains=value)
        )
