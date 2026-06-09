# AI Research Assistant SaaS

Frontend:
- React
- Tailwind CSS

Backend:
- FastAPI
- PostgreSQL

Features:
- Authentication
- AI Chat
- Research Tools
- Dashboard

## Deployment Configuration

### Railway backend

Set these variables in the Railway backend service:

- `DATABASE_URL`: Railway PostgreSQL connection string
- `SECRET_KEY`: secure JWT secret
- `ALGORITHM`: `HS256`
- `ACCESS_TOKEN_EXPIRE_MINUTES`: `60`
- `SQL_ECHO`: `false`
- `EMBEDDING_MODEL_NAME`: `all-MiniLM-L6-v2`
- `OLLAMA_MODEL`: `qwen3:8b`
- `OLLAMA_BASE_URL`: remote Ollama service URL, or leave blank to use document-excerpt fallback when Ollama is unavailable
- `WARM_EMBEDDING_MODEL_ON_STARTUP`: `false`, or `true` if you prefer slower deploy startup but faster first upload/question
- `ALLOWED_ORIGINS`: comma-separated frontend origins, without trailing slashes
- `ALLOWED_ORIGIN_REGEX`: optional regex for Vercel preview domains
- `UPLOAD_DIR`: `/data/uploads` when using a Railway volume, or `uploads`
- `VECTORSTORE_DIR`: `/data/vectorstore` when using a Railway volume, or `vectorstore`
- `TESSERACT_CMD`: optional path to Tesseract OCR if Railway cannot find it automatically

Example:

```env
ALLOWED_ORIGINS=https://ai-research-assistant-eosin.vercel.app,http://localhost:5173
ALLOWED_ORIGIN_REGEX=https://.*\.vercel\.app
SQL_ECHO=false
EMBEDDING_MODEL_NAME=all-MiniLM-L6-v2
OLLAMA_MODEL=qwen3:8b
OLLAMA_BASE_URL=
WARM_EMBEDDING_MODEL_ON_STARTUP=false
UPLOAD_DIR=/data/uploads
VECTORSTORE_DIR=/data/vectorstore
```

### Vercel frontend

Set this variable in the Vercel frontend project:

```env
VITE_API_BASE_URL=https://ai-research-assistant-production-7f65.up.railway.app
```

Redeploy Vercel after changing `VITE_API_BASE_URL`, because Vite embeds environment variables at build time.

### Vectorstore missing error

If the app shows `Vectorstore not found for doc_id`, the backend found the document row in PostgreSQL but could not find its FAISS index on disk. This can happen after a Railway redeploy without a persistent volume or after changing `VECTORSTORE_DIR`.

The backend will now try to rebuild the vectorstore from the original uploaded file. If the upload file is also missing, upload the document again after configuring a Railway volume mounted at `/data`.

### Local Docker

```bash
docker compose up --build
```

The Compose setup exposes the backend at `http://localhost:8000` and uses local mounted folders for uploads and vector stores.
