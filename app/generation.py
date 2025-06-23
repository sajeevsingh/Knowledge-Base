import os
from typing import List
from dotenv import load_dotenv
from openai import OpenAI

# Load environment variables
load_dotenv()

# Initialize OpenRouter-compatible OpenAI client
client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENROUTER_API_KEY"),
)

def build_prompt(question: str, context_chunks: List[str], mode: str = "customer") -> str:
    """
    Build a prompt for the LLM using retrieved document chunks and mode.

    Args:
        question: The user's question
        context_chunks: A list of relevant text chunks retrieved from the vector store
        mode: Either 'customer' or 'internal'

    Returns:
        Formatted prompt string
    """
    tone = "friendly and helpful" if mode == "customer" else "precise, policy-compliant, and internally focused"
    context_text = "\n\n".join(context_chunks)

    prompt = f"""
You are a {tone} support assistant. Use the context below to answer the user's question.

Context:
{context_text}

Question:
{question}

Answer:
""".strip()

    return prompt

def generate_answer(prompt: str) -> str:
    """
    Call the DeepSeek model via OpenRouter to generate a response.

    Args:
        prompt: The full prompt string

    Returns:
        The generated answer as a string
    """
    try:
        completion = client.chat.completions.create(
            model="deepseek/deepseek-chat-v3-0324:free",
            messages=[{"role": "user", "content": prompt}],
            extra_headers={
                "HTTP-Referer": "http://localhost:3000",  # Optional: Replace in production
                "X-Title": "Aquity-KnowledgeBase-Demo"    # Optional: Display name
            },
            extra_body={}
        )
        return completion.choices[0].message.content.strip()
    except Exception as e:
        raise RuntimeError(f"DeepSeek API error: {e}")