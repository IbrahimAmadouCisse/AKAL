"""
Migration T3+T8 : Alignement contrat v1.1

T3 — Renommage des champs :
    - Annonce.prix → prix_mad
    - Annonce.statut_annonce → statut
    - Parcelle.surface → surface_ha

T8 — AgriScore historisation :
    - OneToOneField → ForeignKey (permet plusieurs scores par parcelle)
    - version_algo → version_ponderation
"""

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('annonces', '0002_schema_corrections_contrat_v1_1'),
    ]

    operations = [
        # ── T3 : Renommages ──────────────────────────
        migrations.RenameField(
            model_name='annonce',
            old_name='prix',
            new_name='prix_mad',
        ),
        migrations.RenameField(
            model_name='annonce',
            old_name='statut_annonce',
            new_name='statut',
        ),
        migrations.RenameField(
            model_name='parcelle',
            old_name='surface',
            new_name='surface_ha',
        ),

        # ── T8 : AgriScore historisation ─────────────
        migrations.AlterField(
            model_name='agriscore',
            name='parcelle',
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name='scores',
                to='annonces.parcelle',
            ),
        ),
        migrations.RenameField(
            model_name='agriscore',
            old_name='version_algo',
            new_name='version_ponderation',
        ),
    ]
