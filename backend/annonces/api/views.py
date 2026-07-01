from rest_framework import generics
from rest_framework.pagination import PageNumberPagination

from ..filters import AnnonceFilter
from ..models import Annonce
from .serializers import AnnonceDetailSerializer, AnnonceListSerializer


class AnnoncePagination(PageNumberPagination):
    page_size = 12
    page_size_query_param = 'page_size'
    max_page_size = 100


class AnnonceListAPIView(generics.ListAPIView):
    serializer_class = AnnonceListSerializer
    filterset_class = AnnonceFilter
    pagination_class = AnnoncePagination

    def get_queryset(self):
        return Annonce.objects.en_ligne().with_relations()


class AnnonceDetailAPIView(generics.RetrieveAPIView):
    serializer_class = AnnonceDetailSerializer
    lookup_field = 'slug'

    def get_queryset(self):
        return (
            Annonce.objects.en_ligne()
            .with_relations()
            .select_related('parcelle__agriscore')
        )
