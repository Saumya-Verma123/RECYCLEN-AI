from flask import Blueprint, request, jsonify
import logging
from services.recommendation.recommendation_service import generate_recommendations

# Set up logging for the reasoning pipeline
logger = logging.getLogger(__name__)

# Define the blueprint for the recommendation engine
recommendation_bp = Blueprint('recommendation', __name__)

@recommendation_bp.route('/', methods=['POST'])
def get_recommendations():
    """
    Endpoint to trigger the Agentic AI reasoning for detected waste items.
    Expects JSON: { "waste_list": ["plastic bottle", "paper"] }
    """
    try:
        data = request.get_json()
        
        # Extract the waste list sent by the frontend scanner
        waste_list = data.get('waste_list', [])

        if not waste_list:
            return jsonify({
                "status": "error", 
                "message": "No waste items provided for analysis"
            }), 400

        # Pass the sensor data to the Reasoning Agent
        recommendations = generate_recommendations(waste_list)
        
        # Return the structured disposal plan to the frontend
        return jsonify({
            "status": "success",
            "data": recommendations
        })

    except Exception as e:
        logger.error(f"Route Error in Recommendation Pipeline: {str(e)}")
        return jsonify({
            "status": "error",
            "message": "Internal server error in AI reasoning layer"
        }), 500