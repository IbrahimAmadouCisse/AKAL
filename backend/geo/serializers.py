"""
Serializers DRF pour l'app geo.

    RegionSerializer → Référentiel des régions [{code, nom}]
"""

from rest_framework import serializers

from .models import Region


class RegionSerializer(serializers.ModelSerializer):
    """Serializer pour le référentiel des régions du Maroc."""

    class Meta:
        model = Region
        fields = ['id', 'code', 'nom']
