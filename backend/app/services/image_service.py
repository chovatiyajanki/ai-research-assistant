from PIL import Image
import pytesseract

# Windows path
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

async def extract_image_text(file):
    image = Image.open(file.file)

    text = pytesseract.image_to_string(image)

    return text