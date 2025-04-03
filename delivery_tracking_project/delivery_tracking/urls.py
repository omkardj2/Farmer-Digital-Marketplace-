from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponseRedirect

def redirect_to_delivery(request):
    return HttpResponseRedirect('/delivery/')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('delivery/', include('tracking.urls')),
    path('', redirect_to_delivery),  # Redirect root to delivery
]
