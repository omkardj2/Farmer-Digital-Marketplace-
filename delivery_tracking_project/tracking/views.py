from django.shortcuts import render
from .models import Delivery
import json

# View for Delivery Map
def delivery_map_view(request):
    deliveries = Delivery.objects.all()

    # Serialize the delivery data to be used in JavaScript
    delivery_data = [
        {
            "id": delivery.id,
            "order_id": delivery.order_id,
            "lat": delivery.latitude,
            "lng": delivery.longitude,
            "status": delivery.status,
            "customer_name": delivery.customer_name,
            "address": delivery.delivery_address
        }
        for delivery in deliveries
    ]

    # Pass the data to the template
    return render(request, 'delivery/delivery-trackMap-page.html', {
        'delivery_data': json.dumps(delivery_data)  # Pass the data as JSON string
    })

# View for Delivery Home (Landing Page)
def delivery_home(request):
    deliveries = Delivery.objects.all()
    return render(request, 'delivery/delivery-dashboard.html', {
        'deliveries': deliveries
    })

# View for Delivery Dashboard
def delivery_dashboard_view(request):
    deliveries = Delivery.objects.all()
    return render(request, 'delivery/delivery-dashboard.html', {
        'deliveries': deliveries
    })

# View for Admin Panel
def admin_panel_view(request):
    return render(request, 'delivery/admin-panel.html')

# View for Delivery Partner Dashboard
def delivery_partner_dashboard_view(request):
    return render(request, 'delivery/delivery-patner-dashboard.html')
