"""Security-focused tests: tokens, confirmation integrity, isolation, encryption."""
import uuid


def _enable_memory(client, auth):
    r = client.patch("/api/v1/auth/consent", headers=auth, json={"memory_consent": True})
    assert r.status_code == 200


def test_invalid_access_token_rejected(client):
    r = client.get("/api/v1/auth/me", headers={"Authorization": "Bearer not.a.real.token"})
    assert r.status_code == 401


def test_no_token_rejected(client):
    r = client.get("/api/v1/auth/me")
    assert r.status_code in (401, 403)


def test_tampered_confirmation_token_not_authorized(client, auth):
    # First call -> needs_confirmation
    r = client.post("/api/v1/commands/execute", headers=auth, json={
        "name": "place_call", "params": {"recipient": "Mom"}, "granted_permissions": ["phone.call"]})
    assert r.json()["status"] == "needs_confirmation"

    # Tamper with the token -> must NOT be accepted (stays needs_confirmation)
    bad = r.json()["confirmation_token"] + "x"
    r2 = client.post("/api/v1/commands/execute", headers=auth, json={
        "name": "place_call", "params": {"recipient": "Mom"},
        "granted_permissions": ["phone.call"], "confirmation_token": bad})
    assert r2.json()["status"] == "needs_confirmation"


def test_confirmation_token_bound_to_params(client, auth):
    # Get a token for calling "Mom"...
    r = client.post("/api/v1/commands/execute", headers=auth, json={
        "name": "place_call", "params": {"recipient": "Mom"}, "granted_permissions": ["phone.call"]})
    token = r.json()["confirmation_token"]

    # ...then try to reuse it to call a DIFFERENT number -> rejected (fingerprint mismatch)
    r2 = client.post("/api/v1/commands/execute", headers=auth, json={
        "name": "place_call", "params": {"recipient": "911"},
        "granted_permissions": ["phone.call"], "confirmation_token": token})
    assert r2.json()["status"] == "needs_confirmation"


def test_missing_permission_denied(client, auth):
    r = client.post("/api/v1/commands/execute", headers=auth, json={
        "name": "read_contacts", "params": {"query": "x"}, "granted_permissions": []})
    body = r.json()
    assert body["status"] == "denied"
    assert "contacts.read" in body["missing_permissions"]


def test_cross_user_conversation_isolation(client):
    a = f"a-{uuid.uuid4().hex[:8]}@example.com"
    b = f"b-{uuid.uuid4().hex[:8]}@example.com"
    ta = client.post("/api/v1/auth/register", json={"email": a, "password": "supersecret1"}).json()["access_token"]
    tb = client.post("/api/v1/auth/register", json={"email": b, "password": "supersecret1"}).json()["access_token"]
    ha = {"Authorization": f"Bearer {ta}"}
    hb = {"Authorization": f"Bearer {tb}"}

    _enable_memory(client, ha)
    cid = client.post("/api/v1/conversations", headers=ha, json={"title": "A secret"}).json()["id"]

    # User B must not see or access user A's conversation.
    assert client.get(f"/api/v1/conversations/{cid}", headers=hb).status_code == 404
    assert client.delete(f"/api/v1/conversations/{cid}", headers=hb).status_code == 404
    # Owner can still delete their own.
    assert client.delete(f"/api/v1/conversations/{cid}", headers=ha).status_code == 200


def test_memory_requires_consent(client, auth):
    # Consent off by default -> cannot create a conversation.
    r = client.post("/api/v1/conversations", headers=auth, json={"title": "x"})
    assert r.status_code == 403


def test_messages_encrypted_at_rest(client, auth):
    _enable_memory(client, auth)
    cid = client.post("/api/v1/conversations", headers=auth, json={"title": "t"}).json()["id"]
    secret = "my very private message 12345"
    client.post(f"/api/v1/conversations/{cid}/messages", headers=auth, json={"role": "user", "content": secret})

    # The stored column must NOT contain the plaintext.
    from app.database.session import SessionLocal
    from app.models.conversation import Message
    db = SessionLocal()
    try:
        rows = db.query(Message).all()
        assert rows, "expected a stored message"
        assert all(secret not in row.content_encrypted for row in rows), "plaintext leaked to DB!"
    finally:
        db.close()

    # But the API decrypts it back correctly.
    detail = client.get(f"/api/v1/conversations/{cid}", headers=auth).json()
    assert any(m["content"] == secret for m in detail["messages"])
