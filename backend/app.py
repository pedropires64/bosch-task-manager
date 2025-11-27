from flask import Flask
from flask_cors import CORS
from models import db, bcrypt
from auth_routes import auth_bp
from config import Config
from task_routes import task_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    bcrypt.init_app(app)
    CORS(app)

    app.register_blueprint(auth_bp, url_prefix="/auth")
    app.register_blueprint(task_bp, url_prefix="/tasks")

    with app.app_context():
        db.create_all()

    @app.route("/health")
    def health():
        return {"status": "API OK"}

    return app

app = create_app()

if __name__ == "__main__":
    app.run(debug=True)