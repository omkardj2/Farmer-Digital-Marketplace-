# tracking/utils.py
import math
from .models import Delivery

def haversine_distance(lat1, lon1, lat2, lon2):
    R = 6371  # Radius of Earth in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)

    a = math.sin(dlat / 2) ** 2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    return R * c  # Distance in km

def check_nearby_orders(latitude, longitude, radius_km=5):
    deliveries = Delivery.objects.filter(status="Pending")
    nearby_orders = []

    for delivery in deliveries:
        distance = haversine_distance(latitude, longitude, delivery.latitude, delivery.longitude)
        if distance <= radius_km and not delivery.assigned:
            nearby_orders.append(delivery)

    return nearby_orders
