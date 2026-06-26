# pyrefly: ignore [missing-import]
from django.contrib import admin

from .models import Favori, Conversation, Message


@admin.register(Favori)
class FavoriAdmin(admin.ModelAdmin):
    list_display = ('user', 'annonce', 'created_at')


@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ('annonce', 'initiateur', 'destinataire', 'created_at', 'updated_at')


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('conversation', 'auteur', 'is_lu', 'created_at')
    list_filter = ('is_lu',)
