# tracking/models.py

from django.db import models

class DeliveryPerson(models.Model):
    name = models.CharField(max_length=100)
    contact_number = models.CharField(max_length=15)

class Delivery(models.Model):
    latitude = models.FloatField()
    longitude = models.FloatField()
    status = models.CharField(max_length=20)
    delivery_person = models.ForeignKey(
        'tracking.DeliveryPerson',  # Ensure correct app label
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )
