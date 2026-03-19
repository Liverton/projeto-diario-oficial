from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EdicaoViewSet, MateriaViewSet

router = DefaultRouter()
router.register(r"edicoes", EdicaoViewSet)
router.register(r"materias", MateriaViewSet)

urlpatterns = [
    path("", include(router.urls)),
]
