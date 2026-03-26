from django.db import models


class Edicao(models.Model):
    TIPO_CHOICES = [
        ("Ordinária", "Ordinária"),
        ("Extraordinária", "Extraordinária"),
        ("Errata", "Errata"),
    ]
    numero = models.PositiveIntegerField(
        unique=True, blank=True, null=True, verbose_name="Número da Edição"
    )
    data_publicacao = models.DateField(verbose_name="Data de Publicação")
    tipo = models.CharField(
        max_length=20,
        choices=TIPO_CHOICES,
        default="Ordinária",
        verbose_name="Tipo de Edição",
    )
    esta_aberta = models.BooleanField(default=True, verbose_name="Edição em Aberto?")

    class Meta:
        verbose_name = "Edição"
        verbose_name_plural = "Edições"

    def save(self, *args, **kwargs):
        if self.numero is None:
            # Pega o maior número atual ou começa em 1
            max_num = Edicao.objects.aggregate(models.Max("numero"))["numero__max"] or 0
            self.numero = max_num + 1
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Edição nº {self.numero} ({self.tipo}) - {self.data_publicacao}"


class Materia(models.Model):
    edicao = models.ForeignKey(
        Edicao, on_delete=models.CASCADE, related_name="materias"
    )
    titulo = models.CharField(max_length=255)
    conteudo = models.TextField()
    setor = models.CharField(max_length=100)  # Ex: Administrativo, Cível
    criado_em = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.titulo
