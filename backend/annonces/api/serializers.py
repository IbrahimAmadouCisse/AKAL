from decimal import Decimal

from django.db.models import Q
from rest_framework import serializers

from geo.models import Province, Commune
from ..models import Annonce, AgriScore, Parcelle, Photo


class ProvinceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Province
        fields = ['id', 'nom', 'code']


class CommuneSerializer(serializers.ModelSerializer):
    province = ProvinceSerializer()

    class Meta:
        model = Commune
        fields = ['id', 'nom', 'province']


class AgriScoreSerializer(serializers.ModelSerializer):
    class Meta:
        model = AgriScore
        fields = ['score_global', 'sous_scores', 'indice_confiance', 'version_algo', 'calculated_at']


class PhotoSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = Photo
        fields = ['id', 'image', 'ordre', 'is_principale']

    def get_image(self, obj):
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(obj.image.url)
        return obj.image.url


class ParcelleListSerializer(serializers.ModelSerializer):
    commune_nom = serializers.CharField(source='commune.nom', read_only=True)
    province_nom = serializers.CharField(source='commune.province.nom', read_only=True)
    region_id = serializers.IntegerField(source='commune.province.region_id', read_only=True)
    region_nom = serializers.CharField(source='commune.province.region.nom', read_only=True)

    class Meta:
        model = Parcelle
        fields = [
            'id', 'surface', 'statut_foncier', 'acces_eau', 'topographie',
            'acces_routier', 'latitude', 'longitude',
            'commune_nom', 'province_nom', 'region_id', 'region_nom',
        ]


class ParcelleDetailSerializer(serializers.ModelSerializer):
    commune = CommuneSerializer()
    agriscore = AgriScoreSerializer(read_only=True)

    class Meta:
        model = Parcelle
        fields = [
            'id', 'surface', 'statut_foncier', 'acces_eau', 'topographie',
            'acces_routier', 'latitude', 'longitude', 'metadata',
            'commune', 'agriscore',
        ]


class ProprietaireSerializer(serializers.Serializer):
    id = serializers.UUIDField()
    nom = serializers.CharField()
    prenom = serializers.CharField()
    telephone = serializers.CharField(allow_null=True)
    avatar = serializers.SerializerMethodField()

    def get_avatar(self, obj):
        if not obj.avatar:
            return None
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(obj.avatar.url)
        return obj.avatar.url


class AnnonceListSerializer(serializers.ModelSerializer):
    parcelle = ParcelleListSerializer()
    photo_principale = serializers.SerializerMethodField()

    class Meta:
        model = Annonce
        fields = [
            'id', 'slug', 'titre', 'prix', 'date_publication',
            'vues', 'loc_confidentielle', 'parcelle', 'photo_principale',
        ]

    def get_photo_principale(self, obj):
        photo = next((p for p in obj.photos.all() if p.is_principale), None)
        if photo is None:
            photo = obj.photos.first()
        if photo is None:
            return None
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(photo.image.url)
        return photo.image.url


class AnnonceDetailSerializer(serializers.ModelSerializer):
    parcelle = ParcelleDetailSerializer()
    proprietaire = ProprietaireSerializer()
    photos = PhotoSerializer(many=True)
    similaires = serializers.SerializerMethodField()

    class Meta:
        model = Annonce
        fields = [
            'id', 'slug', 'titre', 'description', 'prix',
            'date_publication', 'vues', 'loc_confidentielle',
            'parcelle', 'proprietaire', 'photos', 'similaires',
        ]

    def get_similaires(self, obj):
        prix_min = obj.prix * Decimal('0.8')
        prix_max = obj.prix * Decimal('1.2')
        region_id = obj.parcelle.commune.province.region_id
        q = Q(parcelle__commune__province__region_id=region_id)

        cultures = obj.parcelle.metadata.get('culture', [])
        if isinstance(cultures, str):
            cultures = [cultures]
        for culture in cultures:
            q |= Q(parcelle__metadata__culture__contains=[culture])

        similaires = (
            Annonce.objects.en_ligne()
            .exclude(id=obj.id)
            .filter(prix__gte=prix_min, prix__lte=prix_max)
            .filter(q)
            .with_relations()
            .distinct()[:3]
        )
        return AnnonceListSerializer(similaires, many=True, context=self.context).data
