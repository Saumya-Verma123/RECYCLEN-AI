from flask import request, jsonify
from services.image_service import handle_image_upload

def upload_image():
    try:
        # get file from request
        if "image" not in request.files:
            return jsonify({"status": "error", "message": "No image file provided"}), 400

        file = request.files["image"]

        if file.filename == "":
            return jsonify({"status": "error", "message": "No file selected"}), 400

        # send file to service
        return handle_image_upload(file)

    except Exception as e:
        print("UPLOAD ERROR:", e)
        return jsonify({"status": "error", "message": str(e)}), 500
