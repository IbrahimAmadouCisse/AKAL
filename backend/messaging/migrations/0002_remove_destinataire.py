"""
Migration T7 : Conversation — retrait du champ destinataire.

Le destinataire est déductible : conversation.annonce.proprietaire.
Contrainte mise à jour : UNIQUE (annonce, initiateur) au lieu de (annonce, initiateur, destinataire).
"""

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('messaging', '0001_initial'),
    ]

    operations = [
        # 1. Supprimer l'ancienne contrainte
        migrations.RemoveConstraint(
            model_name='conversation',
            name='unique_conversation',
        ),

        # 2. Supprimer le champ destinataire
        migrations.RemoveField(
            model_name='conversation',
            name='destinataire',
        ),

        # 3. Ajouter la nouvelle contrainte
        migrations.AddConstraint(
            model_name='conversation',
            constraint=models.UniqueConstraint(
                fields=['annonce', 'initiateur'],
                name='uniq_conversation_annonce_initiateur',
            ),
        ),
    ]
