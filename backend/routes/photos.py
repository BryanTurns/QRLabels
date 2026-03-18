import os
import uuid
from flask import Blueprint, jsonify, request, send_file, abort
from werkzeug.utils import secure_filename
from app import db, UPLOADS_DIR
from models import Container, Item, Photo, ItemPhoto

photos_bp = Blueprint("photos", __name__)

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "webp"}


def _allowed(filename: str) -> bool:
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


@photos_bp.post("/api/containers/<int:container_id>/photos")
def upload_photo(container_id):
    Container.query.get_or_404(container_id)
    if "photo" not in request.files:
        abort(400, "photo file is required")
    file = request.files["photo"]
    if not file.filename or not _allowed(file.filename):
        abort(400, "unsupported file type")
    ext = secure_filename(file.filename).rsplit(".", 1)[1].lower()
    filename = f"{uuid.uuid4()}.{ext}"
    file.save(os.path.join(UPLOADS_DIR, filename))
    photo = Photo(container_id=container_id, filename=filename)
    db.session.add(photo)
    db.session.commit()
    return jsonify(photo.to_dict()), 201


@photos_bp.delete("/api/photos/<int:photo_id>")
def delete_photo(photo_id):
    photo = Photo.query.get_or_404(photo_id)
    filepath = os.path.join(UPLOADS_DIR, photo.filename)
    if os.path.exists(filepath):
        os.remove(filepath)
    db.session.delete(photo)
    db.session.commit()
    return "", 204


@photos_bp.post("/api/items/<int:item_id>/photos")
def upload_item_photo(item_id):
    Item.query.get_or_404(item_id)
    if "photo" not in request.files:
        abort(400, "photo file is required")
    file = request.files["photo"]
    if not file.filename or not _allowed(file.filename):
        abort(400, "unsupported file type")
    ext = secure_filename(file.filename).rsplit(".", 1)[1].lower()
    filename = f"{uuid.uuid4()}.{ext}"
    file.save(os.path.join(UPLOADS_DIR, filename))
    photo = ItemPhoto(item_id=item_id, filename=filename)
    db.session.add(photo)
    db.session.commit()
    return jsonify(photo.to_dict()), 201


@photos_bp.delete("/api/item-photos/<int:photo_id>")
def delete_item_photo(photo_id):
    photo = ItemPhoto.query.get_or_404(photo_id)
    filepath = os.path.join(UPLOADS_DIR, photo.filename)
    if os.path.exists(filepath):
        os.remove(filepath)
    db.session.delete(photo)
    db.session.commit()
    return "", 204


@photos_bp.get("/api/photos/<filename>")
def serve_photo(filename):
    filepath = os.path.join(UPLOADS_DIR, secure_filename(filename))
    if not os.path.exists(filepath):
        abort(404)
    return send_file(filepath)
