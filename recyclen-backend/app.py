
from flask import Flask
from flask_cors import CORS
from routes.image_routes import image_bp
from routes.chatbot_routes import chatbot_bp
from routes.recycling_routes import recycling_bp
from extensions.db import mongo, init_mongo

from dotenv import load_dotenv
import os

# === Load .env ===
load_dotenv()

# === Initialize App ===
app = Flask(__name__, static_folder='static', static_url_path='/static')
CORS(app)

# === App Configuration ===
app.secret_key = os.getenv("FLASK_SECRET_KEY")
app.config["MONGO_URI"] = os.getenv("MONGO_URI")

# === Initialize Extensions ===
print(f"Initializing MongoDB with URI: {app.config.get('MONGO_URI')}")
init_mongo(app)
try:
    mongo.cx.server_info()  # Forces a call to the server to check connection
    print("MongoDB connection successful")
except Exception as e:
    print(f"MongoDB connection error: {e}")

# === Register Blueprints ===
app.register_blueprint(image_bp)
app.register_blueprint(chatbot_bp)
from routes.history_routes import history_bp
from routes.debug_routes import debug_bp

app.register_blueprint(history_bp)
app.register_blueprint(debug_bp)
app.register_blueprint(recycling_bp)


# === Home Route ===
@app.before_request
def before_request_logging():
    import logging
    from flask import current_app, has_app_context
    logging.error(f"App config MONGO_URI: {current_app.config.get('MONGO_URI')}")
    logging.error(f"Has app context: {has_app_context()}")
    logging.error(f"mongo object in request: {mongo}")
    logging.error(f"mongo.cx object in request: {getattr(mongo, 'cx', None)}")
    logging.error(f"mongo.db object in request: {getattr(mongo, 'db', None)}")
    logging.error(f"mongo client is initialized: {mongo is not None and getattr(mongo, 'cx', None) is not None and getattr(mongo, 'db', None) is not None}")

@app.route("/")
def home():
    return "Recyclens backend is running!"

import os
@app.route("/cwd")
def get_cwd():
    return {"cwd": os.getcwd()}


# === Run Server ===
if __name__ == "__main__":
    app.run(debug=True)
