from django.http import HttpResponse
from rest_framework import viewsets, filters, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser
from rest_framework.decorators import action
from .models import Edicao, Materia
from .serializers import EdicaoSerializer, MateriaSerializer
from .converters import docx_to_html, odt_to_html, html_to_pdf


class EdicaoViewSet(viewsets.ModelViewSet):
    # Ordenamos pela data mais recente para o Diário Oficial
    queryset = Edicao.objects.all().order_by("-data_publicacao")
    serializer_class = EdicaoSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ["numero", "materias__titulo", "materias__conteudo"]

    @action(detail=True, methods=["get"])
    def download_pdf(self, request, pk=None):
        edicao = self.get_object()
        materias = edicao.materias.all().values("titulo", "conteudo")

        pdf_buffer = html_to_pdf(
            list(materias),
            edition_number=edicao.numero,
            publication_date=edicao.data_publicacao.strftime("%d/%m/%Y"),
            title=f"DIÁRIO OFICIAL - {edicao.tipo.upper()}",
        )

        response = HttpResponse(pdf_buffer, content_type="application/pdf")
        filename = f"diario_oficial_edicao_{edicao.numero}.pdf"
        response["Content-Disposition"] = f'attachment; filename="{filename}"'
        return response


class MateriaViewSet(viewsets.ModelViewSet):
    queryset = Materia.objects.all()
    serializer_class = MateriaSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ["titulo", "conteudo", "setor"]

    @action(detail=True, methods=["get"])
    def download_pdf(self, request, pk=None):
        materia = self.get_object()

        pdf_buffer = html_to_pdf(
            [{"titulo": materia.titulo, "conteudo": materia.conteudo}],
            edition_number=materia.edicao.numero,
            publication_date=materia.edicao.data_publicacao.strftime("%d/%m/%Y"),
            title="MATÉRIA AVULSA",
        )

        response = HttpResponse(pdf_buffer, content_type="application/pdf")
        filename = f"materia_{materia.id}.pdf"
        response["Content-Disposition"] = f'attachment; filename="{filename}"'
        return response


class ConvertDocumentView(APIView):
    """
    Recebe um arquivo .docx ou .odt e retorna seu conteúdo em HTML.
    POST /api/converter-documento/
    Body: multipart/form-data com campo 'arquivo'
    """

    parser_classes = [MultiPartParser]

    def post(self, request, *args, **kwargs):
        arquivo = request.FILES.get("arquivo")
        if not arquivo:
            return Response(
                {"erro": "Nenhum arquivo enviado. Use o campo 'arquivo'."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        html = None
        nome = arquivo.name.lower()
        if nome.endswith(".docx"):
            try:
                html = docx_to_html(arquivo)
            except Exception:
                return Response(
                    {
                        "erro": (
                            "Não foi possível processar o arquivo .docx. "
                            "Verifique se o arquivo não está corrompido e tente novamente."
                        )
                    },
                    status=status.HTTP_422_UNPROCESSABLE_ENTITY,
                )
        elif nome.endswith(".odt"):
            try:
                html = odt_to_html(arquivo)
            except Exception:
                return Response(
                    {
                        "erro": (
                            "Não foi possível processar o arquivo .odt. "
                            "Verifique se o arquivo não está corrompido e tente novamente."
                        )
                    },
                    status=status.HTTP_422_UNPROCESSABLE_ENTITY,
                )
        else:
            return Response(
                {
                    "erro": (
                        "Formato não suportado. "
                        "Por favor, envie um arquivo no formato .docx (Word) ou .odt (LibreOffice)."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not html:
            return Response(
                {
                    "erro": (
                        "O arquivo foi lido, mas nenhum conteúdo de texto foi encontrado no corpo do documento. "
                        "Tente copiar e colar o texto manualmente caso o arquivo tenha um layout muito complexo."
                    )
                },
                status=status.HTTP_422_UNPROCESSABLE_ENTITY,
            )

        return Response({"html": html}, status=status.HTTP_200_OK)
