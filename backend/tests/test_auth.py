import jwt
from auth_utils import JWT_SECRET, JWT_ALGORITHM


# ---------------------------------------------------------------------------
# Registration
# ---------------------------------------------------------------------------

def test_register_success(client):
    r = client.post("/api/auth/register", json={"username": "alice", "password": "password123"})
    assert r.status_code == 201
    assert r.json["username"] == "alice"
    assert "id" in r.json


def test_register_returns_no_password_hash(client):
    r = client.post("/api/auth/register", json={"username": "alice", "password": "password123"})
    assert "password_hash" not in r.json
    assert "password" not in r.json


def test_register_missing_username(client):
    r = client.post("/api/auth/register", json={"password": "password123"})
    assert r.status_code == 400


def test_register_missing_password(client):
    r = client.post("/api/auth/register", json={"username": "alice"})
    assert r.status_code == 400


def test_register_short_password(client):
    r = client.post("/api/auth/register", json={"username": "alice", "password": "short"})
    assert r.status_code == 400


def test_register_duplicate_username(client):
    client.post("/api/auth/register", json={"username": "alice", "password": "password123"})
    r = client.post("/api/auth/register", json={"username": "alice", "password": "different123"})
    assert r.status_code == 409


def test_register_duplicate_username_case_sensitive(client):
    """'Alice' and 'alice' are treated as distinct users."""
    client.post("/api/auth/register", json={"username": "alice", "password": "password123"})
    r = client.post("/api/auth/register", json={"username": "Alice", "password": "password123"})
    assert r.status_code == 201


# ---------------------------------------------------------------------------
# Login
# ---------------------------------------------------------------------------

def test_login_success(client):
    client.post("/api/auth/register", json={"username": "alice", "password": "password123"})
    r = client.post("/api/auth/login", json={"username": "alice", "password": "password123"})
    assert r.status_code == 200
    assert "token" in r.json
    assert r.json["username"] == "alice"


def test_login_wrong_password(client):
    client.post("/api/auth/register", json={"username": "alice", "password": "password123"})
    r = client.post("/api/auth/login", json={"username": "alice", "password": "wrongpassword"})
    assert r.status_code == 401


def test_login_unknown_user(client):
    r = client.post("/api/auth/login", json={"username": "nobody", "password": "password123"})
    assert r.status_code == 401


def test_login_empty_body(client):
    r = client.post("/api/auth/login", json={})
    assert r.status_code == 401


def test_login_wrong_and_unknown_return_same_status(client):
    """Both cases return 401 — don't reveal whether a username exists."""
    client.post("/api/auth/register", json={"username": "alice", "password": "password123"})
    wrong_pw = client.post("/api/auth/login", json={"username": "alice", "password": "wrong"})
    unknown = client.post("/api/auth/login", json={"username": "nobody", "password": "password123"})
    assert wrong_pw.status_code == unknown.status_code == 401


# ---------------------------------------------------------------------------
# Token validity
# ---------------------------------------------------------------------------

def test_token_is_valid_jwt(client):
    client.post("/api/auth/register", json={"username": "alice", "password": "password123"})
    r = client.post("/api/auth/login", json={"username": "alice", "password": "password123"})
    token = r.json["token"]
    payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    assert "user_id" in payload
    assert "exp" in payload


def test_token_grants_access_to_protected_route(client):
    client.post("/api/auth/register", json={"username": "alice", "password": "password123"})
    r = client.post("/api/auth/login", json={"username": "alice", "password": "password123"})
    token = r.json["token"]
    r = client.get("/api/containers", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 200


def test_missing_token_rejected(client):
    r = client.get("/api/containers")
    assert r.status_code == 401


def test_invalid_token_rejected(client):
    r = client.get("/api/containers", headers={"Authorization": "Bearer not-a-real-token"})
    assert r.status_code == 401


def test_malformed_auth_header_rejected(client):
    r = client.get("/api/containers", headers={"Authorization": "Basic dXNlcjpwYXNz"})
    assert r.status_code == 401
