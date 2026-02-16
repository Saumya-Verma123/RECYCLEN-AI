from pymongo import MongoClient
from bson.objectid import ObjectId
import logging
import os
from extensions.db import mongo # Ensure you import your existing mongo instance

def get_history(user_id):
    """
    Fetches all detection records.
    """
    try:
        # Sort by newest first (-1)
        cursor = mongo.db.detections.find().sort("timestamp", -1)
        
        history = []
        for doc in cursor:
            # Convert ObjectId to string
            doc["_id"] = str(doc["_id"])
            history.append(doc)
            
        return history
    except Exception as e:
        logging.error(f"Service Error (get_history): {e}")
        return []

def delete_image(user_id, image_id):
    """
    Deletes by ObjectId (if valid) OR by image_id (string UUID).
    """
    try:
        query = None
        
        # 1. Try to treat it as a MongoDB ObjectId
        if ObjectId.is_valid(image_id):
            query = {"_id": ObjectId(image_id)}
        else:
            # 2. Fallback to custom UUID string
            query = {"image_id": image_id}

        # Delete from detections (main data)
        result = mongo.db.detections.delete_one(query)
        
        # Also cleanup images collection just in case
        mongo.db.images.delete_one(query)

        return result.deleted_count > 0

    except Exception as e:
        logging.error(f"Service Error (delete_image): {e}")
        return False

def delete_all_history(user_id):
    """
    Wipes both collections.
    """
    try:
        mongo.db.detections.delete_many({})
        mongo.db.images.delete_many({})
        return True
    except Exception as e:
        logging.error(f"Service Error (delete_all): {e}")
        return False