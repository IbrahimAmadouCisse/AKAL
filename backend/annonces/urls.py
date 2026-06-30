from django.urls import path
from .views import CatalogueView, AnnonceDetailView

app_name = 'annonces'

urlpatterns = [
    path('', CatalogueView.as_view(), name='catalogue'),
    path('<slug:slug>/', AnnonceDetailView.as_view(), name='detail'),
]
