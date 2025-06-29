from flask import Blueprint
from controllers.chatbot_controller import ask, get_history

chatbot_bp = Blueprint("chatbot", __name__)

chatbot_bp.route("/ask", methods=["POST"])(ask)
chatbot_bp.route("/history", methods=["POST"])(get_history)