import io
import pytest
from PIL import Image
from app.services.image_processor import validate_and_process_image
from app.core.exceptions import ImageProcessingError

def create_dummy_image(format="JPEG", size=(100, 100), color=(20, 150, 80)):
    buf = io.BytesIO()
    img = Image.new("RGB", size, color=color)
    img.save(buf, format=format)
    return buf.getvalue()

def test_valid_jpeg_processing():
    img_bytes = create_dummy_image(format="JPEG", size=(120, 120))
    array, filename = validate_and_process_image(img_bytes, "test.jpg")
    assert array.shape == (1, 224, 224, 3)
    assert array.dtype.name == "float32"
    assert filename.endswith(".jpg")

def test_valid_png_with_alpha():
    buf = io.BytesIO()
    img = Image.new("RGBA", (80, 80), color=(255, 0, 0, 128))
    img.save(buf, format="PNG")
    array, filename = validate_and_process_image(buf.getvalue(), "transparent.png")
    assert array.shape == (1, 224, 224, 3)
    assert filename.endswith(".png")

def test_empty_file_rejection():
    with pytest.raises(ImageProcessingError, match="Uploaded file is empty"):
        validate_and_process_image(b"", "empty.jpg")

def test_corrupted_file_rejection():
    corrupted_bytes = b"NOT_A_REAL_IMAGE_DATA_12345"
    with pytest.raises(ImageProcessingError, match="File is corrupted or not a valid image"):
        validate_and_process_image(corrupted_bytes, "broken.jpg")

def test_too_small_dimensions_rejection():
    tiny_bytes = create_dummy_image(format="JPEG", size=(16, 16))
    with pytest.raises(ImageProcessingError, match="Image dimensions too small"):
        validate_and_process_image(tiny_bytes, "tiny.jpg")
