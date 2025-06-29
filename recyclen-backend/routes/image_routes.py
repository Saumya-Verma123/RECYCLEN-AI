from flask import Blueprint
from controllers.image_controller import upload_image
# Add other imports if needed

image_bp = Blueprint("image", __name__)

image_bp.route("/upload", methods=["POST"])(upload_image)
# Add other image-related routes as well
