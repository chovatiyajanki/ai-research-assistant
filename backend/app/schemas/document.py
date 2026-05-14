from pydantic import BaseModel

class DocumentResponse(BaseModel):
    document_id: int
    file_name: str

    class Config:
        from_attributes = True