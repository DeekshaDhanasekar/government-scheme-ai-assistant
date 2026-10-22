
import os
import requests

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel
from typing import Literal
from app.auth import router as auth_router
from app.chat_history import router as chat_history_router
from app.api.routes import router


# Load .env from the backend folder
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ENV_PATH = os.path.join(BASE_DIR, ".env")

load_dotenv(ENV_PATH)

ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")


app = FastAPI(title="Government Scheme RAG API")


# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Existing RAG routes
app.include_router(router)
app.include_router(auth_router)
app.include_router(chat_history_router)

# ElevenLabs Text-to-Speech
class TTSRequest(BaseModel):
    text: str
    language: Literal["English", "Tamil", "Hindi"] = "English"


@app.post("/tts")
def text_to_speech(request: TTSRequest):
    if not ELEVENLABS_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="ELEVENLABS_API_KEY is missing from the backend .env file.",
        )

    text = request.text.strip()

    if not text:
        raise HTTPException(
            status_code=400,
            detail="Text cannot be empty.",
        )

    voice_id = "JBFqnCBsd6RMkjVDRZzb"

    url = (
        f"https://api.elevenlabs.io/v1/text-to-speech/"
        f"{voice_id}?output_format=mp3_44100_128"
    )

    headers = {
        "xi-api-key": ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
        "Accept": "audio/mpeg",
    }

    # Send the generated answer to the multilingual TTS model.
    # The answer itself must already be in the selected language.
    data = {
        "text": text,
        "model_id": "eleven_multilingual_v2",
    }

    print("TTS LANGUAGE:", request.language)
    print("TTS TEXT LENGTH:", len(text))

    try:
        response = requests.post(
            url,
            headers=headers,
            json=data,
            timeout=60,
        )

    except requests.Timeout:
        raise HTTPException(
            status_code=504,
            detail="ElevenLabs took too long to respond. Please try again.",
        )

    except requests.RequestException as error:
        print("ELEVENLABS CONNECTION ERROR:", error)

        raise HTTPException(
            status_code=502,
            detail="Could not connect to ElevenLabs.",
        )

    if response.status_code != 200:
        print("ELEVENLABS ERROR STATUS:", response.status_code)
        print("ELEVENLABS ERROR:", response.text)

        raise HTTPException(
            status_code=502,
            detail="ElevenLabs TTS failed. Check the backend terminal.",
        )

    if not response.content:
        raise HTTPException(
            status_code=502,
            detail="ElevenLabs returned empty audio.",
        )

    print("TTS AUDIO SIZE:", len(response.content), "bytes")

    return Response(
        content=response.content,
        media_type="audio/mpeg",
        headers={
            "Cache-Control": "no-store",
        },
    )


@app.get("/")
def home():
    return {
        "message": "RAG API is running",
    }
