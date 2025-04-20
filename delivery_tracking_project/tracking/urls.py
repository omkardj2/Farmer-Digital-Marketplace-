from django.urls import path
from .views import (
    delivery_dashboard_view,
    admin_panel_view,
    delivery_partner_dashboard_view,
    delivery_map_view,
    delivery_home,
)

urlpatterns = [
    path('', delivery_home, name='delivery-home'), 
    path('dashboard/', delivery_dashboard_view, name='delivery-dashboard'),
    path('admin-panel/', admin_panel_view, name='admin-panel'),
    path('partner-dashboard/', delivery_partner_dashboard_view, name='partner-dashboard'),
    path('map/', delivery_map_view, name='delivery-map'),
]
