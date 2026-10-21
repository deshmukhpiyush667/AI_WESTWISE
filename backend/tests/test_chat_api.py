import pytest
import uuid
from fastapi.testclient import TestClient
from app.main import app
from app.db.base import Base
from app.db.session import engine, SessionLocal
from app.db.init_db import init_db
from app.models.classification import ClassificationRecord

@pytest.fixture(scope="module")
def client():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    init_db(db)
    # Seed a sample classification record for testing scan referencing
    test_record = ClassificationRecord(
        image_filename="test_sample_plastic.jpg",
        original_filename="sample_water_bottle.jpg",
        predicted_class="Plastic",
        confidence=0.965,
        is_uncertain=False,
        probabilities={"Plastic": 0.965, "Paper": 0.02},
        disposal_guidance={
            "label": "Plastic Waste",
            "bin_color": "Blue",
            "bin_hex": "#2563EB",
            "recyclable": True,
            "disposal_instructions": ["Rinse clean.", "Flatten bottle.", "Deposit in Blue Bin."]
        },
        model_version="1.0.0"
    )
    db.add(test_record)
    db.commit()
    test_record_id = test_record.id
    db.close()

    with TestClient(app) as test_client:
        test_client.test_scan_id = test_record_id
        yield test_client

def test_chat_status_endpoint(client):
    response = client.get("/api/v1/chat/status")
    assert response.status_code == 200
    data = response.json()
    assert "provider_configured" in data
    assert "model_name" in data
    assert "offline_mode" in data
    assert "setup_help" in data

def test_send_valid_chat_message(client):
    session_id = f"test-session-{uuid.uuid4().hex[:8]}"
    payload = {
        "message": "How do I recycle plastic bottles?",
        "session_id": session_id
    }
    response = client.post("/api/v1/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "response" in data
    assert len(data["response"]) > 20
    assert data["role"] == "assistant"
    assert "provider" in data
    assert data["session_id"] == session_id

def test_empty_message_validation(client):
    payload = {
        "message": "",
        "session_id": "test-session"
    }
    response = client.post("/api/v1/chat", json=payload)
    assert response.status_code == 422  # Pydantic validation error

def test_chat_history_retrieval_and_deletion(client):
    session_id = f"test-hist-{uuid.uuid4().hex[:8]}"
    
    # Send a message
    client.post("/api/v1/chat", json={
        "message": "What is biodegradable waste?",
        "session_id": session_id
    })

    # Retrieve history
    history_res = client.get(f"/api/v1/chat/history?session_id={session_id}")
    assert history_res.status_code == 200
    messages = history_res.json()
    assert len(messages) >= 2  # 1 user + 1 assistant
    assert messages[0]["role"] == "user"
    assert messages[1]["role"] == "assistant"

    # Delete history
    del_res = client.delete(f"/api/v1/chat/history?session_id={session_id}")
    assert del_res.status_code == 200
    assert del_res.json()["success"] is True

    # Verify cleared
    empty_res = client.get(f"/api/v1/chat/history?session_id={session_id}")
    assert len(empty_res.json()) == 0

def test_chat_with_referenced_scan_context(client):
    session_id = f"test-scan-{uuid.uuid4().hex[:8]}"
    payload = {
        "message": "Can you explain my last scan and what bin it belongs to?",
        "session_id": session_id,
        "recent_scan_id": client.test_scan_id
    }
    response = client.post("/api/v1/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "Plastic" in data["response"] or "Blue" in data["response"]
    assert data["referenced_scan"] is not None
    assert data["referenced_scan"]["predicted_class"] == "Plastic"
