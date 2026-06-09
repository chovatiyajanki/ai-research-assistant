from app.services.pdf_service import extract_pdf_text
from app.services.image_service import extract_image_text
from app.services.image_service import ocr_image
from app.services.txt_service import extract_txt_text
from pathlib import Path
from types import SimpleNamespace

from PIL import Image

async def extract_text(file):
    filename = file.filename.lower()

    # PDF
    if filename.endswith(".pdf"):
        return extract_pdf_text(file)
    
    # Text File 
    elif filename.endswith(".txt"):
        return await extract_txt_text(file)
    
    # IMAGE OCR
    elif filename.endswith((".png",".jpg",".jpeg")):
        return await extract_image_text(file)
    
    raise ValueError("Unsupported file type")


def extract_text_from_path(file_path: str | Path, file_name: str | None = None):
    path = Path(file_path)
    filename = (file_name or path.name).lower()

    if filename.endswith(".pdf"):
        with path.open("rb") as file:
            return extract_pdf_text(SimpleNamespace(file=file))

    if filename.endswith(".txt"):
        return path.read_text(encoding="utf-8", errors="ignore")

    if filename.endswith((".png", ".jpg", ".jpeg")):
        with Image.open(path) as image:
            return ocr_image(image)

    raise ValueError("Unsupported file type")
            
            
