import mammoth
import bleach
import io

from odf.opendocument import load as load_odf
from odf.table import TableRow, TableCell
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    Paragraph,
    Spacer,
    Frame,
    PageTemplate,
    BaseDocTemplate,
    Table,
    TableStyle,
)
from reportlab.lib import colors
from reportlab.lib.units import cm
from reportlab.lib.enums import TA_JUSTIFY, TA_CENTER, TA_LEFT
from bs4 import BeautifulSoup, NavigableString, Tag

ALLOWED_TAGS = list(bleach.sanitizer.ALLOWED_TAGS) + [
    "p",
    "br",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "ul",
    "ol",
    "li",
    "table",
    "thead",
    "tbody",
    "tr",
    "th",
    "td",
    "strong",
    "em",
    "span",
    "div",
    "pre",
    "code",
    "blockquote",
]
ALLOWED_ATTRS = {
    "*": ["class", "style"],
}


def docx_to_html(file_obj) -> str:
    """
    Converte .docx para HTML usando Mammoth.
    Mammoth já produz HTML seguro — não sanitizamos para não perder estrutura.
    """
    file_obj.seek(0)
    result = mammoth.convert_to_html(file_obj)
    return result.value


def odt_to_html(file_obj) -> str:
    """
    Converte .odt para HTML preservando parágrafos e tabelas na ORDEM ORIGINAL
    do documento. Percorremos os filhos diretos do body do ODF para manter a
    sequência correta entre parágrafos e tabelas.
    """
    file_obj.seek(0)
    document = load_odf(file_obj)
    html_parts = []

    # Map paragraph/text styles to check for bold/italic
    style_map = {}

    # ODF armazena estilos em automaticstyles e styles
    style_nodes = []
    if hasattr(document, "automaticstyles"):
        style_nodes.extend(document.automaticstyles.childNodes)
    if hasattr(document, "styles"):
        style_nodes.extend(document.styles.childNodes)

    for s in style_nodes:
        if getattr(s, "qname", None) == (
            "urn:oasis:names:tc:opendocument:xmlns:style:1.0",
            "style",
        ):
            name = s.getAttribute("name")
            props = {"bold": False, "italic": False}
            for prop in s.childNodes:
                if getattr(prop, "qname", None) == (
                    "urn:oasis:names:tc:opendocument:xmlns:style:1.0",
                    "text-properties",
                ):
                    for (ns, attr_name), attr_val in prop.attributes.items():
                        if (
                            attr_name
                            in (
                                "font-weight",
                                "font-weight-asian",
                                "font-weight-complex",
                            )
                            and attr_val == "bold"
                        ):
                            props["bold"] = True
                        if (
                            attr_name
                            in ("font-style", "font-style-asian", "font-style-complex")
                            and attr_val == "italic"
                        ):
                            props["italic"] = True
            style_map[name] = props

    # O conteúdo do documento fica em document.text (office:text),
    # NÃO em document.body (office:body contém apenas o nó text).
    text_root = document.text

    def _extract_text_with_breaks(node):
        """Extrai texto de um nó ODF, mantendo quebras de linha (<br/>) e adicionando estilos inline (<b>, <i>)."""

        # Verifica estilo do container principal (parágrafo ou célula)
        root_style_name = (
            node.getAttribute("stylename") if hasattr(node, "getAttribute") else None
        )
        root_style = style_map.get(root_style_name, {}) if root_style_name else {}

        parts = []

        def _walk_text(n):
            if n.nodeType == 3:  # TEXT_NODE
                parts.append(n.data)
            else:
                qname = getattr(n, "qname", None)

                prefix, suffix = "", ""
                # Nós filhos (como span) também podem ter estilos
                if hasattr(n, "getAttribute"):
                    try:
                        style_name = n.getAttribute("stylename")
                        if style_name:
                            style = style_map.get(style_name, {})
                            if style.get("bold"):
                                prefix += "<b>"
                                suffix = "</b>" + suffix
                            if style.get("italic"):
                                prefix += "<i>"
                                suffix = "</i>" + suffix
                    except Exception:
                        pass

                parts.append(prefix)

                if qname == (
                    "urn:oasis:names:tc:opendocument:xmlns:text:1.0",
                    "line-break",
                ):
                    parts.append("<br/>")
                elif qname == ("urn:oasis:names:tc:opendocument:xmlns:text:1.0", "s"):
                    c = n.getAttribute("c")
                    parts.append(" " * (int(c) if c else 1))
                elif qname == ("urn:oasis:names:tc:opendocument:xmlns:text:1.0", "tab"):
                    parts.append("\t")
                else:
                    for child in n.childNodes:
                        _walk_text(child)

                parts.append(suffix)

        _walk_text(node)

        # Aplica o estilo do root (se for bold ou italic) em volta de todo o texto
        result_text = "".join(parts)
        if root_style.get("bold") and result_text.strip():
            # Não faz sentido aplicar bold duas vezes se o texto já estiver todo no bold,
            # mas o browser ignora aninhamento de <b><b>.
            result_text = f"<b>{result_text}</b>"
        if root_style.get("italic") and result_text.strip():
            result_text = f"<i>{result_text}</i>"

        return result_text

    def _render_table(table_node):
        """Converte um nó de tabela ODF em HTML <table>."""
        rows_html = []
        for row in table_node.getElementsByType(TableRow):
            cells_html = []
            for cell in row.getElementsByType(TableCell):
                cell_text = _extract_text_with_breaks(cell).strip()
                cells_html.append(
                    f"<td><p>{bleach.clean(cell_text, tags=['b', 'i', 'u', 'strong', 'em', 'br'], strip=True)}</p></td>"
                )
            if cells_html:
                rows_html.append(f"<tr>{''.join(cells_html)}</tr>")
        if rows_html:
            return f"<table>{''.join(rows_html)}</table>"
        return None

    # Qnames para identificação dos nós (odfpy carrega tudo como Element genérico)
    QNAME_P = ("urn:oasis:names:tc:opendocument:xmlns:text:1.0", "p")
    QNAME_TABLE = ("urn:oasis:names:tc:opendocument:xmlns:table:1.0", "table")

    def _walk(node):
        """Percorre recursivamente os nós, emitindo HTML na ordem original."""
        qname = getattr(node, "qname", None)

        # Verifica se o nó é uma tabela
        if qname == QNAME_TABLE:
            html = _render_table(node)
            if html:
                html_parts.append(html)
            return

        # Verifica se o nó é um parágrafo
        if qname == QNAME_P:
            text = _extract_text_with_breaks(node)
            if text.strip() and text.strip() != "<br/>":
                html_parts.append(
                    f"<p>{bleach.clean(text, tags=['b', 'i', 'u', 'strong', 'em', 'br'], strip=True)}</p>"
                )
            else:
                html_parts.append("<p><br/></p>")
            return

        # Para outros contêineres (text:section, office:text, etc.), percorre os filhos
        for child in node.childNodes:
            _walk(child)

    _walk(text_root)

    return "\n".join(html_parts)


def parse_html_to_elements(html_content, styles, col_width=10 * cm):
    """
    Analisa o HTML e o converte em uma lista de elementos Platypus (Paragraph, Table, etc.).
    """
    soup = BeautifulSoup(html_content, "lxml")
    # O lxml adiciona html/body, mas queremos o conteúdo interno.
    body = soup.body if soup.body else soup

    elements = []

    style_corpo = ParagraphStyle(
        "ParsedCorpo",
        parent=styles["Normal"],
        fontSize=9,
        leading=12,
        alignment=TA_JUSTIFY,
        fontName="Helvetica",
        spaceAfter=6,
        spaceBefore=2,
    )

    style_table = TableStyle(
        [
            ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
            ("FONTSIZE", (0, 0), (-1, -1), 8),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("LEFTPADDING", (0, 0), (-1, -1), 3),
            ("RIGHTPADDING", (0, 0), (-1, -1), 3),
        ]
    )

    def process_node(node):
        if isinstance(node, NavigableString):
            # Ignora nós de texto que são apenas espaços/quebras de linha entre tags —
            # esses não devem virar parágrafos independentes, para não fundir o conteúdo.
            # Apenas texto solto "real" (fora de qualquer tag de bloco) é renderizado.
            # Na prática, o HTML gerado pelos conversores usa sempre <p>, então este
            # caso não deve ocorrer; mas garantimos que não quebre o layout.
            return
        elif isinstance(node, Tag):
            if node.name == "br":
                elements.append(Spacer(1, 0.25 * cm))
            elif node.name in ["p", "div", "h1", "h2", "h3", "h4", "h5", "h6", "li"]:
                # Apenas listamos as tags permitidas; se o node contiver styles como 'text-align: center',
                # podemos precisar do bleach com ALLOWED_ATTRS, mas como parse_html_to_elements converte
                # as tags para Platypus Paragraphs, não precisamos do CSS styles.
                inner_html = bleach.clean(
                    node.decode_contents(),
                    tags=[
                        "b",
                        "i",
                        "u",
                        "strike",
                        "font",
                        "sub",
                        "sup",
                        "strong",
                        "em",
                        "br",
                    ],
                    strip=True,
                )
                # Converte tags semânticas para as tags de estilo do ReportLab
                inner_html = inner_html.replace("<strong>", "<b>").replace(
                    "</strong>", "</b>"
                )
                inner_html = inner_html.replace("<em>", "<i>").replace("</em>", "</i>")
                inner_html = inner_html.replace("<br>", "<br/>")
                if inner_html.strip():
                    elements.append(Paragraph(inner_html, style_corpo))
                else:
                    # Parágrafo vazio = espaçador vertical
                    elements.append(Spacer(1, 0.25 * cm))

            elif node.name == "table":
                table_data = []
                # Procuramos todas as linhas, independentemente de estarem em <tbody>, <thead> ou direto na <table>
                rows = node.find_all("tr")
                for row in rows:
                    row_data = []
                    cols = row.find_all(["td", "th"], recursive=False)
                    for col in cols:
                        # Para cada célula, processamos seu conteúdo como parágrafo
                        cell_html = bleach.clean(
                            col.decode_contents(),
                            tags=["b", "i", "u", "br", "font", "span", "strong", "em"],
                            strip=True,
                        )
                        # Converte tags semânticas para as entendidas pelo ReportLab
                        cell_html = cell_html.replace("<strong>", "<b>").replace(
                            "</strong>", "</b>"
                        )
                        cell_html = cell_html.replace("<em>", "<i>").replace(
                            "</em>", "</i>"
                        )
                        cell_html = cell_html.replace("<br>", "<br/>")
                        # Se a célula estiver vazia, colocamos um espaço para não quebrar a tabela
                        if not cell_html.strip():
                            cell_html = "&nbsp;"
                        row_data.append(Paragraph(cell_html, style_corpo))
                    if row_data:
                        table_data.append(row_data)

                if table_data:
                    # Ajusta largura da tabela para caber na coluna (col_width)
                    # Tentamos distribuir a largura igualmente entre as colunas
                    num_cols = len(table_data[0]) if table_data else 1
                    t_col_widths = [col_width / num_cols] * num_cols
                    t = Table(table_data, colWidths=t_col_widths, hAlign=TA_LEFT)
                    t.setStyle(style_table)
                    t.spaceBefore = 0.3 * cm
                    t.spaceAfter = 0.3 * cm
                    elements.append(t)
                    elements.append(Spacer(1, 0.4 * cm))

            elif node.name == "br":
                elements.append(Spacer(1, 0.25 * cm))

            else:
                # Processa filhos recursivamente para tags não mapeadas
                for child in node.children:
                    process_node(child)

    for child in body.children:
        process_node(child)

    return elements


def html_to_pdf(
    html_content, edition_number=None, publication_date=None, title="DIÁRIO OFICIAL"
):
    """
    Converte conteúdo HTML para um buffer PDF com layout de duas colunas,
    cabeçalho e rodapé no estilo de um Diário Oficial.
    """
    buffer = io.BytesIO()
    doc = BaseDocTemplate(buffer, pagesize=A4)

    # Margens e dimensões
    width, height = A4
    margin = 1.5 * cm
    col_gap = 0.5 * cm
    col_width = (width - 2 * margin - col_gap) / 2

    # Frames: Duas colunas
    frame1 = Frame(
        margin, margin + 2 * cm, col_width, height - 2 * margin - 3 * cm, id="col1"
    )
    frame2 = Frame(
        margin + col_width + col_gap,
        margin + 2 * cm,
        col_width,
        height - 2 * margin - 3 * cm,
        id="col2",
    )

    def header_footer(canvas, doc):
        canvas.saveState()

        # Cabeçalho
        canvas.setFont("Helvetica-Bold", 12)
        canvas.drawCentredString(width / 2.0, height - 1.5 * cm, "MUNICÍPIO DE EXEMPLO")
        canvas.setFont("Helvetica", 10)
        canvas.drawCentredString(width / 2.0, height - 2.0 * cm, title)

        line_y = height - 2.2 * cm
        canvas.line(margin, line_y, width - margin, line_y)

        info_text = (
            f"Edição nº {edition_number or '---'} | Data: {publication_date or '---'}"
        )
        canvas.drawCentredString(width / 2.0, line_y - 0.5 * cm, info_text)

        # Rodapé
        canvas.line(margin, margin + 1.2 * cm, width - margin, margin + 1.2 * cm)
        page_num = f"Página {doc.page}"
        canvas.drawRightString(width - margin, margin + 0.5 * cm, page_num)

        canvas.restoreState()

    template = PageTemplate(id="TwoCol", frames=[frame1, frame2], onPage=header_footer)
    doc.addPageTemplates([template])

    # Estilos de base
    styles = getSampleStyleSheet()
    style_materia_titulo = ParagraphStyle(
        "MateriaTitulo",
        parent=styles["Heading2"],
        fontSize=11,
        alignment=TA_CENTER,
        spaceAfter=6,
        spaceBefore=12,
        fontName="Helvetica-Bold",
    )

    elements = []

    # Processa as matérias
    if isinstance(html_content, list):
        for materia in html_content:
            elements.append(Paragraph(materia.get("titulo", ""), style_materia_titulo))
            # Converte HTML da matéria em elementos Platypus individuais
            elements.extend(
                parse_html_to_elements(materia.get("conteudo", ""), styles, col_width)
            )
            elements.append(Spacer(1, 0.2 * cm))
    else:
        # Se for uma string única (caso usem para preview isolado)
        elements.extend(parse_html_to_elements(html_content, styles, col_width))

    doc.build(elements)
    buffer.seek(0)
    return buffer
