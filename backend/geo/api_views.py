"""
Vues API REST (DRF) de l'app geo.

    GET /api/geo/regions/ → Référentiel des régions (non paginé)
"""

from rest_framework import generics

from .models import Region
from .serializers import RegionSerializer


class RegionListAPIView(generics.ListAPIView):
    """
    GET /api/geo/regions/

    Retourne la liste complète des régions du Maroc.
    Non paginé (référentiel statique).
    """

    serializer_class = RegionSerializer
    queryset = Region.objects.all().order_by('id')
    pagination_class = None  # Pas de pagination pour un référentiel
