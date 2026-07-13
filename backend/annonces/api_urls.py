"""
Routes API REST (DRF) de l'app annonces.

    /api/annonces/          → Liste paginée + filtres
    /api/annonces/<slug>/   → Détail complet
"""

from django.urls import path

from .api_views import AnnonceListAPIView, AnnonceDetailAPIView

app_name = 'annonces-api'

urlpatterns = [
    path('', AnnonceListAPIView.as_view(), name='list'),
    path('<slug:slug>/', AnnonceDetailAPIView.as_view(), name='detail'),
]
