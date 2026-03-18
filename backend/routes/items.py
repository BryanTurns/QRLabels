from flask import Blueprint, jsonify, request, abort
from app import db
from models import Container, Item

items_bp = Blueprint("items", __name__)


@items_bp.post("/api/containers/<int:container_id>/items")
def add_item(container_id):
    Container.query.get_or_404(container_id)
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
def update_item(item_id):
    item = Item.query.get_or_404(item_id)
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
def delete_item(item_id):
    item = Item.query.get_or_404(item_id)
    db.session.delete(item)
    db.session.commit()
    return "", 204
