import mammoth
import bleach
from odf.opendocument import load as load_odf
from odf import teletype
from odf.text import P

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
    """Converte um arquivo .docx (file-like object) para HTML."""
    result = mammoth.convert_to_html(file_obj)
    html = result.value
    # Sanitiza para remover scripts maliciosos mantendo formatação
    clean = bleach.clean(html, tags=ALLOWED_TAGS, attributes=ALLOWED_ATTRS)
    return clean.strip()


def odt_to_html(file_obj) -> str:
    """
    Converte um arquivo .odt (file-like object) para HTML de forma robusta
    extraindo parágrafos e preservando a estrutura básica.
    """
    document = load_odf(file_obj)
    paragraphs = document.getElementsByType(P)
    html_parts = []

    for p in paragraphs:
        # Extrai o texto ignorando tags internas (como span de estilo)
        text = teletype.extractText(p)
        if text.strip():
            # Escapa conteúdo de texto básico para segurança
            safe_text = bleach.clean(text, tags=[], strip=True)
            html_parts.append(f"<p>{safe_text}</p>")

    html = "\n".join(html_parts)
    return html.strip()
