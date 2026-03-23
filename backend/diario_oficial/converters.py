import io
import mammoth
import bleach
from odf.opendocument import load as load_odf
from odf.odf2xhtml import ODF2XHTML

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
    html = result.value  # HTML bruto do mammoth
    # Sanitiza para remover scripts maliciosos mantendo formatação
    clean = bleach.clean(html, tags=ALLOWED_TAGS, attributes=ALLOWED_ATTRS)
    return clean


def odt_to_html(file_obj) -> str:
    """Converte um arquivo .odt (file-like object) para HTML."""
    converter = ODF2XHTML(generate_css=True, embedlevel=0)
    content = file_obj.read()
    buf = io.BytesIO(content)
    converter.document = load_odf(buf)
    html = converter.xhtml()
    # bleach para manter apenas body content
    clean = bleach.clean(html, tags=ALLOWED_TAGS, attributes=ALLOWED_ATTRS, strip=True)
    return clean
