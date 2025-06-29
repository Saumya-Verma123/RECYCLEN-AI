import requests
import os

from extensions.db import get_history_collection

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

def get_chatbot_response(question, user_id):
    prompt = f"You are an expert in recycling and waste disposal. Answer briefly and clearly in 2-3 short sentences:\n{question}"

    response = requests.post(
        GROQ_API_URL,
        headers={
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json"
        },
        json={
            "model": "llama3-8b-8192",
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.7,
            "max_tokens": 150
        }
    )

    result = response.json()
    answer = result.get("choices", [{}])[0].get("message", {}).get("content", "No response available.")
    if len(answer) > 400:
        answer = answer[:400].rsplit('.', 1)[0] + '.'

    get_history_collection().insert_one({
        "user_id": user_id,
        "question": question,
        "answer": answer
    })

    return answer

def fetch_user_history(user_id):
    history_collection = get_history_collection()
    messages = history_collection.find({"user_id": user_id})
    history = []

    for msg in messages:
        history.append({"from": "user", "text": msg.get("question", "")})
        history.append({"from": "bot", "text": msg.get("answer", "")})
    
    return history
