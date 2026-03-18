# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def create_container(client, name="Test Box"):
    r = client.post("/api/containers", json={"name": name})
    assert r.status_code == 201
    return r.json


def create_item(client, container_id, name="Hammer", quantity=1):
    r = client.post(f"/api/containers/{container_id}/items", json={"name": name, "quantity": quantity})
    assert r.status_code == 201
    return r.json


# ---------------------------------------------------------------------------
# Auth enforcement
# ---------------------------------------------------------------------------

def test_add_item_requires_auth(client):
    assert client.post("/api/containers/1/items", json={"name": "Hammer"}).status_code == 401

def test_update_item_requires_auth(client):
    assert client.put("/api/items/1", json={"name": "Hammer"}).status_code == 401

def test_delete_item_requires_auth(client):
    assert client.delete("/api/items/1").status_code == 401


# ---------------------------------------------------------------------------
# Add item
# ---------------------------------------------------------------------------

def test_add_item_success(auth_client):
    container = create_container(auth_client)
    r = auth_client.post(f"/api/containers/{container['id']}/items",
                         json={"name": "Hammer", "quantity": 3})
    assert r.status_code == 201
    assert r.json["name"] == "Hammer"
    assert r.json["quantity"] == 3
    assert r.json["container_id"] == container["id"]


def test_add_item_default_quantity_is_one(auth_client):
    container = create_container(auth_client)
    r = auth_client.post(f"/api/containers/{container['id']}/items", json={"name": "Screwdriver"})
    assert r.status_code == 201
    assert r.json["quantity"] == 1


def test_add_item_missing_name(auth_client):
    container = create_container(auth_client)
    r = auth_client.post(f"/api/containers/{container['id']}/items", json={"quantity": 2})
    assert r.status_code == 400


def test_add_item_blank_name(auth_client):
    container = create_container(auth_client)
    r = auth_client.post(f"/api/containers/{container['id']}/items", json={"name": "  "})
    assert r.status_code == 400


def test_add_item_to_nonexistent_container(auth_client):
    r = auth_client.post("/api/containers/99999/items", json={"name": "Hammer"})
    assert r.status_code == 404


def test_add_item_to_other_users_container(two_clients):
    client_a, client_b = two_clients
    container = create_container(client_a)
    r = client_b.post(f"/api/containers/{container['id']}/items", json={"name": "Hammer"})
    assert r.status_code == 404


def test_item_appears_in_container_detail(auth_client):
    container = create_container(auth_client)
    create_item(auth_client, container["id"], "Wrench")
    r = auth_client.get(f"/api/containers/{container['id']}")
    assert r.status_code == 200
    assert any(i["name"] == "Wrench" for i in r.json["items"])


# ---------------------------------------------------------------------------
# Update item
# ---------------------------------------------------------------------------

def test_update_item_name(auth_client):
    container = create_container(auth_client)
    item = create_item(auth_client, container["id"], "Hammer")
    r = auth_client.put(f"/api/items/{item['id']}", json={"name": "Mallet"})
    assert r.status_code == 200
    assert r.json["name"] == "Mallet"


def test_update_item_quantity(auth_client):
    container = create_container(auth_client)
    item = create_item(auth_client, container["id"], "Bolt", quantity=10)
    r = auth_client.put(f"/api/items/{item['id']}", json={"quantity": 25})
    assert r.status_code == 200
    assert r.json["quantity"] == 25


def test_update_item_blank_name(auth_client):
    container = create_container(auth_client)
    item = create_item(auth_client, container["id"])
    r = auth_client.put(f"/api/items/{item['id']}", json={"name": ""})
    assert r.status_code == 400


def test_update_other_users_item_returns_404(two_clients):
    client_a, client_b = two_clients
    container = create_container(client_a)
    item = create_item(client_a, container["id"])
    r = client_b.put(f"/api/items/{item['id']}", json={"name": "Hijacked"})
    assert r.status_code == 404


def test_update_nonexistent_item_returns_404(auth_client):
    assert auth_client.put("/api/items/99999", json={"name": "Ghost"}).status_code == 404


# ---------------------------------------------------------------------------
# Delete item
# ---------------------------------------------------------------------------

def test_delete_item_success(auth_client):
    container = create_container(auth_client)
    item = create_item(auth_client, container["id"])
    r = auth_client.delete(f"/api/items/{item['id']}")
    assert r.status_code == 204
    detail = auth_client.get(f"/api/containers/{container['id']}")
    assert not any(i["id"] == item["id"] for i in detail.json["items"])


def test_delete_other_users_item_returns_404(two_clients):
    client_a, client_b = two_clients
    container = create_container(client_a)
    item = create_item(client_a, container["id"])
    r = client_b.delete(f"/api/items/{item['id']}")
    assert r.status_code == 404
    # Item still exists for the owner
    detail = client_a.get(f"/api/containers/{container['id']}")
    assert any(i["id"] == item["id"] for i in detail.json["items"])


def test_delete_nonexistent_item_returns_404(auth_client):
    assert auth_client.delete("/api/items/99999").status_code == 404


# ---------------------------------------------------------------------------
# Cascade — deleting a container removes its items
# ---------------------------------------------------------------------------

def test_items_deleted_with_container(auth_client):
    container = create_container(auth_client)
    item = create_item(auth_client, container["id"])
    auth_client.delete(f"/api/containers/{container['id']}")
    # Item update should now 404 since the item is gone
    r = auth_client.put(f"/api/items/{item['id']}", json={"name": "Ghost"})
    assert r.status_code == 404
