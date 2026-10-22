
import time
from google import genai
from google.genai import errors

from app.config import GEMINI_API_KEY


client = genai.Client(api_key=GEMINI_API_KEY)


def generate_answer(question, context, language="English"):

    language_instructions = {
        "English": (
            "Respond entirely in clear, natural English."
        ),
        "Tamil": (
            "Respond entirely in natural Tamil using Tamil script. "
            "Avoid English sentences. Keep official government "
            "scheme names, acronyms, and essential technical terms "
            "recognizable. Explain the details in Tamil."
        ),
        "Hindi": (
            "Respond entirely in natural Hindi using Devanagari script. "
            "Avoid English sentences. Keep official government "
            "scheme names, acronyms, and essential technical terms "
            "recognizable. Explain the details in Hindi."
        ),
    }

    language = language if language in language_instructions else "English"
    language_instruction = language_instructions[language]

    prompt = f"""
You are Government Scheme AI Assistant.

Answer questions about Indian government schemes using the
provided context.

IMPORTANT RULES:
- Answer clearly, directly, and helpfully.
- Use relevant information from the context.
- If the context partially answers the question, explain what it supports.
- Do not claim information is unavailable when related information exists.
- Do not mention internal retrieval processes or that you are reading documents.
- Never invent scheme details, eligibility rules, amounts, dates, or benefits.
- If the context does not contain enough information, explain the limitation.
- Preserve important figures, eligibility conditions, and scheme names.
- Use simple language that ordinary people can understand.
- Format the answer with short paragraphs or bullet points when useful.

LANGUAGE REQUIREMENT:
The selected response language is {language}.
{language_instruction}

The ENTIRE explanation must follow the selected language, even when
the question or context is written in another language.
Do not switch languages midway through the answer.

CONTEXT:
---------------------
{context}
---------------------

QUESTION:
{question}

ANSWER:
"""

    models = [
        "gemini-3.5-flash-lite",
        "gemini-2.5-flash",
    ]

    last_error = None

    for model in models:
        for attempt in range(2):
            try:
                response = client.models.generate_content(
                    model=model,
                    contents=prompt,
                )

                answer = getattr(response, "text", None)

                if answer and answer.strip():
                    return answer.strip()

                last_error = RuntimeError(
                    f"{model} returned an empty response."
                )
                break

            except errors.APIError as exc:
                last_error = exc

                status_code = getattr(
                    exc,
                    "code",
                    getattr(exc, "status_code", None),
                )

                # Retry temporary server or rate-limit errors once.
                if status_code in (429, 500, 502, 503, 504):
                    if attempt == 0:
                        time.sleep(2)
                        continue

                # Try the next model for other API errors too.
                break

            except Exception as exc:
                last_error = exc
                break

    raise RuntimeError(
        f"Gemini failed to generate an answer: {last_error}"
    )
