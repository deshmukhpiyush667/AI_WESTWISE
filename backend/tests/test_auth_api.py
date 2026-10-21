import pytest
import uuid
from fastapi.testclient import TestClient
from app.main import app
from app.db.base import Base
from app.db.session import engine, SessionLocal
from app.db.init_db import init_db
from app.models.user import User

@pytest.fixture(scope="module")
def client():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    init_db(db)
    # Ensure test users are cleared for idempotent runs
    db.query(User).filter(User.email.like("%@test.wastewise.org")).delete()
    db.commit()
    db.close()
    with TestClient(app) as test_client:
        yield test_client

TEST_USER_EMAIL = f"ecouser_{uuid.uuid4().hex[:6]}@test.wastewise.org"

def test_user_registration(client):
    payload = {
        "email": TEST_USER_EMAIL,
        "password": "Password123!",
        "full_name": "Eco Explorer"
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == TEST_USER_EMAIL
    assert data["user"]["eco_points"] == 50

def test_duplicate_registration_rejection(client):
    payload = {
        "email": TEST_USER_EMAIL,
        "password": "Password123!",
        "full_name": "Eco Explorer Copy"
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 400
    assert "already exists" in response.json()["error"]["message"].lower()

def test_user_login_valid(client):
    payload = {
        "email": TEST_USER_EMAIL,
        "password": "Password123!"
    }
    response = client.post("/api/v1/auth/login", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_user_login_invalid_password(client):
    payload = {
        "email": TEST_USER_EMAIL,
        "password": "WrongPassword!"
    }
    response = client.post("/api/v1/auth/login", json=payload)
    assert response.status_code == 401

def test_protected_me_endpoint(client):
    # Log in
    login_res = client.post("/api/v1/auth/login", json={
        "email": TEST_USER_EMAIL,
        "password": "Password123!"
    })
    token = login_res.json()["access_token"]

    # Request /me
    response = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert response.json()["email"] == TEST_USER_EMAIL

def test_admin_permissions_guard(client):
    # Normal user token
    user_token = client.post("/api/v1/auth/login", json={
        "email": TEST_USER_EMAIL,
        "password": "Password123!"
    }).json()["access_token"]

    # Attempt admin endpoint with user token -> 403 Forbidden
    res_forbidden = client.get("/api/v1/admin/stats", headers={"Authorization": f"Bearer {user_token}"})
    assert res_forbidden.status_code == 403

    # Log in as default admin
    admin_token = client.post("/api/v1/auth/login", json={
        "email": "admin@wastewise.org",
        "password": "Admin@WasteWise2026!"
    }).json()["access_token"]

    # Admin access -> 200 OK
    res_ok = client.get("/api/v1/admin/stats", headers={"Authorization": f"Bearer {admin_token}"})
    assert res_ok.status_code == 200
    data = res_ok.json()
    assert "total_users" in data
    assert "model_version" in data

def test_recycling_centers_endpoint(client):
    response = client.get("/api/v1/centers?material=Plastic")
    assert response.status_code == 200
    centers = response.json()
    assert len(centers) > 0
    assert any("Plastic" in c["accepted_materials"] for c in centers)

def test_eco_challenges_endpoint(client):
    response = client.get("/api/v1/eco/challenges")
    assert response.status_code == 200
    challenges = response.json()
    assert len(challenges) > 0
    assert "points_reward" in challenges[0]
