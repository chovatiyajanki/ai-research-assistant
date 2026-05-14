from app.services.pdf_service import extract_pdf_text
from app.services.image_service import extract_image_text
from app.services.txt_service import extract_txt_text

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
    
    return "Unsupported file type"
            
            
