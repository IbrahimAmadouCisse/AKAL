# pyrefly: ignore [missing-import]
import uuid

from django.conf import settings
from django.contrib.gis.db import models as gis_models
from django.db import models
from django.utils.text import slugify


# ──────────────────────────────────────────────
# PARCELLE — Le terrain physique
# ──────────────────────────────────────────────

class Parcelle(models.Model):
    """Parcelle de terrain agricole."""

    class StatutFoncier(models.TextChoices):
        MELKIA = 'melkia', 'Melkia'
        SOULALIYA = 'soulaliya', 'Soulaliya'
        GUICH = 'guich', 'Guich'
        HABOUS = 'habous', 'Habous'
        IMMATRICULE = 'immatricule', 'Immatriculé'

    class AccesEau(models.TextChoices):
        IRRIGUEE = 'irriguee', 'Irriguée'
        BOUR = 'bour', 'Bour'
        MIXTE = 'mixte', 'Mixte'

    class Topographie(models.TextChoices):
        PLAT = 'plat', 'Plat'
        PENTU = 'pentu', 'Pentu'
        VALLONNE = 'vallonne', 'Vallonné'

    class AccesRoutier(models.TextChoices):
        GOUDRON = 'goudron', 'Goudron'
        PISTE = 'piste', 'Piste'
        DIFFICILE = 'difficile', 'Difficile'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    commune = models.ForeignKey(
        'geo.Commune', on_delete=models.CASCADE, related_name='parcelles'
    )
    surface = models.DecimalField(
        max_digits=8, decimal_places=2, help_text='Surface en hectares'
    )
    statut_foncier = models.CharField(max_length=20, choices=StatutFoncier.choices)
    acces_eau = models.CharField(max_length=20, choices=AccesEau.choices)
    topographie = models.CharField(max_length=20, choices=Topographie.choices)
    acces_routier = models.CharField(max_length=20, choices=AccesRoutier.choices)
    latitude = models.FloatField()
    longitude = models.FloatField()
    geom = gis_models.PointField(srid=4326)
    contour = gis_models.PolygonField(
        srid=4326, blank=True, null=True, help_text='Phase 2'
    )
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'parcelle'
        verbose_name = 'Parcelle'
        verbose_name_plural = 'Parcelles'

    def __str__(self):
        return f"Parcelle {self.id} — {self.surface} ha"


# ──────────────────────────────────────────────
# ANNONCE — La mise en vente
# ──────────────────────────────────────────────

class Annonce(models.Model):
    """Annonce de vente d'une parcelle."""

    class StatutAnnonce(models.TextChoices):
        BROUILLON = 'brouillon', 'Brouillon'
        EN_ATTENTE = 'en_attente', 'En attente'
        EN_LIGNE = 'en_ligne', 'En ligne'
        ARCHIVEE = 'archivee', 'Archivée'
        VENDUE = 'vendue', 'Vendue'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    parcelle = models.ForeignKey(
        Parcelle, on_delete=models.CASCADE, related_name='annonces'
    )
    proprietaire = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='annonces'
    )
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    titre = models.CharField(max_length=120)
    description = models.TextField()
    prix = models.DecimalField(
        max_digits=12, decimal_places=2, help_text='Prix en MAD'
    )
    statut_annonce = models.CharField(
        max_length=20, choices=StatutAnnonce.choices, default=StatutAnnonce.BROUILLON
    )
    loc_confidentielle = models.BooleanField(default=False)
    vues = models.PositiveIntegerField(default=0)
    date_publication = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'annonce'
        verbose_name = 'Annonce'
        verbose_name_plural = 'Annonces'

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.titre)
            self.slug = f"{base_slug}-{str(self.id)[:8]}"
        super().save(*args, **kwargs)

    def __str__(self):
        return self.titre


# ──────────────────────────────────────────────
# AGRISCORE — Évaluation de la parcelle
# ──────────────────────────────────────────────

class AgriScore(models.Model):
    """Score agricole calculé pour une parcelle."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    parcelle = models.OneToOneField(
        Parcelle, on_delete=models.CASCADE, related_name='agriscore'
    )
    score_global = models.FloatField(blank=True, null=True)
    sous_scores = models.JSONField(blank=True, null=True)
    indice_confiance = models.FloatField(blank=True, null=True)
    version_algo = models.CharField(max_length=50)
    calculated_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        db_table = 'agriscore'
        verbose_name = 'AgriScore'
        verbose_name_plural = 'AgriScores'

    def __str__(self):
        return f"AgriScore {self.parcelle} — {self.score_global}"


# ──────────────────────────────────────────────
# PHOTO — Images de l'annonce
# ──────────────────────────────────────────────

class Photo(models.Model):
    """Photo associée à une annonce."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    annonce = models.ForeignKey(
        Annonce, on_delete=models.CASCADE, related_name='photos'
    )
    image = models.ImageField(upload_to='photos/')
    ordre = models.IntegerField(default=0)
    is_principale = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'photo'
        verbose_name = 'Photo'
        verbose_name_plural = 'Photos'
        ordering = ['ordre']

    def __str__(self):
        return f"Photo {self.ordre} — {self.annonce}"
