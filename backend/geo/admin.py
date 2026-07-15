# pyrefly: ignore [missing-import]
from django.contrib import admin

from .models import Region, Province, Commune


@admin.register(Region)
class RegionAdmin(admin.ModelAdmin):
    list_display = ('id', 'nom', 'code')
    search_fields = ('nom', 'code')


@admin.register(Province)
class ProvinceAdmin(admin.ModelAdmin):
    list_display = ('id', 'nom', 'code', 'region')
    list_filter = ('region',)
    search_fields = ('nom', 'code')


@admin.register(Commune)
class CommuneAdmin(admin.ModelAdmin):
    list_display = ('id', 'nom', 'province')
    list_filter = ('province__region',)
    search_fields = ('nom',)
