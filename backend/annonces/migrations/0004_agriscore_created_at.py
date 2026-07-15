"""
Migration : AgriScore.created_at (contrat §3.5).

Le "score courant" d'une parcelle doit être le AgriScore le plus récent —
mais rien ne garantissait un ordre chronologique fiable : `calculated_at`
est nullable (renseigné par le pipeline de scoring, pas automatique), et le
code de sélection retombait sur `pk` (UUID, sans ordre chronologique) en son
absence. `created_at` (auto_now_add) donne un ordre toujours fiable, même si
`calculated_at` n'est jamais renseigné.

Défaut ponctuel (`django.utils.timezone.now`) appliqué aux lignes
existantes au moment de la migration ; auto_now_add prend le relais pour
toutes les créations suivantes.
"""

import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('annonces', '0003_rename_fields_contrat_v1_1'),
    ]

    operations = [
        migrations.AddField(
            model_name='agriscore',
            name='created_at',
            field=models.DateTimeField(auto_now_add=True, default=django.utils.timezone.now),
            preserve_default=False,
        ),
    ]
