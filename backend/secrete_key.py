import secrets
print(secrets.token_urlsafe(32))

# FastAPI RunCommand
 
# Local network= uvicorn app.main:app --reload --host 192.168.1.9 --port 8000
# run server = uvicorn app.main:app --reload

# Frontend command 
# Local network = npm run dev -- --host
# run server = npm run dev 