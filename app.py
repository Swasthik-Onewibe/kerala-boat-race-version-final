from flask import Flask
from flask_socketio import SocketIO
import os
from config import Config
from utils.socket_events import register_socket_events
from routes.main_routes import main_bp
from routes.admin_routes import admin_bp
from routes.api_routes import api_bp

def create_app():
    app = Flask(__name__)
    app.secret_key = 'dev'
    app.config.from_object(Config)
    
    # Ensure upload folder exists
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    
    # Initialize SocketIO
    socketio = SocketIO(app, cors_allowed_origins="*")
    register_socket_events(socketio)
    
    # Register blueprints
    app.register_blueprint(main_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(api_bp)
    
    # Error handlers
    @app.errorhandler(413)
    def too_large(e):
        from flask import jsonify
        return jsonify({'success': False, 'message': 'File too large. Maximum size is 16MB'}), 413

    @app.errorhandler(400)
    def bad_request(e):
        from flask import jsonify
        return jsonify({'success': False, 'message': 'Bad request - please check your file upload'}), 400
    
    return app, socketio

if __name__ == '__main__':
    app, socketio = create_app()
    socketio.run(app, host='0.0.0.0',port=5001, debug=True)