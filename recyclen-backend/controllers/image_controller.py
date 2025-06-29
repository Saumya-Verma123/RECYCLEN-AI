from flask import request, jsonify
from services.image_service import handle_image_upload

def upload_image():
    data = request.get_json()
    return handle_image_upload(data)
