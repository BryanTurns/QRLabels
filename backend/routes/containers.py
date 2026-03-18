import io
import os
import uuid
import qrcode
from flask import Blueprint, jsonify, request, send_file, abort
from app import db
from models import Container

containers_bp = Blueprint("containers", __name__)


def _qr_response(url: str):
    img = qrcode.make(url)
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)
    return send_file(buf, mimetype="image/png")


@containers_bp.get("/api/containers")
def list_containers():
    containers = Container.query.order_by(Container.created_at.desc()).all()
    return jsonify([c.to_dict() for c in containers])


@containers_bp.post("/api/containers")
def create_container():
    data = request.get_json(force=True)
    name = (data.get("name") or "").strip()
    if not name:
        abort(400, "name is required")
    barcode_uuid = str(uuid.uuid4())
    container = Container(name=name, barcode_uuid=barcode_uuid)
    db.session.add(container)
    db.session.commit()
    return jsonify(container.to_dict()), 201


@containers_bp.get("/api/containers/scan/<barcode_uuid>")
def scan_container(barcode_uuid):
    container = Container.query.filter_by(barcode_uuid=barcode_uuid).first_or_404()
    return jsonify(container.to_dict(include_related=True))


@containers_bp.get("/api/containers/<int:container_id>")
def get_container(container_id):
    container = Container.query.get_or_404(container_id)
    return jsonify(container.to_dict(include_related=True))


@containers_bp.put("/api/containers/<int:container_id>")
def update_container(container_id):
    container = Container.query.get_or_404(container_id)
    data = request.get_json(force=True)
    name = (data.get("name") or "").strip()
    if not name:
        abort(400, "name is required")
    container.name = name
    db.session.commit()
    return jsonify(container.to_dict())


@containers_bp.delete("/api/containers/<int:container_id>")
def delete_container(container_id):
    container = Container.query.get_or_404(container_id)
    db.session.delete(container)
    db.session.commit()
    return "", 204


@containers_bp.get("/api/containers/<int:container_id>/barcode")
def get_barcode(container_id):
    container = Container.query.get_or_404(container_id)
    # Encode a full URL so the phone camera knows where to go
    base = request.host_url.rstrip("/")
    scan_url = f"{base}/scan/{container.barcode_uuid}"
    return _qr_response(scan_url)
