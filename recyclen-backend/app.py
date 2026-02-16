import os
from flask import Flask, jsonify
from flask_cors import CORS #
from routes.image_routes import image_bp
from routes.recommendation_routes import recommendation_bp
from routes.history_routes import history_bp
from flask import Flask
from flask_cors import CORS

app = Flask(__name__)
CORS(app)


def create_app():
    app = Flask(__name__, static_folder="static", static_url_path="/static")

    
    # ✅ FIX: Explicitly allow React (3000) to talk to Flask (5000)
    CORS(app, resources={r"/*": {"origins": "*"}})

    app.config['UPLOAD_FOLDER'] = 'static/uploads'
    if not os.path.exists(app.config['UPLOAD_FOLDER']):
        os.makedirs(app.config['UPLOAD_FOLDER'])

    # ✅ FIX: Root route to stop 404 errors
    @app.route('/')
    def index():
        return jsonify({"status": "online", "message": "Recyclens API Ready"}), 200

    # ✅ FIX: Prevent 500 errors from crashing the connection
    @app.errorhandler(Exception)
    def handle_exception(e):
        return jsonify({"status": "error", "message": str(e)}), 500

    # Registering Blueprint Layers
    app.register_blueprint(image_bp, url_prefix='/image')
    app.register_blueprint(recommendation_bp, url_prefix='/recommendation')
    app.register_blueprint(history_bp, url_prefix='/history')

    return app

if __name__ == '__main__':
    app = create_app()
    # ✅ FIX: host='0.0.0.0' makes the server accessible locally
    app.run(debug=True, host='0.0.0.0', port=5000, use_reloader=False)