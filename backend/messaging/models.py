# pyrefly: ignore [missing-import]
import uuid

from django.conf import settings
from django.db import models


# ──────────────────────────────────────────────
# FAVORI
# ──────────────────────────────────────────────

class Favori(models.Model):
    """Annonce mise en favori par un utilisateur."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='favoris'
    )
    annonce = models.ForeignKey(
        'annonces.Annonce', on_delete=models.CASCADE, related_name='favoris'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'favori'
        verbose_name = 'Favori'
        verbose_name_plural = 'Favoris'
        constraints = [
            models.UniqueConstraint(
                fields=['user', 'annonce'], name='unique_favori_user_annonce'
            )
        ]

    def __str__(self):
        return f"{self.user} ❤ {self.annonce}"


# ──────────────────────────────────────────────
# CONVERSATION
# ──────────────────────────────────────────────

class Conversation(models.Model):
    """Fil de discussion entre deux utilisateurs à propos d'une annonce."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    annonce = models.ForeignKey(
        'annonces.Annonce', on_delete=models.CASCADE, related_name='conversations'
    )
    initiateur = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name='conversations_initiees'
    )
    destinataire = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name='conversations_recues'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'conversation'
        verbose_name = 'Conversation'
        verbose_name_plural = 'Conversations'
        constraints = [
            models.UniqueConstraint(
                fields=['annonce', 'initiateur', 'destinataire'],
                name='unique_conversation'
            )
        ]

    def __str__(self):
        return f"Conversation {self.initiateur} → {self.destinataire} ({self.annonce})"


# ──────────────────────────────────────────────
# MESSAGE
# ──────────────────────────────────────────────

class Message(models.Model):
    """Message envoyé dans une conversation."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    conversation = models.ForeignKey(
        Conversation, on_delete=models.CASCADE, related_name='messages'
    )
    auteur = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name='messages_envoyes'
    )
    contenu = models.TextField()
    is_lu = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'message'
        verbose_name = 'Message'
        verbose_name_plural = 'Messages'
        ordering = ['created_at']

    def __str__(self):
        return f"Message de {self.auteur} — {self.contenu[:50]}"
