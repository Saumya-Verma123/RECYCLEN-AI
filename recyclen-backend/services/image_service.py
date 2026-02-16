import uuid
import os
import logging
from flask import jsonify
from services.yolov8_model import run_inference
from extensions.db import mongo
import datetime

RECYCLABLE_MAP = {
    "black-hdpe": "Recyclable",
    "hdpe": "Recyclable",
    "pet": "Recyclable",
    "plastic": "Recyclable",
    "plastic-bottles": "Recyclable",
    "metal": "Recyclable",
    "metal-can": "Recyclable",
    "paper": "Recyclable",
    "paper-cardboard": "Recyclable",
    "glass-items": "Recyclable",

    "styrofoam": "Non-Recyclable",
    "fabric": "Non-Recyclable",
    "paper-disposal-items": "Non-Recyclable",
    "mlp": "Non-Recyclable",
    "sup": "Non-Recyclable",
    "leftover-food": "Non-Recyclable",
    "organic": "Non-Recyclable",

    "e-waste": "Hazardous",
    "hazardous": "Hazardous",
    "broken glass": "Hazardous"
}


def handle_image_upload(file):

    try:
        # Generate unique filename
        image_id = str(uuid.uuid4())
        filename = f"{image_id}.jpg"

        upload_folder = os.path.join("static", "uploads")
        os.makedirs(upload_folder, exist_ok=True)

        save_path = os.path.join(upload_folder, filename)

        # Save uploaded file
        file.save(save_path)

        logging.info(f"File saved at: {save_path}")

        # Run YOLO inference
        result = run_inference(save_path, output_filename=filename)

        if result is None:
            return jsonify({'error': 'Inference failed'}), 500

        # Add recyclable category
        updated_objects = []
        for obj in result['detected_objects']:
            label = obj.get("class", "").lower()
            category = RECYCLABLE_MAP.get(label, "Unknown")
            obj["category"] = category
            updated_objects.append(obj)

        result['detected_objects'] = updated_objects

        # Prepare database record
        result_data = {
            "image_id": image_id,
            "original_image": result['original_image'],
            "annotated_image": result['annotated_image'],
            "detected_objects": result['detected_objects'],
            "timestamp": datetime.datetime.utcnow().isoformat()
        }

        # Insert into MongoDB
        if mongo.db is not None:
            mongo.db.detections.insert_one(result_data)

            mongo.db.images.insert_one({
                "user_id": "guest",
                "original_image_url": result['original_image'],
                "processed_image_url": result['annotated_image'],
                "timestamp": datetime.datetime.utcnow()
            })

        # Response
        BASE_URL = "http://127.0.0.1:5000"

# Convert Windows path to URL path
        original_rel = result['original_image'].replace("\\", "/")
        annotated_rel = result['annotated_image'].replace("\\", "/")

        # Remove leading "./" if exists
        if original_rel.startswith("./"):
            original_rel = original_rel[2:]

        if annotated_rel.startswith("./"):
            annotated_rel = annotated_rel[2:]

        response = {
            "message": "Image processed successfully",
            "original_image": "/" + original_rel,
            "annotated_image": "/" + annotated_rel,
            "detected_objects": result['detected_objects']
        }


        return jsonify(response), 200

    except Exception as e:
        logging.error(str(e))
        return jsonify({"error": str(e)}), 500
