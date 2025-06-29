from flask import request, jsonify
from services.chatbot_service import get_chatbot_response, fetch_user_history

def ask():
    data = request.get_json()
    question = data.get("question", "")
    user_id = data.get("user_id", "guest")

    if not question:
        return jsonify({"answer": "Please ask a valid question."}), 400

    try:
        answer = get_chatbot_response(question, user_id)
    except Exception:
        return jsonify({"answer": "Failed to get response from AI."}), 500

    return jsonify({"answer": answer})

def get_history():
    data = request.get_json()
    user_id = data.get("user_id", "guest")
    history = fetch_user_history(user_id)
    return jsonify(history)
