from flask import Blueprint, jsonify
from extensions.db import mongo

debug_bp = Blueprint("debug", __name__)

@debug_bp.route("/debug/detections", methods=["GET"])
def get_detections():
    try:
        detections = list(mongo.db.detections.find({}, {"_id": 0}))
        return jsonify(detections), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
