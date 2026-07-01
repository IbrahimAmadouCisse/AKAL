from rest_framework import generics

from geo.models import Region

from .serializers import RegionSerializer


class RegionListAPIView(generics.ListAPIView):
    serializer_class = RegionSerializer
    queryset = Region.objects.all().order_by('nom')
    pagination_class = None
