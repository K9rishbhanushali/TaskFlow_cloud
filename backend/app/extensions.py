"""TaskFlow Cloud — shared Flask extensions (Phase 3).

All blueprints/models import db/jwt/bcrypt from here so there is
exactly one instance of each. Initialized in app/__init__.py via
init_app (the Flask application-factory pattern).
"""
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()
bcrypt = Bcrypt()
