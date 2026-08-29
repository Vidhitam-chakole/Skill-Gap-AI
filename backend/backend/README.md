# LinkedIn Analyzer Backend

FastAPI service for extracting structured resume signals from LinkedIn PDF exports.

## Run

```powershell
cd "Lindin Analyzer\backend"
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload --port 8001
```

Upload a resume with `POST http://localhost:8001/linkedin/analyze` using a multipart field named `file`. Check `GET http://localhost:8001/health` for a health check.

The analyzer uses selectable PDF text. Scanned/image-only PDFs need OCR before they can be analyzed. Social activity is reported conservatively because a resume alone cannot verify LinkedIn posting or engagement history.
