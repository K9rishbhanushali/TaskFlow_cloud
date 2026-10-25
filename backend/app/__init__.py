"""TaskFlow Cloud — Flask application factory (Phase 3).

Pattern in one paragraph: create_app() builds the app, loads Config from
environment variables, initializes each extension with init_app, imports
models (so migrations see them), then registers routes. Tests call
create_app() with an in-memory SQLite DB; run.py calls it for local dev;
Gunicorn (EC2) calls run:app in production.
"""
from flask import Flask, jsonify
from flask_cors import CORS
from sqlalchemy import text

from config import Config


def create_app(config_class=Config, config_overrides=None):
    app = Flask(__name__)
    app.config.from_object(config_class)
    if config_overrides:
        app.config.update(config_overrides)

    # Extensions (single instances live in app/extensions.py)
    from app.extensions import bcrypt, db, jwt, migrate

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    bcrypt.init_app(app)

    CORS(app, origins=app.config["CORS_ORIGINS"])

    # Import models so SQLAlchemy + Alembic register all tables.
    from app import models  # noqa: F401

    from app.routes.auth import bp as auth_bp
    from app.routes.dashboard import bp as dashboard_bp
    from app.routes.tasks import bp as tasks_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(tasks_bp)
    app.register_blueprint(dashboard_bp)

    @jwt.unauthorized_loader
    def _jwt_missing(reason):
        return jsonify(error=f"Login required ({reason})."), 401

    @jwt.invalid_token_loader
    def _jwt_invalid(reason):
        return jsonify(error=f"Session invalid ({reason}). Please log in again."), 401

    @jwt.expired_token_loader
    def _jwt_expired(_h, _p):
        return jsonify(error="Session expired. Please log in again."), 401

    @app.get("/api/health")
    def health():
        # Minimal liveness check for browsers, Amplify, and EC2 load checks.
        # Reports DB reachability WITHOUT leaking URIs, secrets, or paths.
        try:
            with app.app_context():
                db.session.execute(text("SELECT 1"))
            db_status = "up"
        except Exception:
            db_status = "down"
        return jsonify(status="ok", service="taskflow-backend", phase=9, db=db_status), 200

    @app.get("/")
    def index():
        return jsonify(
            message="TaskFlow Cloud API running. Try GET /api/health."
        ), 200

    # Consistent JSON errors (Phase 8 expands this into a central handler).
    @app.errorhandler(404)
    def not_found(_e):
        return jsonify(error="Not found"), 404

    @app.errorhandler(405)
    def method_not_allowed(_e):
        return jsonify(error="Method not allowed"), 405

    @app.errorhandler(500)
    def server_error(_e):
        # Never leak tracebacks/passwords/tokens in responses.
        return jsonify(error="Internal server error"), 500

    return app
