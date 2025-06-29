from extensions.db import mongo
from bson import ObjectId

import logging

def get_history(user_id=None):
    # TEMPORARY: Fetch all detections unconditionally for testing
    detections = mongo.db.detections.find()
    def normalize_path(path):
        if path:
            # Replace all backslashes with forward slashes for URL compatibility
            return path.replace("\\", "/").replace("\\\\", "/")
        return path
    results = []
    for detection in detections:
        timestamp = detection.get("timestamp", None)
        detected_objects = detection.get("detected_objects", [])
        logging.error(f"Detection image_id: {detection.get('image_id')}, timestamp: {timestamp}, detected_objects count: {len(detected_objects)}")
        results.append({
            "_id": str(detection.get("image_id", "")),
            "original_image_url": normalize_path(detection.get("original_image", "")),
            "processed_image_url": normalize_path(detection.get("annotated_image", "")),
            "timestamp": timestamp,
            "detected_objects": detected_objects
        })
    logging.error(f"get_history returned {len(results)} records")
    if len(results) > 0:
        logging.error(f"Sample record: {results[0]}")
    return results


def delete_image(user_id, image_id):
    mongo.db.detections.delete_one({"_id": ObjectId(image_id), "user_id": user_id})


def delete_all_history(user_id):
    mongo.db.detections.delete_many({"user_id": user_id})
