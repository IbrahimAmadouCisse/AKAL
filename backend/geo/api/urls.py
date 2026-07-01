from django.urls import path

from .views import RegionListAPIView

app_name = 'geo_api'

urlpatterns = [
    path('regions/', RegionListAPIView.as_view(), name='regions'),
]
