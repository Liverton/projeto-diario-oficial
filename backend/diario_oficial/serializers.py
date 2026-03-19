from rest_framework import serializers
from .models import Edicao, Materia


class MateriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Materia
        fields = ["id", "titulo", "conteudo", "categoria", "criado_em"]


class EdicaoSerializer(serializers.ModelSerializer):
    # O truque aqui: 'materias' deve ser o mesmo nome usado no
    # 'related_name' do seu Model Materia.
    materias = MateriaSerializer(many=True, read_only=True)

    class Meta:
        model = Edicao
        fields = ["id", "numero", "data_publicacao", "esta_aberta", "materias"]
