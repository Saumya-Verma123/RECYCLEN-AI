def build_waste_analysis_prompt(waste_list):
    """Constructs a prompt that forces the AI to reason about sensor data."""
    # Clean and join items from the scan result
    items_str = ", ".join([str(item).strip() for item in waste_list if item])

    return f"""
    You are an AI Waste Specialist. Your task is to analyze items detected by a sensor: {items_str}
    
    TASK:
    - Reason about the material composition of each item.
    - Interpret common abbreviations (e.g., "pet" should be treated as "PET Plastic Bottle").
    
    RESPONSE FORMAT:
    Return ONLY a valid JSON LIST of objects.
    Each object MUST contain these exact keys:
    - "item": (string) The full, clear name of the object.
    - "category": (string) Choose from: "Recycle", "Compost", "Trash", "Hazardous".
    - "tip": (string) Provide a specific, actionable disposal tip (max 10 words).
    
    Output ONLY valid JSON. No markdown code blocks, no conversational filler.
    """