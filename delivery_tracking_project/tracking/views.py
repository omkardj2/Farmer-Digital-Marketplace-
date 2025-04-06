from django.shortcuts import render
from .models import Delivery
import json

def delivery_map_view(request):
    deliveries = Delivery.objects.all()
    
    # Safely serialize delivery data
    delivery_data = json.dumps([
        {
            "id": delivery.id,
            "lat": delivery.latitude,
            "lng": delivery.longitude,
            "status": delivery.status
        }
        for delivery in deliveries
    ])

    context = {
        "delivery_data": delivery_data  # Already JSON serialized
    }

    return render(request, 'delivery/map.html', context)
