import io
import os
import uuid
import numpy as np
from PIL import Image, ImageOps, UnidentifiedImageError
from typing import Tuple
from app.config import settings
from app.core.exceptions import ImageProcessingError

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
ALLOWED_FORMATS = {"JPEG", "PNG", "WEBP"}

def validate_and_process_image(file_bytes: bytes, original_filename: str) -> Tuple[np.ndarray, str]:
    """
    Validates uploaded raw bytes, converts to standardized RGB format,
    saves the image safely to UPLOAD_DIR, and returns numpy array (in [0, 255])
    for MobileNetV3 (which has its own internal rescaling layer).
    """
    if len(file_bytes) == 0:
        raise ImageProcessingError("Uploaded file is empty.")
    if len(file_bytes) > settings.MAX_UPLOAD_SIZE_BYTES:
        raise ImageProcessingError(f"File exceeds maximum allowed size of {settings.MAX_UPLOAD_SIZE_BYTES // (1024*1024)}MB.")

    try:
        image = Image.open(io.BytesIO(file_bytes))
        image.verify()
        image = Image.open(io.BytesIO(file_bytes))
    except (UnidentifiedImageError, OSError, SyntaxError):
        raise ImageProcessingError("File is corrupted or not a valid image.")

    if image.format not in ALLOWED_FORMATS:
        raise ImageProcessingError(f"Unsupported image format '{image.format}'. Allowed formats: JPEG, PNG, WEBP.")

    width, height = image.size
    if width < 32 or height < 32:
        raise ImageProcessingError("Image dimensions too small (minimum 32x32 pixels required).")

    try:
        image = ImageOps.exif_transpose(image)
    except Exception:
        pass

    if image.mode != "RGB":
        image = image.convert("RGB")

    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    extension = ".jpg"
    if original_filename:
        _, ext = os.path.splitext(original_filename.lower())
        if ext in ALLOWED_EXTENSIONS:
            extension = ext

    unique_filename = f"{uuid.uuid4().hex}{extension}"
    save_path = os.path.join(settings.UPLOAD_DIR, unique_filename)
    image.save(save_path, format="JPEG" if extension in [".jpg", ".jpeg"] else image.format or "JPEG", quality=90)

    target_size = (224, 224)
    resized_image = image.resize(target_size, Image.Resampling.LANCZOS)

    # Convert to NumPy array in [0, 255] float32 for MobileNetV3's native rescaling layer
    img_array = np.array(resized_image, dtype=np.float32)
    img_array = np.expand_dims(img_array, axis=0)

    return img_array, unique_filename
