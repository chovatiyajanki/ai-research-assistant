from PyPDF2 import PdfReader

def extract_pdf_text(file):
    pdf = PdfReader(file.file)

    text=""

    for page in pdf.pages:
        page_text = page.extract_text()

        if page_text:
            text += page_text + "\n"
    return text