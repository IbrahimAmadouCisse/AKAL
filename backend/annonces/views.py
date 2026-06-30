"""
Vues de l'app annonces.

CatalogueView : liste paginée des annonces en ligne,
avec filtres à facettes et tri dynamique délégués à AnnonceFilter.
"""

from django.core.paginator import EmptyPage, PageNotAnInteger

from django_filters.views import FilterView

from .filters import AnnonceFilter
from .models import Annonce


class CatalogueView(FilterView):
    """
    Vue catalogue : liste paginée des annonces publiées.

    Hérite de FilterView (django-filter) qui intègre nativement
    le filterset dans le cycle requête/réponse.

    Fonctionnalités :
        - Filtrage à facettes via AnnonceFilter (prix, surface, région, etc.)
        - Recherche textuelle (Q objects sur titre + description)
        - Tri dynamique (prix, date_publication, croissant/décroissant)
        - Pagination (12 éléments/page)
        - Optimisation N+1 (select_related + prefetch_related)

    Le queryset de base est fourni par AnnonceManager :
        Annonce.objects.en_ligne().with_relations()
    """

    model = Annonce
    filterset_class = AnnonceFilter
    template_name = 'annonces/catalogue.html'
    context_object_name = 'annonces'
    paginate_by = 12

    def get_queryset(self):
        """
        Retourne les annonces en ligne avec toutes les relations pré-chargées.

        La logique de filtrage et de tri est entièrement déléguée
        à AnnonceFilter via FilterView.
        """
        return Annonce.objects.en_ligne().with_relations()

    def get_context_data(self, **kwargs):
        """
        Injecte les paramètres de filtres actifs et validés dans le contexte pour le front-end.
        """
        context = super().get_context_data(**kwargs)
        
        filterset = context.get('filter')
        active_filters = {}
        
        if filterset:
            # Déclenche la validation pour nettoyer les données
            # Ignore les erreurs de type (ex: prix_min="abc") gracefully
            filterset.is_valid()
            
            if hasattr(filterset.form, 'cleaned_data'):
                for key, value in filterset.form.cleaned_data.items():
                    # Ne garde que les valeurs valides et non vides
                    if value not in (None, '', [], ()):
                        # django-filter peut retourner des QuerySet pour les ModelChoiceFilter,
                        # ou des listes. On s'assure d'avoir des formats sérialisables ou simples.
                        active_filters[key] = value

        context['active_filters'] = active_filters
        # Le tri est indépendant du filterset (souvent géré à part dans l'UI)
        context['current_sort'] = self.request.GET.get('sort', '-date_publication')
        return context

    def paginate_queryset(self, queryset, page_size):
        """Surcharge pour gérer les erreurs de pagination manuellement."""
        paginator = self.get_paginator(
            queryset, page_size, orphans=self.get_paginate_orphans(),
            allow_empty_first_page=self.get_allow_empty()
        )
        page_kwarg = self.page_kwarg
        page = self.kwargs.get(page_kwarg) or self.request.GET.get(page_kwarg) or 1

        try:
            page_number = int(page)
        except ValueError:
            if page == 'last':
                page_number = paginator.num_pages
            else:
                page_number = 1

        try:
            page = paginator.page(page_number)
        except PageNotAnInteger:
            # Si ce n'est pas un entier, on renvoie la première page
            page = paginator.page(1)
        except EmptyPage:
            # Si la page est vide (hors limites), on renvoie la dernière page
            page = paginator.page(paginator.num_pages)

        return (paginator, page, page.object_list, page.has_other_pages())


from django.views.generic import DetailView
from django.db.models import Q
from decimal import Decimal

class AnnonceDetailView(DetailView):
    """
    Vue détaillée d'une annonce.
    
    Affiche la fiche complète d'une parcelle et calcule un algorithme
    de recommandation pour suggérer jusqu'à 3 annonces similaires.
    """
    model = Annonce
    template_name = 'annonces/detail.html'
    context_object_name = 'annonce'

    def get_queryset(self):
        """
        Surcharge du queryset pour optimiser l'affichage détaillé.
        On utilise with_relations() (vendeur, région, photos) 
        + select_related('parcelle__agriscore') spécifiquement pour cette vue.
        """
        # On ne veut pouvoir accéder qu'aux annonces actives (sauf si on est admin/propriétaire,
        # mais la consigne standard est de protéger l'accès). Restons sur en_ligne().
        return Annonce.objects.en_ligne().with_relations().select_related(
            'parcelle__agriscore'
        )

    def get_context_data(self, **kwargs):
        """
        Injecte l'algorithme de recommandation (parcelles_similaires) dans le contexte.
        """
        context = super().get_context_data(**kwargs)
        annonce = self.object

        # ── Algorithme de recommandation : Parcelles similaires ──
        
        # 1. Fourchette de prix (+/- 20%)
        prix_min = annonce.prix * Decimal('0.8')
        prix_max = annonce.prix * Decimal('1.2')

        # 2. Construction de la requête Q(Même région OU Même type_culture)
        region_id = annonce.parcelle.commune.province.region_id
        q_conditions = Q(parcelle__commune__province__region_id=region_id)

        # Le type_culture est stocké dans le JSONField metadata (liste ou string)
        cultures = annonce.parcelle.metadata.get('culture', [])
        
        if isinstance(cultures, list) and cultures:
            for culture in cultures:
                q_conditions |= Q(parcelle__metadata__culture__icontains=culture)
        elif isinstance(cultures, str) and cultures:
            q_conditions |= Q(parcelle__metadata__culture__icontains=cultures)

        # 3. Requête optimisée pour récupérer jusqu'à 3 annonces
        parcelles_similaires = (
            Annonce.objects.en_ligne()
            .exclude(id=annonce.id)                 # Exclure l'annonce actuelle
            .filter(prix__gte=prix_min, prix__lte=prix_max) # Même gamme de prix
            .filter(q_conditions)                   # Match région OU culture
            .with_relations()                       # Optimisation N+1 !
            .distinct()[:3]                         # Limite à 3 résultats uniques
        )

        context['parcelles_similaires'] = parcelles_similaires
        return context
