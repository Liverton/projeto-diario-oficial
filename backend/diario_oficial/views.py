from rest_framework import viewsets, filters
from .models import Edicao, Materia
from .serializers import EdicaoSerializer, MateriaSerializer


class EdicaoViewSet(viewsets.ModelViewSet):
    # Ordenamos pela data mais recente para o Diário Oficial
    queryset = Edicao.objects.all().order_by("-data_publicacao")
    serializer_class = EdicaoSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ["numero", "materias__titulo", "materias__conteudo"]


class MateriaViewSet(viewsets.ModelViewSet):
    queryset = Materia.objects.all()
    serializer_class = MateriaSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ["titulo", "conteudo", "categoria"]
