from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponseRedirect

# Redirect root to delivery
def redirect_to_delivery(request):
    return HttpResponseRedirect('/delivery/')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('delivery/', include('tracking.urls')),  # Include the app URLs
    path('', redirect_to_delivery),  # Root path redirects to delivery home
]
