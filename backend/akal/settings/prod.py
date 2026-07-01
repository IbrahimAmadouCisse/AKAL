from .base import *

DEBUG = False
ALLOWED_HOSTS = ['akal.ma', 'www.akal.ma', 'akal-api-backend.onrender.com'] # Exemple de domaine pour la mise en prod[cite: 2]

# Sécurité renforcée pour la production
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True