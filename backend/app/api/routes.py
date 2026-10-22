
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Literal
import time

from app.rag.retriever import retrieve_documents
from app.rag.llm import generate_answer


router = APIRouter()


class QuestionRequest(BaseModel):
    question: str = Field(..., min_length=1)
    language: Literal["English", "Tamil", "Hindi"] = "English"


@router.post("/ask")
def ask_question(request: QuestionRequest):
    start = time.time()

    question = request.question.strip()
    language = request.language

    if not question:
        raise HTTPException(
            status_code=400,
            detail="Please enter a question."
        )

    print("\n========== NEW QUESTION ==========")
    print("Question:", question)
    print("Selected response language:", language)
    print("==================================")

    try:
        retrieval_start = time.time()

        documents = retrieve_documents(
            question,
            k=5
        )

        retrieval_end = time.time()

        # Documents are already text strings.
        context = "\n\n".join(documents)

        print("\n========== CONTEXT SENT TO GEMINI ==========")
        print(context[:2000])
        print("============================================\n")

        answer = generate_answer(
            question,
            context,
            language
        )

        if not answer or not answer.strip():
            raise HTTPException(
                status_code=502,
                detail="The AI returned an empty answer."
            )

        end = time.time()

        print("=" * 60)
        print("Question:", question)
        print("Selected language:", language)
        print("Retrieved documents:", len(documents))
        print(f"Retrieval time: {retrieval_end - retrieval_start:.2f} sec")
        print(f"LLM time: {end - retrieval_end:.2f} sec")
        print(f"Total time: {end - start:.2f} sec")
        print("=" * 60)

        return {
            "question": question,
            "answer": answer.strip(),
            "language": language
        }

    except HTTPException:
        raise

    except Exception as exc:
        print("Error in /ask:", repr(exc))

        raise HTTPException(
            status_code=502,
            detail="Unable to generate an answer. Check the backend terminal."
        ) from exc
