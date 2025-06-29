from flask_pymongo import PyMongo

mongo = PyMongo()

def get_history_collection():
    return mongo.db.chatbot_history

def init_mongo(app):
    # Detect if connecting to localhost and disable TLS for local MongoDB
    mongo_uri = app.config.get("MONGO_URI", "")
    if "localhost" in mongo_uri or "127.0.0.1" in mongo_uri:
        mongo.init_app(app, tls=False)
    else:
        # Add TLS options to fix SSL handshake issues with MongoDB Atlas
        mongo.init_app(app, tls=True, tlsAllowInvalidCertificates=True)
