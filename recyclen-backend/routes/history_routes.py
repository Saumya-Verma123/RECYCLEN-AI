from flask import Blueprint, request, jsonify
from services.history_service import get_history, delete_image, delete_all_history

history_bp = Blueprint("history", __name__)

import logging

@history_bp.route("/history/detections", methods=["POST"])
def fetch_history():
    data = request.get_json()
    user_id = data.get("user_id", "guest")
    logging.error(f"fetch_history called with user_id: {user_id}")
    history = get_history(user_id)
    logging.error(f"fetch_history returning {len(history)} records")
    return jsonify(history)

@history_bp.route("/history/delete", methods=["POST"])
def delete_history_item():
    data = request.get_json()
    user_id = data.get("user_id", "guest")
    image_id = data.get("image_id")
    if not image_id:
        return jsonify({"error": "image_id is required"}), 400
    delete_image(user_id, image_id)
    return jsonify({"message": "Image deleted successfully"})

@history_bp.route("/history/clear", methods=["POST"])
def clear_history():
    data = request.get_json()
    user_id = data.get("user_id", "guest")
    delete_all_history(user_id)
    return jsonify({"message": "History cleared successfully"})
