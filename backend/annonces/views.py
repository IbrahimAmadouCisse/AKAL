from decimal import Decimal

from django.core.paginator import EmptyPage, PageNotAnInteger
from django.db.models import Q
from django.views.generic import DetailView

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
        return Annonce.objects.en_ligne().with_relations()

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)

        filterset = context.get('filter')
        active_filters = {}

        if filterset:
            filterset.is_valid()
            if hasattr(filterset.form, 'cleaned_data'):
                for key, value in filterset.form.cleaned_data.items():
                    if value not in (None, '', [], ()):
                        active_filters[key] = value

        context['active_filters'] = active_filters
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
            page = paginator.page(1)
        except EmptyPage:
            page = paginator.page(paginator.num_pages)

        return (paginator, page, page.object_list, page.has_other_pages())


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
        return Annonce.objects.en_ligne().with_relations().select_related(
            'parcelle__agriscore'
        )

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        annonce = self.object

        prix_min = annonce.prix * Decimal('0.8')
        prix_max = annonce.prix * Decimal('1.2')

        region_id = annonce.parcelle.commune.province.region_id
        q_conditions = Q(parcelle__commune__province__region_id=region_id)

        cultures = annonce.parcelle.metadata.get('culture', [])
        if isinstance(cultures, str):
            cultures = [cultures]
        for culture in cultures:
            q_conditions |= Q(parcelle__metadata__culture__contains=[culture])

        parcelles_similaires = (
            Annonce.objects.en_ligne()
            .exclude(id=annonce.id)
            .filter(prix__gte=prix_min, prix__lte=prix_max)
            .filter(q_conditions)
            .with_relations()
            .distinct()[:3]
        )

        context['parcelles_similaires'] = parcelles_similaires
        return context
