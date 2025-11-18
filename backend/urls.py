from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie
from django.middleware.csrf import get_token

@ensure_csrf_cookie
def csrf_view(request):
    """
    Ensures a CSRF cookie is set and returns the current token in JSON.
    Frontend can call GET /csrf/ to receive the csrftoken cookie before making POST/PATCH/DELETE.
    """
    token = get_token(request)
    return JsonResponse({"csrfToken": token})

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/csrf/", csrf_view),   
    path("api/", include("lms.urls")), 
]
