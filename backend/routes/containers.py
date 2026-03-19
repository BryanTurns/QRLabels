import io
import os
import uuid
import qrcode
from flask import Blueprint, jsonify, request, send_file, abort, g
from app import db
from auth_utils import require_auth
from models import Container

containers_bp = Blueprint("containers", __name__)

BASE_PATH = os.environ.get("APP_BASE_PATH", "")


def _qr_response(url: str):
    img = qrcode.make(url)
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)
    return send_file(buf, mimetype="image/png")


@containers_bp.get("/api/containers")
@require_auth
def list_containers():
    containers = (
        Container.query
        .filter_by(user_id=g.user_id)
        .order_by(Container.created_at.desc())
        .all()
    )
    return jsonify([c.to_dict() for c in containers])


@containers_bp.post("/api/containers")
@require_auth
def create_container():
    data = request.get_json(force=True)
    name = (data.get("name") or "").strip()
    if not name:
        abort(400, "name is required")
    barcode_uuid = str(uuid.uuid4())
    container = Container(name=name, barcode_uuid=barcode_uuid, user_id=g.user_id)
    db.session.add(container)
    db.session.commit()
    return jsonify(container.to_dict()), 201


@containers_bp.get("/api/containers/scan/<barcode_uuid>")
@require_auth
def scan_container(barcode_uuid):
    container = (
        Container.query
        .filter_by(barcode_uuid=barcode_uuid, user_id=g.user_id)
        .first_or_404()
    )
    return jsonify(container.to_dict(include_related=True))


@containers_bp.get("/api/containers/<int:container_id>")
@require_auth
def get_container(container_id):
    container = Container.query.filter_by(id=container_id, user_id=g.user_id).first_or_404()
    return jsonify(container.to_dict(include_related=True))


@containers_bp.put("/api/containers/<int:container_id>")
@require_auth
def update_container(container_id):
    container = Container.query.filter_by(id=container_id, user_id=g.user_id).first_or_404()
    data = request.get_json(force=True)
    name = (data.get("name") or "").strip()
    if not name:
        abort(400, "name is required")
    container.name = name
    db.session.commit()
    return jsonify(container.to_dict())


@containers_bp.delete("/api/containers/<int:container_id>")
@require_auth
def delete_container(container_id):
    container = Container.query.filter_by(id=container_id, user_id=g.user_id).first_or_404()
    db.session.delete(container)
    db.session.commit()
    return "", 204


@containers_bp.get("/api/containers/<int:container_id>/barcode")
@require_auth
def get_barcode(container_id):
    container = Container.query.filter_by(id=container_id, user_id=g.user_id).first_or_404()
    base = request.host_url.rstrip("/")
    scan_url = f"{base}{BASE_PATH}/scan/{container.barcode_uuid}"
    return _qr_response(scan_url)
