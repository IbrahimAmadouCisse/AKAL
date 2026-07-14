from .base import *

DEBUG = False
ALLOWED_HOSTS = ['akal.ma', 'www.akal.ma','.onrender.com'] # Exemple de domaine pour la mise en prod[cite: 2]

# CORS — sans ceci, prod hérite de CORS_ALLOWED_ORIGINS = ['http://localhost:3000']
# (base.py) et bloque silencieusement tout appel du frontend déployé.
# Surchargeable via variable d'env (ex. preview Vercel) sans toucher au code.
CORS_ALLOWED_ORIGINS = env.list('CORS_ALLOWED_ORIGINS', default=['https://akal.ma', 'https://www.akal.ma'])

# Sécurité renforcée pour la production
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True