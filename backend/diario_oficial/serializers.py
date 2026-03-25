from rest_framework import serializers
from .models import Edicao, Materia


class MateriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Materia
        fields = ["id", "edicao", "titulo", "conteudo", "setor", "criado_em"]


class EdicaoSerializer(serializers.ModelSerializer):
    materias = MateriaSerializer(many=True, read_only=True)
    numero = serializers.IntegerField(read_only=True)

    class Meta:
        model = Edicao
        fields = [
            "id",
            "numero",
            "data_publicacao",
            "tipo",
            "esta_aberta",
            "materias",
        ]

    def validate(self, data):
        tipo = data.get("tipo", "Ordinária")
        data_publicacao = data.get("data_publicacao")

        # Verifica se já existe uma Ordinária para a mesma data
        if tipo == "Ordinária" and data_publicacao:
            # Em caso de edição de um registro existente (PUT/PATCH), excluímos ele da busca
            # self.instance nos dá o objeto sendo editado
            qs = Edicao.objects.filter(
                tipo="Ordinária", data_publicacao=data_publicacao
            )
            if self.instance:
                qs = qs.exclude(id=self.instance.id)

            if qs.exists():
                raise serializers.ValidationError(
                    {
                        "data_publicacao": "Já existe uma edição ORDINÁRIA cadastrada para esta data."
                    }
                )

        return data
