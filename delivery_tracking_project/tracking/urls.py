from django.urls import path
from .views import delivery_map_view

urlpatterns = [
    path('', delivery_map_view, name='delivery-map'),
]
