import os
from pathlib import Path
from uuid import uuid4
from fastapi import UploadFile

UPLOAD_DIR = "uploads"
MIN_UPLOAD_SIZE = 1 * 1024 * 1024
MAX_UPLOAD_SIZE = 50 * 1024 * 1024
ALLOWED_EXTENSIONS = {".pdf", ".txt", ".png", ".jpg", ".jpeg"}

# create folder if not exists
os.makedirs(UPLOAD_DIR, exist_ok=True)

def save_file(file: UploadFile):
    original_name = Path(file.filename or "").name
    extension = Path(original_name).suffix.lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise ValueError("Unsupported file type")

    safe_name = f"{uuid4().hex}{extension}"
    file_path = os.path.join(UPLOAD_DIR, safe_name)
    total_size = 0

    with open(file_path, "wb") as f:
        while chunk := file.file.read(1024):
            total_size += len(chunk)
            if total_size > MAX_UPLOAD_SIZE:
                f.close()
                os.remove(file_path)
                raise ValueError("File too large. Maximum upload size is 50 MB")
            f.write(chunk)

    if total_size < MIN_UPLOAD_SIZE:
        os.remove(file_path)
        raise ValueError("File too small. Minimum upload size is 1 MB")
    
    return file_path
