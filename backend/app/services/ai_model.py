import os
import json
import logging
import numpy as np
from typing import Dict, Any, Tuple
from app.config import settings
from app.core.guidance import get_disposal_guidance, UNCERTAIN_GUIDANCE
from app.core.exceptions import ModelInferenceError

logger = logging.getLogger(__name__)

# Default waste classification categories
DEFAULT_CLASSES = [
    "Organic",
    "Plastic",
    "Paper",
    "Metal",
    "Glass",
    "E-Waste"
]

class WasteClassifier:
    _instance = None
    _model = None
    _classes = DEFAULT_CLASSES

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def __init__(self):
        self._load_labels()
        self._initialize_model()

    def _load_labels(self):
        labels_path = os.path.join(
            os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
            "ml", "labels.json"
        )
        if os.path.exists(labels_path):
            try:
                with open(labels_path, "r", encoding="utf-8") as f:
                    self._classes = json.load(f)
            except Exception as e:
                logger.warning(f"Could not load labels.json, falling back to default: {e}")
                self._classes = DEFAULT_CLASSES

    def _build_architecture(self):
        """Constructs MobileNetV3 transfer learning architecture."""
        import tensorflow as tf
        from tensorflow.keras import layers, models
        from tensorflow.keras.applications import MobileNetV3Small

        base_model = MobileNetV3Small(
            input_shape=(224, 224, 3),
            include_top=False,
            weights="imagenet",
            pooling="avg"
        )
        base_model.trainable = False  # Freeze pretrained feature extraction backbone

        inputs = tf.keras.Input(shape=(224, 224, 3))
        x = base_model(inputs, training=False)
        x = layers.Dense(128, activation="relu")(x)
        x = layers.BatchNormalization()(x)
        x = layers.Dropout(0.2)(x)
        outputs = layers.Dense(len(self._classes), activation="softmax")(x)

        model = models.Model(inputs=inputs, outputs=outputs, name="WasteWise_MobileNetV3")
        model.compile(
            optimizer="adam",
            loss="categorical_crossentropy",
            metrics=["accuracy"]
        )
        return model

    def _initialize_model(self):
        """Loads weights if available, otherwise builds and saves initialized transfer-learning model."""
        import tensorflow as tf
        
        # Suppress verbose TF logs
        os.environ["TF_CPP_MIN_LOG_LEVEL"] = "2"
        
        weights_path = settings.MODEL_WEIGHTS_PATH
        os.makedirs(os.path.dirname(weights_path), exist_ok=True)

        try:
            self._model = self._build_architecture()
            if os.path.exists(weights_path):
                logger.info(f"Loading custom weights from {weights_path}...")
                self._model.load_weights(weights_path)
            else:
                logger.info("Initializing baseline MobileNetV3 transfer learning weights...")
                self._model.save_weights(weights_path)
            logger.info("MobileNetV3 Waste Classifier ready.")
        except Exception as e:
            logger.error(f"Failed to load or build model: {e}")
            raise ModelInferenceError(f"AI Model initialization failed: {str(e)}")

    def predict(self, img_array: np.ndarray) -> Dict[str, Any]:
        """
        Executes inference on preprocessed numpy image array of shape (1, 224, 224, 3).
        Returns predicted class, confidence, uncertainty flag, class distribution, and disposal guidance.
        """
        if self._model is None:
            self._initialize_model()

        try:
            raw_predictions = self._model.predict(img_array, verbose=0)
            probabilities = raw_predictions[0].tolist()

            # Map probabilities to classes
            prob_dict = {
                self._classes[i]: round(float(probabilities[i]), 4)
                for i in range(len(self._classes))
            }

            top_idx = int(np.argmax(probabilities))
            top_class = self._classes[top_idx]
            top_confidence = round(float(probabilities[top_idx]), 4)

            # Check uncertainty threshold
            is_uncertain = bool(top_confidence < settings.CONFIDENCE_THRESHOLD)

            if is_uncertain:
                guidance = UNCERTAIN_GUIDANCE
            else:
                guidance = get_disposal_guidance(top_class)

            return {
                "predicted_class": top_class,
                "confidence": top_confidence,
                "is_uncertain": is_uncertain,
                "probabilities": prob_dict,
                "disposal_guidance": guidance
            }
        except Exception as e:
            logger.error(f"Prediction inference error: {e}")
            raise ModelInferenceError(f"Prediction inference failed: {str(e)}")

def get_classifier() -> WasteClassifier:
    return WasteClassifier.get_instance()
