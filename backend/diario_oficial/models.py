from django.db import models


class Edicao(models.Model):
    numero = models.PositiveIntegerField(unique=True, verbose_name="Número da Edição")
    data_publicacao = models.DateField(verbose_name="Data de Publicação")
    esta_aberta = models.BooleanField(default=True, verbose_name="Edição em Aberto?")

    class Meta:
        verbose_name = "Edição"
        verbose_name_plural = "Edições"

    def __str__(self):
        return f"Edição nº {self.numero} - {self.data_publicacao}"


class Materia(models.Model):
    edicao = models.ForeignKey(
        Edicao, on_delete=models.CASCADE, related_name="materias"
    )
    titulo = models.CharField(max_length=255)
    conteudo = models.TextField()
    categoria = models.CharField(max_length=100)  # Ex: Administrativo, Cível
    criado_em = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.titulo
