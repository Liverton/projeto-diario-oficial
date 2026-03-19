from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("diario_oficial.urls")),  # Rota para o React consumir
]
