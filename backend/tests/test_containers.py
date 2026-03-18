# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def create_container(client, name="Test Box"):
    r = client.post("/api/containers", json={"name": name})
    assert r.status_code == 201
    return r.json


# ---------------------------------------------------------------------------
# Auth enforcement — every route must reject unauthenticated requests
# ---------------------------------------------------------------------------

def test_list_requires_auth(client):
    assert client.get("/api/containers").status_code == 401

def test_create_requires_auth(client):
    assert client.post("/api/containers", json={"name": "Box"}).status_code == 401

def test_get_requires_auth(client):
    assert client.get("/api/containers/1").status_code == 401

def test_update_requires_auth(client):
    assert client.put("/api/containers/1", json={"name": "Box"}).status_code == 401

def test_delete_requires_auth(client):
    assert client.delete("/api/containers/1").status_code == 401

def test_scan_requires_auth(client):
    assert client.get("/api/containers/scan/some-uuid").status_code == 401

def test_barcode_requires_auth(client):
    assert client.get("/api/containers/1/barcode").status_code == 401


# ---------------------------------------------------------------------------
# Create
# ---------------------------------------------------------------------------

def test_create_success(auth_client):
    r = auth_client.post("/api/containers", json={"name": "Garage Box"})
    assert r.status_code == 201
    assert r.json["name"] == "Garage Box"
    assert "barcode_uuid" in r.json
    assert "id" in r.json


def test_create_generates_unique_barcodes(auth_client):
    a = create_container(auth_client, "Box A")
    b = create_container(auth_client, "Box B")
    assert a["barcode_uuid"] != b["barcode_uuid"]


def test_create_missing_name(auth_client):
    assert auth_client.post("/api/containers", json={}).status_code == 400


def test_create_blank_name(auth_client):
    assert auth_client.post("/api/containers", json={"name": "   "}).status_code == 400


# ---------------------------------------------------------------------------
# List
# ---------------------------------------------------------------------------

def test_list_empty_initially(auth_client):
    r = auth_client.get("/api/containers")
    assert r.status_code == 200
    assert r.json == []


def test_list_returns_own_containers(auth_client):
    create_container(auth_client, "Box A")
    create_container(auth_client, "Box B")
    r = auth_client.get("/api/containers")
    assert r.status_code == 200
    assert len(r.json) == 2


def test_list_excludes_other_users_containers(two_clients):
    client_a, client_b = two_clients
    create_container(client_a, "A's Box")
    r = client_b.get("/api/containers")
    assert r.json == []


# ---------------------------------------------------------------------------
# Get
# ---------------------------------------------------------------------------

def test_get_success(auth_client):
    container = create_container(auth_client)
    r = auth_client.get(f"/api/containers/{container['id']}")
    assert r.status_code == 200
    assert r.json["id"] == container["id"]
    assert "items" in r.json
    assert "photos" in r.json


def test_get_other_users_container_returns_404(two_clients):
    client_a, client_b = two_clients
    container = create_container(client_a)
    r = client_b.get(f"/api/containers/{container['id']}")
    assert r.status_code == 404


def test_get_nonexistent_returns_404(auth_client):
    assert auth_client.get("/api/containers/99999").status_code == 404


# ---------------------------------------------------------------------------
# Update
# ---------------------------------------------------------------------------

def test_update_success(auth_client):
    container = create_container(auth_client, "Old Name")
    r = auth_client.put(f"/api/containers/{container['id']}", json={"name": "New Name"})
    assert r.status_code == 200
    assert r.json["name"] == "New Name"


def test_update_blank_name(auth_client):
    container = create_container(auth_client)
    r = auth_client.put(f"/api/containers/{container['id']}", json={"name": ""})
    assert r.status_code == 400


def test_update_other_users_container_returns_404(two_clients):
    client_a, client_b = two_clients
    container = create_container(client_a)
    r = client_b.put(f"/api/containers/{container['id']}", json={"name": "Hijacked"})
    assert r.status_code == 404


# ---------------------------------------------------------------------------
# Delete
# ---------------------------------------------------------------------------

def test_delete_success(auth_client):
    container = create_container(auth_client)
    r = auth_client.delete(f"/api/containers/{container['id']}")
    assert r.status_code == 204
    assert auth_client.get(f"/api/containers/{container['id']}").status_code == 404


def test_delete_other_users_container_returns_404(two_clients):
    client_a, client_b = two_clients
    container = create_container(client_a)
    r = client_b.delete(f"/api/containers/{container['id']}")
    assert r.status_code == 404
    # Container still exists for the owner
    assert client_a.get(f"/api/containers/{container['id']}").status_code == 200


# ---------------------------------------------------------------------------
# Scan by UUID
# ---------------------------------------------------------------------------

def test_scan_success(auth_client):
    container = create_container(auth_client)
    uuid = container["barcode_uuid"]
    r = auth_client.get(f"/api/containers/scan/{uuid}")
    assert r.status_code == 200
    assert r.json["barcode_uuid"] == uuid


def test_scan_other_users_uuid_returns_404(two_clients):
    client_a, client_b = two_clients
    container = create_container(client_a)
    uuid = container["barcode_uuid"]
    r = client_b.get(f"/api/containers/scan/{uuid}")
    assert r.status_code == 404


def test_scan_unknown_uuid_returns_404(auth_client):
    assert auth_client.get("/api/containers/scan/not-a-real-uuid").status_code == 404


# ---------------------------------------------------------------------------
# Barcode image
# ---------------------------------------------------------------------------

def test_barcode_returns_png(auth_client):
    container = create_container(auth_client)
    r = auth_client.get(f"/api/containers/{container['id']}/barcode")
    assert r.status_code == 200
    assert r.content_type == "image/png"


def test_barcode_for_other_users_container_returns_404(two_clients):
    client_a, client_b = two_clients
    container = create_container(client_a)
    r = client_b.get(f"/api/containers/{container['id']}/barcode")
    assert r.status_code == 404
