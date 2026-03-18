from flask import Blueprint, jsonify, request
from models import Container, Item

search_bp = Blueprint("search", __name__)


@search_bp.get("/api/search")
def search():
    q = (request.args.get("q") or "").strip()
    if not q:
        return jsonify({"containers": [], "items": []})

    pattern = f"%{q}%"

    containers = Container.query.filter(Container.name.ilike(pattern)).order_by(Container.name).all()

    items = (
        Item.query
        .join(Item.container)
        .filter(Item.name.ilike(pattern))
        .order_by(Item.name)
        .all()
    )

    return jsonify({
        "containers": [c.to_dict() for c in containers],
        "items": [
            {**i.to_dict(), "container_name": i.container.name}
            for i in items
        ],
    })
