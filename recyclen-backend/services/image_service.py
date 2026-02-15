
import base64
import uuid
import os
from flask import jsonify
from services.yolov8_model import run_inference
from extensions.db import mongo
import base64
import uuid
import os
from flask import jsonify
from services.yolov8_model import run_inference
import logging

RECYCLABLE_MAP = {
     #  RECYCLABLE
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

    #  NON-RECYCLABLE
    "styrofoam": "Non-Recyclable",
    "fabric": "Non-Recyclable",
    "paper-disposal-items": "Non-Recyclable",
    "mlp": "Non-Recyclable",  # Multi-layer plastic
    "sup": "Non-Recyclable",  # Single-use plastic
    "leftover-food": "Non-Recyclable",
    "organic": "Non-Recyclable",

    #  HAZARDOUS / SPECIAL WASTE
    "e-waste": "Hazardous",
    "hazardous": "Hazardous",
    "broken glass": "Hazardous"
}


def handle_image_upload(data):
    if 'image' not in data:
        return jsonify({'error': 'No image provided'}), 400

    image_data = data['image']

    try:
        header, encoded = image_data.split(",", 1)
        image_bytes = base64.b64decode(encoded)
    except Exception:
        return jsonify({'error': 'Invalid image data'}), 400

    # Save with UUID to avoid conflicts
    image_id = str(uuid.uuid4())
    filename = f"{image_id}.jpg"
    save_path = os.path.join("static", "uploads", filename)
    os.makedirs(os.path.dirname(save_path), exist_ok=True)

    with open(save_path, "wb") as f:
        f.write(image_bytes)

    # Run YOLOv8 inference
    result = run_inference(save_path, output_filename=filename)

    if result is None:
        logging.error("Inference returned None")
        return jsonify({'error': 'Inference failed'}), 500

    import datetime

    updated_detected_objects = []

    for obj in result['detected_objects']:
        label = obj.get("class", "").lower()
        category = RECYCLABLE_MAP.get(label, "Unknown")

        obj["category"] = category
        updated_detected_objects.append(obj)

        result['detected_objects'] = updated_detected_objects

    # === Prepare result data ===
    result_data = {
        "image_id": image_id,
        "original_image": result['original_image'],         # string path
        "annotated_image": result['annotated_image'],
        "annotation_file": result.get('annotation_file'),
        "detected_objects": result['detected_objects'],
        "timestamp": datetime.datetime.utcnow().isoformat()
    }

    try:
        import sys
        logging.error(f"mongo object: {mongo}")
        logging.error(f"mongo.cx object: {getattr(mongo, 'cx', None)}")
        # === Insert into MongoDB ===
        # Convert any non-serializable fields to strings
        serializable_data = result_data.copy()
        for key, value in serializable_data.items():
            if not isinstance(value, (str, int, float, bool, type(None), list, dict)):
                serializable_data[key] = str(value)
        if mongo.db is None:
            logging.error("MongoDB client db attribute is None")
            return jsonify({'error': 'Database client not initialized'}), 500
        # Use mongo.db to get the database explicitly
        db = mongo.db
        result_insert = db.detections.insert_one(serializable_data)
        logging.info(f"Inserted detection record with id: {result_insert.inserted_id}")

        # === Prepare response ===
        response = {
            "message": "Image processed successfully",
            "original_image": f"/static/uploads/{os.path.basename(result['original_image'])}",
            "annotated_image": f"/static/predictions/{os.path.basename(result['annotated_image'])}",
            "detected_objects": result['detected_objects'],
            "annotation_file": f"/annotations/{os.path.basename(result['annotation_file'])}" if result['annotation_file'] else None
        }

        # === Insert into images collection for history ===
        history_data = {
            "user_id": "guest",
            "original_image_url": response["original_image"],
            "processed_image_url": response["annotated_image"],
            "timestamp": __import__('datetime').datetime.utcnow()
        }
        db.images.insert_one(history_data)

    except Exception as e:
        import traceback
        logging.error(f"MongoDB insert error: {e}")
        logging.error(traceback.format_exc())
        return jsonify({'error': 'Database insert failed'}), 500

    # === Prepare response ===
    response = {
        "message": "Image processed successfully",
        "original_image": f"/static/uploads/{os.path.basename(result['original_image'])}",
        "annotated_image": f"/static/predictions/{os.path.basename(result['annotated_image'])}",
        "detected_objects": result['detected_objects'],
        "annotation_file": f"/annotations/{os.path.basename(result['annotation_file'])}" if result['annotation_file'] else None
    }

    return jsonify(response), 200
   