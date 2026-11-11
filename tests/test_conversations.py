"""Conversation history CRUD."""


def _enable_memory(client, auth):
    client.patch("/api/v1/auth/consent", headers=auth, json={"memory_consent": True})


def test_conversation_lifecycle(client, auth):
    _enable_memory(client, auth)

    # Create
    c = client.post("/api/v1/conversations", headers=auth, json={"title": "Trip plan"}).json()
    cid = c["id"]
    assert c["title"] == "Trip plan" and c["message_count"] == 0

    # Append messages
    for role, content in [("user", "Book a flight"), ("assistant", "Sure, where to?")]:
        r = client.post(f"/api/v1/conversations/{cid}/messages", headers=auth,
                        json={"role": role, "content": content})
        assert r.status_code == 201

    # List shows the count
    lst = client.get("/api/v1/conversations", headers=auth).json()
    mine = [x for x in lst if x["id"] == cid][0]
    assert mine["message_count"] == 2

    # Detail returns decrypted messages in order
    detail = client.get(f"/api/v1/conversations/{cid}", headers=auth).json()
    assert [m["content"] for m in detail["messages"]] == ["Book a flight", "Sure, where to?"]

    # Delete
    assert client.delete(f"/api/v1/conversations/{cid}", headers=auth).status_code == 200
    assert client.get(f"/api/v1/conversations/{cid}", headers=auth).status_code == 404


def test_clear_all(client, auth):
    _enable_memory(client, auth)
    client.post("/api/v1/conversations", headers=auth, json={"title": "one"})
    client.post("/api/v1/conversations", headers=auth, json={"title": "two"})
    assert len(client.get("/api/v1/conversations", headers=auth).json()) >= 2
    assert client.delete("/api/v1/conversations", headers=auth).status_code == 200
    assert client.get("/api/v1/conversations", headers=auth).json() == []


def test_invalid_role_rejected(client, auth):
    _enable_memory(client, auth)
    cid = client.post("/api/v1/conversations", headers=auth, json={"title": "x"}).json()["id"]
    r = client.post(f"/api/v1/conversations/{cid}/messages", headers=auth,
                    json={"role": "hacker", "content": "x"})
    assert r.status_code == 422
