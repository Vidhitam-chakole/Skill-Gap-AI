# Lindin Analyzer

This folder is the planned backend boundary for LinkedIn resume analysis.

## Expected flow

1. Accept a PDF resume upload.
2. Extract text and structured sections: profile, experience, education, skills, certifications, social activity, and contact details.
3. Return a report matching the sections displayed by `frontend/src/pages/LinkedInAnalyzerPage.tsx`.

The frontend currently runs a local preview report so the upload workflow can be tested before a PDF parser and HTTP endpoint are added. A Python implementation can use `pypdf` for text extraction and expose a `POST /linkedin/analyze` endpoint alongside the existing CLI backend.
