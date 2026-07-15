# pyrefly: ignore [missing-import]
from django.db import models


class Region(models.Model):
    """Région du Maroc."""

    id = models.IntegerField(primary_key=True)
    nom = models.CharField(max_length=255)
    code = models.CharField(max_length=50)

    class Meta:
        db_table = 'region'
        verbose_name = 'Région'
        verbose_name_plural = 'Régions'

    def __str__(self):
        return self.nom


class Province(models.Model):
    """Province / Préfecture."""

    id = models.IntegerField(primary_key=True)
    region = models.ForeignKey(Region, on_delete=models.CASCADE, related_name='provinces')
    nom = models.CharField(max_length=255)
    code = models.CharField(max_length=50)

    class Meta:
        db_table = 'province'
        verbose_name = 'Province'
        verbose_name_plural = 'Provinces'

    def __str__(self):
        return self.nom


class Commune(models.Model):
    """Commune."""

    id = models.IntegerField(primary_key=True)
    province = models.ForeignKey(Province, on_delete=models.CASCADE, related_name='communes')
    nom = models.CharField(max_length=255)

    class Meta:
        db_table = 'commune'
        verbose_name = 'Commune'
        verbose_name_plural = 'Communes'

    def __str__(self):
        return self.nom
