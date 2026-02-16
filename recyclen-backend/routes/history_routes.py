from flask import Blueprint, request, jsonify
from services.history_service import get_history, delete_image, delete_all_history
import logging
import traceback

history_bp = Blueprint("history", __name__)

@history_bp.route("/history/detections", methods=["POST"])
def fetch_history_route():
    try:
        data = request.get_json() or {}
        user_id = data.get("user_id", "guest")
        history = get_history(user_id)
        return jsonify(history), 200
    except Exception as e:
        logging.error(f"Fetch Error: {e}")
        return jsonify({"error": str(e)}), 500

@history_bp.route("/history/delete", methods=["POST"])
def delete_history_item_route():
    try:
        data = request.get_json()
        if not data: return jsonify({"error": "No data received"}), 400
        
        user_id = data.get("user_id", "guest")
        image_id = data.get("image_id")
        
        if not image_id: return jsonify({"error": "Missing image_id"}), 400
        
        success = delete_image(user_id, image_id)
        
        if success:
            return jsonify({"message": "Deleted"}), 200
        else:
            return jsonify({"error": "Item not found"}), 404
    except Exception as e:
        logging.error(f"Delete Error: {e}")
        return jsonify({"error": str(e)}), 500

@history_bp.route("/history/clear", methods=["POST"])
def clear_history_route():
    try:
        data = request.get_json() or {}
        user_id = data.get("user_id", "guest")
        delete_all_history(user_id)
        return jsonify({"message": "Cleared"}), 200
    except Exception as e:
        logging.error(f"Clear Error: {e}")
        return jsonify({"error": str(e)}), 500