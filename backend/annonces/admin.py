# pyrefly: ignore [missing-import]
from django.contrib import admin

from .models import Parcelle, Annonce, AgriScore, Photo, DonneesGeo, StatistiqueAnnonce


@admin.register(Parcelle)
class ParcelleAdmin(admin.ModelAdmin):
    list_display = ('id', 'commune', 'surface', 'statut_foncier', 'acces_eau', 'created_at')
    list_filter = ('statut_foncier', 'acces_eau', 'topographie', 'acces_routier')
    search_fields = ('commune__nom',)


@admin.register(Annonce)
class AnnonceAdmin(admin.ModelAdmin):
    list_display = ('titre', 'proprietaire', 'prix', 'statut_annonce', 'created_at')
    list_filter = ('statut_annonce',)
    search_fields = ('titre', 'slug')
    prepopulated_fields = {'slug': ('titre',)}


@admin.register(AgriScore)
class AgriScoreAdmin(admin.ModelAdmin):
    list_display = ('parcelle', 'score_global', 'indice_confiance', 'version_algo', 'calculated_at')
    list_filter = ('version_algo',)


@admin.register(Photo)
class PhotoAdmin(admin.ModelAdmin):
    list_display = ('annonce', 'ordre', 'created_at')


@admin.register(DonneesGeo)
class DonneesGeoAdmin(admin.ModelAdmin):
    list_display = ('parcelle',)
    search_fields = ('parcelle__id',)


@admin.register(StatistiqueAnnonce)
class StatistiqueAnnonceAdmin(admin.ModelAdmin):
    list_display = ('annonce', 'date', 'vues')
    list_filter = ('date',)
    search_fields = ('annonce__titre',)
