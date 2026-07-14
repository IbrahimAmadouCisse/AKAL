"""
Serializers DRF pour l'app annonces.

Conformes au contrat d'API frontend/backend (§4.4, contrat v1.2) :
    - AnnonceListSerializer  → liste allégée (catalogue)
    - AnnonceDetailSerializer → détail complet (fiche annonce)

Sous-serializers :
    - RegionNestedSerializer     → {code, nom}
    - LocalisationListSerializer → {latitude, longitude}
    - LocalisationDetailSerializer → {latitude, longitude, adresse_approximative}
    - ParcelleListSerializer     → sous-objet parcelle (liste)
    - ParcelleDetailSerializer   → sous-objet parcelle (détail)
    - ProprietaireSerializer     → {id} (UUID uniquement, RGPD loi 09-08)
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
        fields = ['score_global', 'sous_scores', 'indice_confiance', 'version_ponderation', 'calculated_at']


class RegionNestedSerializer(serializers.Serializer):
    """Région sous forme {code, nom} — conforme au contrat §4.4."""

    code = serializers.CharField(read_only=True)
    nom = serializers.CharField(read_only=True)


class LocalisationListSerializer(serializers.Serializer):
    """Localisation allégée pour la vue liste — latitude/longitude uniquement."""

    latitude = serializers.FloatField(read_only=True)
    longitude = serializers.FloatField(read_only=True)


class LocalisationDetailSerializer(serializers.Serializer):
    """Localisation complète pour la vue détail — avec adresse_approximative."""

    latitude = serializers.FloatField(read_only=True)
    longitude = serializers.FloatField(read_only=True)
    adresse_approximative = serializers.CharField(read_only=True, allow_null=True)


class ParcelleListSerializer(serializers.ModelSerializer):
    """
    Sous-objet parcelle pour la vue liste (§4.4).

    Champs : id, surface_ha, statut_foncier, acces_eau, region, localisation.
    """

    region = serializers.SerializerMethodField()
    localisation = serializers.SerializerMethodField()

    class Meta:
        model = Parcelle
        fields = ['id', 'surface_ha', 'statut_foncier', 'acces_eau', 'region', 'localisation']

    def get_region(self, obj):
        """Retourne la région sous forme {code, nom}."""
        try:
            region = obj.commune.province.region
            return RegionNestedSerializer(region).data
        except AttributeError:
            return None

    def get_localisation(self, obj):
        """Retourne la localisation allégée (latitude, longitude)."""
        return LocalisationListSerializer({
            'latitude': obj.latitude,
            'longitude': obj.longitude,
        }).data


class ParcelleDetailSerializer(serializers.ModelSerializer):
    """Sous-objet parcelle pour la vue détail."""

    region = serializers.SerializerMethodField()
    province = serializers.CharField(source='commune.province.nom', read_only=True)
    commune = serializers.CharField(source='commune.nom', read_only=True)
    localisation = serializers.SerializerMethodField()

    class Meta:
        model = Parcelle
        fields = [
            'id', 'surface_ha', 'statut_foncier', 'acces_eau',
            'topographie', 'acces_routier',
            'metadata', 'region', 'province', 'commune', 'localisation',
        ]

    def get_region(self, obj):
        """Retourne la région sous forme {code, nom}."""
        try:
            region = obj.commune.province.region
            return RegionNestedSerializer(region).data
        except AttributeError:
            return None

    def get_localisation(self, obj):
        """Retourne la localisation complète avec adresse_approximative."""
        adresse = f"{obj.commune.nom}, Maroc" if hasattr(obj, 'commune') and obj.commune else None
        return LocalisationDetailSerializer({
            'latitude': obj.latitude,
            'longitude': obj.longitude,
            'adresse_approximative': adresse,
        }).data


class ProprietaireSerializer(serializers.Serializer):
    """
    Informations du propriétaire pour la vue détail.

    RGPD (loi 09-08) : expose UNIQUEMENT l'UUID, aucune donnée personnelle.
    """

    id = serializers.UUIDField(read_only=True)


# ──────────────────────────────────────────────
# Serializers principaux
# ──────────────────────────────────────────────

class AnnonceListSerializer(serializers.ModelSerializer):
    """
    Serializer liste allégée pour le catalogue (§4.4).

    Champs exposés (racine) :
        - Identité : id, slug, titre
        - Prix : prix_mad
        - Statut : statut
        - Média : photo_principale (URL de la photo ordre=0 ou null)
        - Score : score_courant (score_global seul ou null)
        - Date : created_at

    Sous-objet parcelle :
        - id, surface_ha, statut_foncier, acces_eau, region, localisation

    Jamais DonneesGeo dans la liste.
    """

    parcelle = ParcelleListSerializer(read_only=True)
    photo_principale = serializers.SerializerMethodField()
    score_courant = serializers.SerializerMethodField()

    class Meta:
        model = Annonce
        fields = [
            'id', 'slug', 'titre', 'prix_mad', 'statut',
            'score_courant', 'photo_principale', 'created_at',
            'parcelle',
        ]

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

        Utilise le prefetch_related('parcelle__scores') pour éviter N+1.
        Sélectionne le score le plus récent (historisation T8).
        """
        scores = obj.parcelle.scores.all()
        if scores:
            # Les scores sont déjà prefetchés, on trie en Python
            latest = max(scores, key=lambda s: s.calculated_at if s.calculated_at else s.pk)
            return {'score_global': latest.score_global}
        return None


class AnnonceDetailSerializer(serializers.ModelSerializer):
    """
    Serializer détail complet pour la fiche annonce.

    Inclut tout ce qui est dans la liste plus :
        - description complète
        - sous-objet parcelle (données physiques + géo + localisation complète)
        - photos triées par ordre
        - score_courant complet (score_global + sous_scores + indice_confiance)
        - informations du propriétaire (UUID uniquement, RGPD)
    """

    parcelle = ParcelleDetailSerializer(read_only=True)
    photos = PhotoSerializer(many=True, read_only=True)
    score_courant = serializers.SerializerMethodField()
    proprietaire = ProprietaireSerializer(read_only=True)
    photo_principale = serializers.SerializerMethodField()

    class Meta:
        model = Annonce
        fields = [
            'id', 'slug', 'titre', 'description', 'prix_mad',
            'statut', 'loc_confidentielle',
            'date_publication', 'created_at', 'updated_at',
            'parcelle', 'photos', 'score_courant', 'proprietaire',
            'photo_principale',
        ]

    def get_score_courant(self, obj):
        """
        Retourne l'AgriScore complet ou null.

        Sélectionne le score le plus récent (historisation T8).
        Inclut score_global, sous_scores, indice_confiance, version_ponderation, calculated_at.
        """
        scores = obj.parcelle.scores.all()
        if scores:
            latest = max(scores, key=lambda s: s.calculated_at if s.calculated_at else s.pk)
            return AgriScoreDetailSerializer(latest).data
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
