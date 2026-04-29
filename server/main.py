from fastapi import FastAPI, UploadFile, Form, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI
import os
from dotenv import load_dotenv
import pdfplumber
import io
import json

load_dotenv()

app = FastAPI()

# CORS - allow client origin from env or common dev ports
CLIENT_URL = os.getenv("CLIENT_URL")
origins = [CLIENT_URL] if CLIENT_URL else []

if os.getenv("DEV_ALLOW_ALL") == "1":
    allow_origins = ["*"]
else:
    allow_origins = origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

groq_client = OpenAI(
    api_key=os.getenv("AI_API_KEY"),
    base_url="https://api.groq.com/openai/v1",
)


def extract_pdf_text(file_bytes: bytes) -> str:
    try:
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            pages = [p.extract_text() or "" for p in pdf.pages]
            return "\n".join(pages).strip()
    except Exception:
        return ""


def analyze_with_ai(cv_text: str, job: str) -> dict:
    system_prompt = (
        "You are a senior CV reviewer. Compare the CV text with the job description and return only valid JSON. "
        "Your JSON must contain exactly these keys: score (integer 0-100), skills_match (array of strings), "
        "missing_skills (array of strings), explanation (string). "
        "Score should reflect overall fit, not just keyword overlap. "
        "Explanation should be concise, practical remarks for the candidate."
    )

    user_prompt = f"""
Job description:
{job}

CV text:
{cv_text}

Return only JSON.
"""

    response = groq_client.chat.completions.create(
        model=os.getenv("GROQ_MODEL", "llama-3.1-8b-instant"),
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.2,
        response_format={"type": "json_object"},
    )

    content = response.choices[0].message.content or "{}"
    data = json.loads(content)

    return {
        "score": int(data.get("score", 0)),
        "skills_match": list(data.get("skills_match", [])),
        "missing_skills": list(data.get("missing_skills", [])),
        "explanation": str(data.get("explanation", "")),
    }


@app.post("/analyze")
async def analyze(cv: UploadFile = File(...), job: str = Form(...)):
    if not cv.filename:
        raise HTTPException(status_code=400, detail="CV file is required")

    if not os.getenv("AI_API_KEY"):
        raise HTTPException(status_code=500, detail="AI_API_KEY is missing from server environment")

    content = await cv.read()
    cv_text = extract_pdf_text(content)

    if not cv_text:
        raise HTTPException(status_code=400, detail="Could not extract text from the PDF")

    return analyze_with_ai(cv_text=cv_text, job=job)