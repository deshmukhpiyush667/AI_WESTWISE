import io
import pytest
from fastapi.testclient import TestClient
from PIL import Image
from app.main import app
from app.db.base import Base
from app.db.session import engine

@pytest.fixture(scope="module")
def client():
    Base.metadata.create_all(bind=engine)
    with TestClient(app) as test_client:
        yield test_client

def create_test_image_bytes():
    buf = io.BytesIO()
    img = Image.new("RGB", (150, 150), color=(50, 180, 100))
    img.save(buf, format="JPEG")
    buf.seek(0)
    return buf

def test_health_endpoint(client):
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert "healthy" in data["database"]

def test_categories_endpoint(client):
    response = client.get("/api/v1/categories")
    assert response.status_code == 200
    data = response.json()
    assert "categories" in data
    assert "Organic" in data["categories"]
    assert "Plastic" in data["categories"]
    assert "E-Waste" in data["categories"]

def test_classify_valid_image(client):
    img_buf = create_test_image_bytes()
    response = client.post(
        "/api/v1/classify",
        files={"file": ("waste_bottle.jpg", img_buf, "image/jpeg")}
    )
    assert response.status_code == 200
    data = response.json()
    assert "id" in data
    assert "predicted_class" in data
    assert "confidence" in data
    assert "disposal_guidance" in data
    assert "probabilities" in data
    assert isinstance(data["confidence"], float)

def test_classify_invalid_corrupted_file(client):
    bad_buf = io.BytesIO(b"totally_not_an_image")
    response = client.post(
        "/api/v1/classify",
        files={"file": ("fake.jpg", bad_buf, "image/jpeg")}
    )
    assert response.status_code == 400
    data = response.json()
    assert data["success"] is False
    assert "corrupted" in data["error"]["message"].lower()

def test_history_endpoint(client):
    response = client.get("/api/v1/history?page=1&page_size=5")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "total" in data
    assert "total_pages" in data

def test_stats_endpoint(client):
    response = client.get("/api/v1/stats")
    assert response.status_code == 200
    data = response.json()
    assert "total_classifications" in data
    assert "category_distribution" in data
    assert "recent_activity_trend" in data
