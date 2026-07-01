from .base import *

DEBUG = False
ALLOWED_HOSTS = ['akal.ma', 'www.akal.ma', '.onrender.com']

CORS_ALLOWED_ORIGINS = env.list('CORS_ALLOWED_ORIGINS', default=['https://akal.ma'])

# Sécurité renforcée pour la production
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True