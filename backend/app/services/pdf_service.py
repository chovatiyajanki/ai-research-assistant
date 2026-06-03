from io import BytesIO

from PIL import Image
from PyPDF2 import PdfReader

from app.services.image_service import ocr_image

MIN_PAGE_TEXT_LENGTH = 80
PDF_RENDER_ZOOM = 2


def extract_pdf_text(file):
    pdf_bytes = file.file.read()
    typed_pages = extract_selectable_text(pdf_bytes)
    ocr_pages = extract_ocr_text(pdf_bytes, typed_pages)

    pages = []

    for index in range(max(len(typed_pages), len(ocr_pages))):
        typed_text = typed_pages[index] if index < len(typed_pages) else ""
        ocr_text = ocr_pages[index] if index < len(ocr_pages) else ""
        combined_text = combine_page_text(typed_text, ocr_text)

        if combined_text:
            pages.append(f"--- Page {index + 1} ---\n{combined_text}")

    return "\n\n".join(pages)


def extract_selectable_text(pdf_bytes: bytes):
    reader = PdfReader(BytesIO(pdf_bytes))
    pages = []

    for page in reader.pages:
        page_text = page.extract_text() or ""
        pages.append(page_text.strip())

    return pages


def extract_ocr_text(pdf_bytes: bytes, typed_pages):
    try:
        import fitz
    except ImportError as exc:
        if any(len(text.strip()) < MIN_PAGE_TEXT_LENGTH for text in typed_pages):
            raise ValueError(
                "PDF OCR is not available on this server. Please contact support or upload a text-based PDF."
            ) from exc

        return []

    document = fitz.open(stream=pdf_bytes, filetype="pdf")
    ocr_pages = []

    for page_index, page in enumerate(document):
        typed_text = typed_pages[page_index] if page_index < len(typed_pages) else ""

        if len(typed_text.strip()) >= MIN_PAGE_TEXT_LENGTH:
            ocr_pages.append("")
            continue

        matrix = fitz.Matrix(PDF_RENDER_ZOOM, PDF_RENDER_ZOOM)
        pixmap = page.get_pixmap(matrix=matrix, alpha=False)
        image = Image.frombytes(
            "RGB",
            [pixmap.width, pixmap.height],
            pixmap.samples
        )
        ocr_pages.append(ocr_image(image).strip())

    document.close()
    return ocr_pages


def combine_page_text(typed_text: str, ocr_text: str):
    typed_text = typed_text.strip()
    ocr_text = ocr_text.strip()

    if typed_text and ocr_text and ocr_text not in typed_text:
        return f"{typed_text}\n{ocr_text}"

    return typed_text or ocr_text
