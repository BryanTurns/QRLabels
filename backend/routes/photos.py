import os
import uuid
from flask import Blueprint, jsonify, request, send_file, abort, g
from werkzeug.utils import secure_filename
from app import db, UPLOADS_DIR
from auth_utils import require_auth
from models import Container, Item, Photo, ItemPhoto

photos_bp = Blueprint("photos", __name__)

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "webp"}


def _allowed(filename: str) -> bool:
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def _save_upload(file) -> str:
    ext = secure_filename(file.filename).rsplit(".", 1)[1].lower()
    filename = f"{uuid.uuid4()}.{ext}"
    file.save(os.path.join(UPLOADS_DIR, filename))
    return filename


@photos_bp.post("/api/containers/<int:container_id>/photos")
@require_auth
def upload_photo(container_id):
    Container.query.filter_by(id=container_id, user_id=g.user_id).first_or_404()
    if "photo" not in request.files:
        abort(400, "photo file is required")
    file = request.files["photo"]
    if not file.filename or not _allowed(file.filename):
        abort(400, "unsupported file type")
    photo = Photo(container_id=container_id, filename=_save_upload(file))
    db.session.add(photo)
    db.session.commit()
    return jsonify(photo.to_dict()), 201


@photos_bp.delete("/api/photos/<int:photo_id>")
@require_auth
def delete_photo(photo_id):
    photo = (
        Photo.query.join(Photo.container)
        .filter(Photo.id == photo_id, Container.user_id == g.user_id)
        .first_or_404()
    )
    filepath = os.path.join(UPLOADS_DIR, photo.filename)
    if os.path.exists(filepath):
        os.remove(filepath)
    db.session.delete(photo)
    db.session.commit()
    return "", 204


@photos_bp.post("/api/items/<int:item_id>/photos")
@require_auth
def upload_item_photo(item_id):
    Item.query.join(Item.container).filter(
        Item.id == item_id, Container.user_id == g.user_id
    ).first_or_404()
    if "photo" not in request.files:
        abort(400, "photo file is required")
    file = request.files["photo"]
    if not file.filename or not _allowed(file.filename):
        abort(400, "unsupported file type")
    photo = ItemPhoto(item_id=item_id, filename=_save_upload(file))
    db.session.add(photo)
    db.session.commit()
    return jsonify(photo.to_dict()), 201


@photos_bp.delete("/api/item-photos/<int:photo_id>")
@require_auth
def delete_item_photo(photo_id):
    photo = (
        ItemPhoto.query.join(ItemPhoto.item).join(Item.container)
        .filter(ItemPhoto.id == photo_id, Container.user_id == g.user_id)
        .first_or_404()
    )
    filepath = os.path.join(UPLOADS_DIR, photo.filename)
    if os.path.exists(filepath):
        os.remove(filepath)
    db.session.delete(photo)
    db.session.commit()
    return "", 204


@photos_bp.get("/api/photos/<filename>")
@require_auth
def serve_photo(filename):
    filepath = os.path.join(UPLOADS_DIR, secure_filename(filename))
    if not os.path.exists(filepath):
        abort(404)
    return send_file(filepath)
