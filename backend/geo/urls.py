"""
Routes API REST (DRF) de l'app geo.

    /api/geo/regions/ → Référentiel des régions
"""

from django.urls import path

from .api_views import RegionListAPIView

app_name = 'geo-api'

urlpatterns = [
    path('regions/', RegionListAPIView.as_view(), name='regions'),
]
