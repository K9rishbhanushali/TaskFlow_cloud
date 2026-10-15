"""Phase 8 API tests: auth, tasks, dashboard, files, access control.

Covers the spec checklist: registration, login, invalid credentials,
duplicate email, task create/edit/delete/status, ownership isolation,
dashboard stats, file type/size validation, file ownership, unauthorized
access, and error shapes. Local SQLite + temp upload dir; S3 is mocked
by simply using STORAGE_BACKEND=local here.
"""
import io

import pytest

from app import create_app
from app.extensions import db


@pytest.fixture
def client(tmp_path):
    app = create_app(
        config_overrides={
            "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:",
            "TESTING": True,
            "LOCAL_UPLOAD_DIR": str(tmp_path / "uploads"),
            "JWT_SECRET_KEY": "test-secret-that-is-long-enough-for-hs256-123",
        }
    )
    with app.app_context():
        db.create_all()
    with app.test_client() as c:
        yield c


def register(client, name="Asha", email="asha@college.edu", password="secret12"):
    return client.post(
        "/api/auth/register", json={"name": name, "email": email, "password": password}
    )


def login(client, email="asha@college.edu", password="secret12"):
    return client.post("/api/auth/login", json={"email": email, "password": password})


def auth_h(token):
    return {"Authorization": f"Bearer {token}"}


def test_register_login_me(client):
    assert register(client).status_code == 201
    assert register(client).status_code == 409  # duplicate email
    assert login(client, password="wrong").status_code == 401  # invalid creds
    token = login(client).get_json()["access_token"]
    me = client.get("/api/auth/me", headers=auth_h(token))
    assert me.status_code == 200
    assert me.get_json()["user"]["email"] == "asha@college.edu"
    # unknown user cannot reach private endpoints
    assert client.get("/api/tasks").status_code == 401
    assert client.get("/api/dashboard/stats").status_code == 401
    assert client.get("/api/files").status_code == 401


def test_register_validation(client):
    assert register(client, name="A").status_code == 400
    assert register(client, email="not-an-email").status_code == 400
    assert register(client, password="123").status_code == 400


def test_task_crud_and_status(client):
    token = register(client).get_json()["access_token"]
    h = auth_h(token)

    assert client.post("/api/tasks", json={"title": "x"}, headers=h).status_code == 400
    bad = client.post(
        "/api/tasks", json={"title": "OK title", "priority": "Urgent"}, headers=h
    )
    assert bad.status_code == 400

    created = client.post(
        "/api/tasks",
        json={"title": "Study DBMS", "subject": "DBMS", "due_date": "2026-12-01"},
        headers=h,
    )
    assert created.status_code == 201
    tid = created.get_json()["task"]["id"]

    assert client.put(f"/api/tasks/{tid}", json={"title": "No"}, headers=h).status_code == 400
    edited = client.put(
        f"/api/tasks/{tid}",
        json={"title": "Study DBMS v2", "status": "In Progress"},
        headers=h,
    )
    assert edited.status_code == 200
    assert edited.get_json()["task"]["title"] == "Study DBMS v2"

    patched = client.patch(f"/api/tasks/{tid}/status", json={"status": "Completed"}, headers=h)
    assert patched.status_code == 200
    assert patched.get_json()["task"]["status"] == "Completed"

    assert client.patch(f"/api/tasks/{tid}/status", json={"status": "Done"}, headers=h).status_code == 400
    assert client.delete(f"/api/tasks/{tid}", headers=h).status_code == 200
    assert client.get(f"/api/tasks/{tid}", headers=h).status_code == 404


def test_task_ownership_isolation(client):
    t1 = register(client, email="one@e.com").get_json()["access_token"]
    t2 = register(client, email="two@e.com").get_json()["access_token"]
    tid = client.post("/api/tasks", json={"title": "Private task"}, headers=auth_h(t1)).get_json()["task"]["id"]
    # User 2 must see nothing of user 1 (404, not 403 — no existence leak).
    assert client.get(f"/api/tasks/{tid}", headers=auth_h(t2)).status_code == 404
    assert client.delete(f"/api/tasks/{tid}", headers=auth_h(t2)).status_code == 404
    assert client.get("/api/tasks", headers=auth_h(t2)).get_json()["total"] == 0


def test_dashboard_stats_match_rows(client):
    token = register(client).get_json()["access_token"]
    h = auth_h(token)
    client.post("/api/tasks", json={"title": "Task one", "status": "Pending"}, headers=h)
    client.post("/api/tasks", json={"title": "Task two", "status": "Completed"}, headers=h)
    stats = client.get("/api/dashboard/stats", headers=h).get_json()
    assert (stats["total"], stats["pending"], stats["completed"]) == (2, 1, 1)
    assert stats["completion"] == 50
    assert [b["name"] for b in stats["by_status"]] == ["Pending", "In Progress", "Completed"]


def test_file_validation_ownership_flow(client):
    token = register(client).get_json()["access_token"]
    h = auth_h(token)

    # Unsupported type
    bad = client.post(
        "/api/files/upload",
        data={"file": (io.BytesIO(b"evil"), "virus.exe")},
        headers=h,
        content_type="multipart/form-data",
    )
    assert bad.status_code == 400

    # Oversized (limit is 5 MB in test config default)
    big = client.post(
        "/api/files/upload",
        data={"file": (io.BytesIO(b"x" * (6 * 1024 * 1024)), "big.pdf")},
        headers=h,
        content_type="multipart/form-data",
    )
    assert big.status_code in (400, 413)

    up = client.post(
        "/api/files/upload",
        data={"file": (io.BytesIO(b"%PDF-1.4 notes"), "notes.pdf")},
        headers=h,
        content_type="multipart/form-data",
    )
    assert up.status_code == 201
    fid = up.get_json()["file"]["id"]

    other = register(client, email="other@e.com").get_json()["access_token"]
    assert client.get(f"/api/files/{fid}/download", headers=auth_h(other)).status_code == 404
    assert client.delete(f"/api/files/{fid}", headers=auth_h(other)).status_code == 404

    dl = client.get(f"/api/files/{fid}/download", headers=h)
    assert dl.status_code == 200
    assert client.delete(f"/api/files/{fid}", headers=h).status_code == 200
    assert client.get(f"/api/files/{fid}/download", headers=h).status_code == 404


def test_error_shapes_are_json(client):
    r = client.get("/api/tasks/1")  # no token
    assert r.status_code == 401 and "error" in r.get_json()
    r = client.get("/does-not-exist")
    assert r.status_code == 404 and "error" in r.get_json()
