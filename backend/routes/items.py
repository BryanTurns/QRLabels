from flask import Blueprint, jsonify, request, abort, g
from app import db
from auth_utils import require_auth
from models import Container, Item

items_bp = Blueprint("items", __name__)


@items_bp.post("/api/containers/<int:container_id>/items")
@require_auth
def add_item(container_id):
    Container.query.filter_by(id=container_id, user_id=g.user_id).first_or_404()  # raises 404 if container doesn't exist or doesn't belong to user
    data = request.get_json(force=True)
    name = (data.get("name") or "").strip()
    if not name:
        abort(400, "name is required")
    quantity = int(data.get("quantity", 1))
    item = Item(container_id=container_id, name=name, quantity=quantity)
    db.session.add(item)
    db.session.commit()
    return jsonify(item.to_dict()), 201


@items_bp.put("/api/items/<int:item_id>")
@require_auth
def update_item(item_id):
    item = (
        Item.query.join(Item.container)
        .filter(Item.id == item_id, Container.user_id == g.user_id)
        .first_or_404()
    )
    data = request.get_json(force=True)
    if "name" in data:
        name = (data["name"] or "").strip()
        if not name:
            abort(400, "name is required")
        item.name = name
    if "quantity" in data:
        item.quantity = int(data["quantity"])
    db.session.commit()
    return jsonify(item.to_dict())


@items_bp.delete("/api/items/<int:item_id>")
@require_auth
def delete_item(item_id):
    item = (
        Item.query.join(Item.container)
        .filter(Item.id == item_id, Container.user_id == g.user_id)
        .first_or_404()
    )
    db.session.delete(item)
    db.session.commit()
    return "", 204
