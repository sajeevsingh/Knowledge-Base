from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Literal

from app.retrieval import retrieve_relevant_chunks
from app.generation import build_prompt, generate_answer

app = FastAPI()

# === Enable CORS so React frontend can communicate with FastAPI backend ===
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace "*" with your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# === Request Schema ===
class AskRequest(BaseModel):
    question: str
    mode: Literal["customer", "internal"] = "customer"

# === Endpoint to handle assistant query ===
@app.post("/ask")
def ask(req: AskRequest):
    chunks = retrieve_relevant_chunks(req.question, mode=req.mode)
    if not chunks:
        return {"answer": "Sorry, I couldn't find any relevant information."}

    context = [c["text"] for c in chunks]
    prompt = build_prompt(req.question, context, mode=req.mode)
    answer = generate_answer(prompt)

    return {
        "answer": answer.strip(),
        "sources": [c.get("source", "unknown") for c in chunks]
    }

# === Health check endpoint ===
@app.get("/")
def health():
    return {"status": "ok"}