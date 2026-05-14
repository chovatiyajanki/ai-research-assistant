import os
from fastapi import UploadFile

UPLOAD_DIR = "uploads"

# create folder if not exists
os.makedirs(UPLOAD_DIR, exist_ok=True)

def save_file(file: UploadFile):
    file_path = os.path.join(UPLOAD_DIR, file.filename)

    with open(file_path, "wb") as f:
        while chunk := file.file.read(1024):
            f.write(chunk)
    
    return file_path