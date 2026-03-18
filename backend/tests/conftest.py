import pytest
from app import create_app


@pytest.fixture
def app():
    """Fresh app with an in-memory database for each test."""
    application = create_app({
        "TESTING": True,
        "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:",
    })
    yield application


@pytest.fixture
def client(app):
    return app.test_client()


@pytest.fixture
def auth_client(client):
    """A test client already logged in as 'tester'."""
    client.post("/api/auth/register", json={"username": "tester", "password": "password123"})
    r = client.post("/api/auth/login", json={"username": "tester", "password": "password123"})
    client.environ_base["HTTP_AUTHORIZATION"] = f"Bearer {r.json['token']}"
    return client


@pytest.fixture
def two_clients(app):
    """Two separately authenticated clients sharing the same database.

    Use this to test ownership isolation — actions by client_b on
    resources owned by client_a should be rejected.
    """
    def _make(username):
        c = app.test_client()
        c.post("/api/auth/register", json={"username": username, "password": "password123"})
        r = c.post("/api/auth/login", json={"username": username, "password": "password123"})
        c.environ_base["HTTP_AUTHORIZATION"] = f"Bearer {r.json['token']}"
        return c

    return _make("user_a"), _make("user_b")
