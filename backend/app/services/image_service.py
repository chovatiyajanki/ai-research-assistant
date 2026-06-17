from PIL import Image, ImageFilter, ImageOps
import os
import pytesseract

pytesseract.pytesseract.tesseract_cmd = os.getenv(
    "TESSERACT_CMD",
    r"C:\Program Files\Tesseract-OCR\tesseract.exe"
)

def prepare_image_for_ocr(image: Image.Image) -> Image.Image:
    image = ImageOps.grayscale(image)
    image = ImageOps.autocontrast(image)
    return image.filter(ImageFilter.SHARPEN)

def ocr_image(image: Image.Image) -> str:
    prepared_image = prepare_image_for_ocr(image)
    return pytesseract.image_to_string(prepared_image)

async def extract_image_text(file):
    image = Image.open(file.file)
    return ocr_image(image)