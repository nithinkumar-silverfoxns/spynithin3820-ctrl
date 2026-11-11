"""Shared pytest fixtures. Uses an isolated SQLite DB and a fixed test key."""
import os
import sys

os.environ.setdefault("DATABASE_URL", "sqlite:///./test_pytest.db")
os.environ.setdefault("JWT_SECRET", "pytest-secret-not-for-production")
# Fixed Fernet key so encryption round-trips within the test process.
os.environ.setdefault("FERNET_KEY", "cH9mHglp7bYQ3nE6Vq2tZ1fY0wKxLp4sJ7uR8aB3cD0=")

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402


@pytest.fixture(scope="session", autouse=True)
def _clean_db():
    for f in ("test_pytest.db",):
        if os.path.exists(f):
            os.remove(f)
    yield
    for f in ("test_pytest.db",):
        if os.path.exists(f):
            os.remove(f)


@pytest.fixture()
def client():
    from app.main import app
    with TestClient(app) as c:
        yield c


def _register(client, email, password="supersecret1", name="User"):
    r = client.post("/api/v1/auth/register", json={"email": email, "password": password, "display_name": name})
    assert r.status_code in (201, 409), r.text
    if r.status_code == 409:
        r = client.post("/api/v1/auth/login", json={"email": email, "password": password})
    return r.json()["access_token"]


@pytest.fixture()
def auth(client):
    import uuid
    token = _register(client, f"user-{uuid.uuid4().hex[:8]}@example.com")
    return {"Authorization": f"Bearer {token}"}
