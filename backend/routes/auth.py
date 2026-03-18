from datetime import datetime, timezone, timedelta
import jwt
from flask import Blueprint, jsonify, request, abort
from werkzeug.security import generate_password_hash, check_password_hash
from app import db
from auth_utils import JWT_SECRET, JWT_ALGORITHM
from models import User

auth_bp = Blueprint("auth", __name__)


@auth_bp.post("/api/auth/register")
def register():
    data = request.get_json(force=True)
    username = (data.get("username") or "").strip()
    password = (data.get("password") or "")
    if not username or not password:
        abort(400, "username and password are required")
    if len(password) < 8:
        abort(400, "password must be at least 8 characters")
    if User.query.filter_by(username=username).first():
        abort(409, "username already taken")
    user = User(username=username, password_hash=generate_password_hash(password, method="pbkdf2:sha256"))
    db.session.add(user)
    db.session.commit()
    return jsonify({"id": user.id, "username": user.username}), 201


@auth_bp.post("/api/auth/login")
def login():
    data = request.get_json(force=True)
    username = (data.get("username") or "").strip()
    password = (data.get("password") or "")
    user = User.query.filter_by(username=username).first()
    if not user or not check_password_hash(user.password_hash, password):
        abort(401, "invalid username or password")
    token = jwt.encode(
        {
            "user_id": user.id,
            "exp": datetime.now(timezone.utc) + timedelta(days=30),
        },
        JWT_SECRET,
        algorithm=JWT_ALGORITHM,
    )
    return jsonify({"token": token, "username": user.username})
