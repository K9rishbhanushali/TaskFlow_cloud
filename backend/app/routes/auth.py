"""Auth blueprint: register, login, current user.

Token strategy (documented choice): the frontend stores the JWT access
token in localStorage and sends it as `Authorization: Bearer <token>`.
Simple for students to explain. Trade-off: XSS could read it, so a
production-hardened app would use HttpOnly cookies instead. Tokens expire
after JWT_EXPIRES_HOURS (default 24h); the frontend logs out on 401.
"""
from email.utils import parseaddr

from flask import Blueprint, jsonify, request
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required
from sqlalchemy.exc import IntegrityError

from app.extensions import db
from app.models import User

bp = Blueprint("auth", __name__, url_prefix="/api/auth")


def _valid_email(email):
    _, addr = parseaddr(str(email or ""))
    return "@" in addr and "." in addr.split("@")[-1]


@bp.post("/register")
def register():
    data = request.get_json(silent=True) or {}
    name = str(data.get("name", "")).strip()
    email = str(data.get("email", "")).strip().lower()
    password = str(data.get("password", ""))

    if len(name) < 2:
        return jsonify(error="Name needs at least 2 characters."), 400
    if not _valid_email(email):
        return jsonify(error="Enter a valid email address."), 400
    if len(password) < 6:
        return jsonify(error="Password must be at least 6 characters."), 400
    if User.query.filter_by(email=email).first():
        return jsonify(error="An account with this email already exists."), 409

    user = User(name=name, email=email)
    user.set_password(password)
    db.session.add(user)
    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify(error="An account with this email already exists."), 409

    token = create_access_token(identity=str(user.id))
    return jsonify(user=user.to_dict(), access_token=token), 201


@bp.post("/login")
def login():
    data = request.get_json(silent=True) or {}
    email = str(data.get("email", "")).strip().lower()
    password = str(data.get("password", ""))
    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        # Same message either way — never reveal which half was wrong.
        return jsonify(error="Invalid email or password."), 401
    token = create_access_token(identity=str(user.id))
    return jsonify(user=user.to_dict(), access_token=token), 200


def _current_user():
    return db.session.get(User, int(get_jwt_identity()))


@bp.get("/me")
@jwt_required()
def me():
    user = _current_user()
    if not user:
        return jsonify(error="User not found."), 404
    return jsonify(user=user.to_dict()), 200


@bp.patch("/me")
@jwt_required()
def update_me():
    user = _current_user()
    if not user:
        return jsonify(error="User not found."), 404
    data = request.get_json(silent=True) or {}
    if "name" in data:
        name = str(data["name"]).strip()
        if len(name) < 2:
            return jsonify(error="Name needs at least 2 characters."), 400
        user.name = name
    db.session.commit()
    return jsonify(user=user.to_dict()), 200
