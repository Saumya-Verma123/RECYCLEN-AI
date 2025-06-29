from ultralytics import YOLO
from pathlib import Path
import os
import shutil

# Load model once (can be reused across requests)
import os
model_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "best2.pt")
model = YOLO(model_path)

import logging
def run_inference(image_path, output_dir="static/predictions", annotation_dir="static/annotations", output_filename=None):
    import traceback
    logging.basicConfig(level=logging.DEBUG)
    try:
        logging.debug(f"Running inference on image: {image_path}")
        # Run prediction on the image
        results = model.predict(source=image_path, save=True, save_txt=True, conf=0.3, device='cpu')
        
        result = results[0]  # Single image input
        original_name = os.path.basename(image_path)

        # Use output_filename if provided, else original_name
        output_name = output_filename if output_filename else original_name

        # Create output folders if not exist
        os.makedirs(output_dir, exist_ok=True)
        os.makedirs(annotation_dir, exist_ok=True)

        # Move annotated image
        pred_image_path = os.path.join(output_dir, output_name)
        src_pred_image = Path(result.save_dir) / original_name
        logging.debug(f"Moving annotated image from {src_pred_image} to {pred_image_path}")
        shutil.move(str(src_pred_image), pred_image_path)
        logging.debug(f"Annotated image exists: {os.path.exists(pred_image_path)}")

        # Move annotation file (if it exists)
        pred_label_path = os.path.join(annotation_dir, output_name.replace('.jpg', '.txt'))
        label_file = Path(result.save_dir) / "labels" / original_name.replace('.jpg', '.txt')
        if label_file.exists():
            logging.debug(f"Moving label file from {label_file} to {pred_label_path}")
            shutil.move(str(label_file), pred_label_path)
        else:
            logging.debug("Label file does not exist")
            pred_label_path = None

        # Extract detected classes
        detected_objects = []
        if result.boxes:
            for cls, conf in zip(result.boxes.cls, result.boxes.conf):
                detected_objects.append({
                    "class": model.names[int(cls)],
                    "confidence": float(conf)
            })
        else:
            detected_objects = []

        logging.debug(f"Detected objects: {detected_objects}")

        return {
            "original_image": image_path,
            "annotated_image": pred_image_path,
            "annotation_file": pred_label_path,
            "detected_objects": detected_objects
        }
    except Exception as e:
        logging.error(f"Error during inference: {e}")
        import traceback
        logging.error(traceback.format_exc())
        return None
