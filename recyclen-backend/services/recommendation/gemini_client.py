import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

def get_gemini_model():
    """Configures the Gemini model with specific generation and safety settings."""
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY is missing in .env file")

    genai.configure(api_key=api_key)
    
    # Force deterministic and structured output
    generation_config = {
        "temperature": 0.1, 
        "top_p": 0.95,
        "max_output_tokens": 1024,
    }

    # Safety settings to prevent blocking of waste-related material terms
    safety_settings = [
        {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE"},
    ]

    return genai.GenerativeModel(
        model_name='gemini-1.5-flash',
        generation_config=generation_config,
        safety_settings=safety_settings
    )

def call_gemini_api(prompt_text):
    """Executes the prompt and returns the raw text response or an empty list string on error."""
    try:
        model = get_gemini_model()
        response = model.generate_content(prompt_text)
        
        if not response or not response.text:
            return "[]"
            
        return response.text
    except Exception as e:
        print(f"Gemini API Connection Error: {str(e)}")
        return "[]"