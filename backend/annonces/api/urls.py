from django.urls import path

from .views import AnnonceDetailAPIView, AnnonceListAPIView

app_name = 'annonces_api'

urlpatterns = [
    path('', AnnonceListAPIView.as_view(), name='list'),
    path('<slug:slug>/', AnnonceDetailAPIView.as_view(), name='detail'),
]
