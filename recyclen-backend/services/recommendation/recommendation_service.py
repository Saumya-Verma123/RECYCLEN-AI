import json
import re
import logging
from .gemini_client import call_gemini_api
from .prompt_templates import build_waste_analysis_prompt

logger = logging.getLogger(__name__)

def extract_json(text: str):
    """Robustly cleans markdown and extracts JSON structure."""
    clean_text = re.sub(r"```json|```", "", text).strip()
    match = re.search(r"(\[.*\])", clean_text, re.DOTALL)
    return match.group(1) if match else clean_text

def generate_recommendations(waste_list):
    """The core pipeline function connecting sensing to reasoning."""
    try:
        prompt = build_waste_analysis_prompt(waste_list)
        raw_response = call_gemini_api(prompt)
        
        json_str = extract_json(raw_response)
        data = json.loads(json_str)

        if isinstance(data, list) and len(data) > 0:
            return data
            
        raise ValueError("Invalid AI Data")

    except Exception as e:
        logger.error(f"Reasoning Pipeline Fallback Triggered: {str(e)}")
        # ✅ Fallback ensures the user never sees "Service Unavailable"
        return [
            {
                "item": item,
                "category": "General",
                "tip": "Check your local municipal recycling guidelines for this material."
            } for item in waste_list
        ]