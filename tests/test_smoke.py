"""End-to-end smoke test of the backend (no external services needed).

Runs against the SQLite dev fallback. Exercises auth, the command catalog,
a low-risk command, and the high-risk confirmation round-trip.
"""
import os
import sys

# setdefault so this cooperates with conftest when run under pytest, and still
# works standalone (python tests/test_smoke.py).
os.environ.setdefault("DATABASE_URL", "sqlite:///./test_smoke.db")
os.environ.setdefault("JWT_SECRET", "test-secret-not-for-production")
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

from fastapi.testclient import TestClient  # noqa: E402

from app.main import app  # noqa: E402


def test_full_flow():
    # `with` triggers FastAPI lifespan (creates tables on the dev SQLite DB).
    with TestClient(app) as client:
        _run(client)


def _run(client):
    # Health
    r = client.get("/health")
    assert r.status_code == 200 and r.json()["status"] == "ok"

    # Register
    r = client.post("/api/v1/auth/register", json={
        "email": "nithin@example.com", "password": "supersecret1", "display_name": "Nithin"})
    assert r.status_code == 201, r.text
    access = r.json()["access_token"]
    auth = {"Authorization": f"Bearer {access}"}

    # Me
    r = client.get("/api/v1/auth/me", headers=auth)
    assert r.status_code == 200 and r.json()["email"] == "nithin@example.com"

    # Catalog
    r = client.get("/api/v1/commands/catalog")
    names = {c["name"] for c in r.json()}
    assert {"flashlight", "place_call"}.issubset(names)

    # Low-risk command -> authorized immediately
    r = client.post("/api/v1/commands/execute", headers=auth, json={
        "name": "flashlight", "params": {"on": True},
        "granted_permissions": ["camera.torch"]})
    body = r.json()
    assert body["status"] == "authorized", body
    assert body["directive"]["name"] == "flashlight"

    # High-risk command, first call -> needs_confirmation (+ token)
    r = client.post("/api/v1/commands/execute", headers=auth, json={
        "name": "place_call", "params": {"recipient": "Mom"},
        "granted_permissions": ["phone.call"]})
    body = r.json()
    assert body["status"] == "needs_confirmation", body
    token = body["confirmation_token"]
    assert token

    # High-risk command, confirmed -> authorized
    r = client.post("/api/v1/commands/execute", headers=auth, json={
        "name": "place_call", "params": {"recipient": "Mom"},
        "granted_permissions": ["phone.call"], "confirmation_token": token})
    body = r.json()
    assert body["status"] == "authorized", body

    # Missing permission -> denied
    r = client.post("/api/v1/commands/execute", headers=auth, json={
        "name": "launch_camera", "params": {}, "granted_permissions": []})
    assert r.json()["status"] == "denied"

    # OpenAI not configured -> clean 503, not a fake success
    r = client.post("/api/v1/ai/chat", headers=auth, json={"messages": [{"role": "user", "content": "hi"}]})
    assert r.status_code == 503

    print("ALL SMOKE CHECKS PASSED")


if __name__ == "__main__":
    with TestClient(app) as c:
        _run(c)
