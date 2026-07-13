"""
Serializers DRF pour l'app annonces.

Conformes au contrat d'API frontend/backend (§4.4) :
    - AnnonceListSerializer  → liste allégée (catalogue)
    - AnnonceDetailSerializer → détail complet (fiche annonce)
"""

from rest_framework import serializers

from .models import Annonce, AgriScore, Parcelle, Photo


# ──────────────────────────────────────────────
# Sous-serializers (nested objects)
# ──────────────────────────────────────────────

class PhotoSerializer(serializers.ModelSerializer):
    """Photo avec URL absolue."""

    image = serializers.SerializerMethodField()

    class Meta:
        model = Photo
        fields = ['id', 'image', 'ordre']

    def get_image(self, obj):
        """Retourne l'URL absolue de l'image."""
        request = self.context.get('request')
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        elif obj.image:
            return obj.image.url
        return None


class AgriScoreListSerializer(serializers.ModelSerializer):
    """AgriScore allégé pour la vue liste — score_global uniquement."""

    class Meta:
        model = AgriScore
        fields = ['score_global']


class AgriScoreDetailSerializer(serializers.ModelSerializer):
    """AgriScore complet pour la vue détail."""

    class Meta:
        model = AgriScore
        fields = ['score_global', 'sous_scores', 'indice_confiance', 'version_algo', 'calculated_at']


class ParcelleDetailSerializer(serializers.ModelSerializer):
    """Sous-objet parcelle pour la vue détail."""

    region = serializers.CharField(source='commune.province.region.nom', read_only=True)
    province = serializers.CharField(source='commune.province.nom', read_only=True)
    commune = serializers.CharField(source='commune.nom', read_only=True)
    type_culture = serializers.SerializerMethodField()

    class Meta:
        model = Parcelle
        fields = [
            'id', 'surface', 'statut_foncier', 'acces_eau',
            'topographie', 'acces_routier', 'latitude', 'longitude',
            'metadata', 'region', 'province', 'commune', 'type_culture',
        ]

    def get_type_culture(self, obj):
        """Extrait la liste des cultures depuis metadata."""
        return obj.metadata.get('culture', [])


class ProprietaireSerializer(serializers.Serializer):
    """Informations du propriétaire pour la vue détail."""

    nom = serializers.CharField()
    prenom = serializers.CharField()
    telephone = serializers.CharField(allow_null=True)


# ──────────────────────────────────────────────
# Serializers principaux
# ──────────────────────────────────────────────

class AnnonceListSerializer(serializers.ModelSerializer):
    """
    Serializer liste allégée pour le catalogue (§4.4).

    Champs exposés :
        - Identité : id, slug, titre
        - Prix/Surface : prix_mad, surface_ha
        - Géo : region (nom seul)
        - Filtres : statut_foncier, acces_eau, type_culture
        - Média : photo_principale (URL de la photo ordre=0 ou null)
        - Score : score_courant (score_global seul ou null)
        - Date : date_publication

    Jamais DonneesGeo dans la liste.
    """

    prix_mad = serializers.DecimalField(source='prix', max_digits=12, decimal_places=2)
    surface_ha = serializers.DecimalField(source='parcelle.surface', max_digits=8, decimal_places=2)
    region = serializers.CharField(source='parcelle.commune.province.region.nom', read_only=True)
    statut_foncier = serializers.CharField(source='parcelle.statut_foncier', read_only=True)
    acces_eau = serializers.CharField(source='parcelle.acces_eau', read_only=True)
    type_culture = serializers.SerializerMethodField()
    photo_principale = serializers.SerializerMethodField()
    score_courant = serializers.SerializerMethodField()

    class Meta:
        model = Annonce
        fields = [
            'id', 'slug', 'titre', 'prix_mad', 'surface_ha',
            'region', 'statut_foncier', 'acces_eau', 'type_culture',
            'photo_principale', 'score_courant', 'date_publication',
        ]

    def get_type_culture(self, obj):
        """Extrait la liste des cultures depuis metadata de la parcelle."""
        return obj.parcelle.metadata.get('culture', [])

    def get_photo_principale(self, obj):
        """
        Retourne l'URL absolue de la photo avec ordre=0, ou null.

        Les photos sont déjà prefetch_related, on filtre en Python
        pour éviter une requête SQL supplémentaire.
        """
        request = self.context.get('request')
        photos = obj.photos.all()  # Utilise le prefetch_related
        for photo in photos:
            if photo.ordre == 0:
                if request and photo.image:
                    return request.build_absolute_uri(photo.image.url)
                elif photo.image:
                    return photo.image.url
        return None

    def get_score_courant(self, obj):
        """
        Retourne {score_global} du dernier AgriScore, ou null.

        Utilise le select_related('parcelle__agriscore') pour éviter N+1.
        """
        try:
            agriscore = obj.parcelle.agriscore
            return {'score_global': agriscore.score_global}
        except AgriScore.DoesNotExist:
            return None


class AnnonceDetailSerializer(serializers.ModelSerializer):
    """
    Serializer détail complet pour la fiche annonce.

    Inclut tout ce qui est dans la liste plus :
        - description complète
        - sous-objet parcelle (données physiques + géo)
        - photos triées par ordre
        - score_courant complet (score_global + sous_scores + indice_confiance)
        - informations du propriétaire
    """

    prix_mad = serializers.DecimalField(source='prix', max_digits=12, decimal_places=2)
    surface_ha = serializers.DecimalField(source='parcelle.surface', max_digits=8, decimal_places=2)
    region = serializers.CharField(source='parcelle.commune.province.region.nom', read_only=True)
    parcelle = ParcelleDetailSerializer(read_only=True)
    photos = PhotoSerializer(many=True, read_only=True)
    score_courant = serializers.SerializerMethodField()
    proprietaire = ProprietaireSerializer(read_only=True)
    photo_principale = serializers.SerializerMethodField()

    class Meta:
        model = Annonce
        fields = [
            'id', 'slug', 'titre', 'description', 'prix_mad', 'surface_ha',
            'region', 'statut_annonce', 'loc_confidentielle',
            'date_publication', 'created_at', 'updated_at',
            'parcelle', 'photos', 'score_courant', 'proprietaire',
            'photo_principale',
        ]

    def get_score_courant(self, obj):
        """
        Retourne l'AgriScore complet ou null.

        Inclut score_global, sous_scores, indice_confiance, version_algo, calculated_at.
        """
        try:
            agriscore = obj.parcelle.agriscore
            return AgriScoreDetailSerializer(agriscore).data
        except AgriScore.DoesNotExist:
            return None

    def get_photo_principale(self, obj):
        """Retourne l'URL absolue de la photo avec ordre=0, ou null."""
        request = self.context.get('request')
        photos = obj.photos.all()
        for photo in photos:
            if photo.ordre == 0:
                if request and photo.image:
                    return request.build_absolute_uri(photo.image.url)
                elif photo.image:
                    return photo.image.url
        return None
