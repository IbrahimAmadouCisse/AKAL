# Base image optimisée (slim) pour Python
FROM python:3.14-slim

# Empêche Python d'écrire des fichiers .pyc (gain de place)
ENV PYTHONDONTWRITEBYTECODE=1
# Force Python à écrire directement sur stdout/stderr (pratique pour les logs Docker)
ENV PYTHONUNBUFFERED=1

# Définition du répertoire de travail
WORKDIR /app

# Installation des dépendances système requises pour PostGIS et GeoDjango
# binutils, libproj-dev, gdal-bin, python3-gdal
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        binutils \
        libproj-dev \
        gdal-bin \
        python3-gdal \
        gcc \
        libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copie des fichiers de dépendances en premier pour profiter du cache Docker
COPY requirements.txt /app/
RUN pip install --upgrade pip \
    && pip install -r requirements.txt

# Copie du reste du code source
COPY . /app/

# Collecte des fichiers statiques pour WhiteNoise
# RUN python manage.py collectstatic --noinput (Souvent géré par la plateforme IaC via la start command, 
# mais peut être fait ici si les variables d'environnement nécessaires sont dispo au build)

# Sécurité : Création d'un utilisateur non-root pour exécuter l'application
RUN useradd -m akaluser && chown -R akaluser:akaluser /app
USER akaluser

# Exposition du port (Gunicorn par défaut 8000)
EXPOSE 8000

# Commande par défaut (peut être surchargée par l'IaC comme render.yaml)
CMD sh -c "python manage.py collectstatic --noinput && python manage.py migrate && gunicorn akal.wsgi:application --bind 0.0.0.0:8000"
