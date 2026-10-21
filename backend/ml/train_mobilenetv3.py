"""
AI WasteWise - MobileNetV3 Transfer Learning Training Script
Location: backend/ml/train_mobilenetv3.py

Features:
- MobileNetV3Small transfer learning with ImageNet backbone
- Direct [0, 255] input matching MobileNetV3's internal rescaling layer
- Trains on pre-split train/ and val/ sets
- Evaluates on independent test/ set
- Data augmentation applied only to training set
- Fixed random seed for reproducibility
- Model checkpointing to backend/ml/weights/mobilenetv3_wastewise.weights.h5
- Evaluation metrics export to backend/ml/training_metrics.json
"""

import argparse
import os
import json
import numpy as np
import tensorflow as tf
from tensorflow.keras import layers, models
from tensorflow.keras.applications import MobileNetV3Small
from tensorflow.keras.callbacks import ModelCheckpoint, EarlyStopping, ReduceLROnPlateau

BASE_ML_DIR = os.path.dirname(os.path.abspath(__file__))
DEFAULT_TRAIN_DIR = os.path.join(BASE_ML_DIR, "data", "train")
DEFAULT_VAL_DIR = os.path.join(BASE_ML_DIR, "data", "val")
DEFAULT_TEST_DIR = os.path.join(BASE_ML_DIR, "data", "test")
DEFAULT_WEIGHTS = os.path.join(BASE_ML_DIR, "weights", "mobilenetv3_wastewise.weights.h5")
LABELS_PATH = os.path.join(BASE_ML_DIR, "labels.json")
METRICS_PATH = os.path.join(BASE_ML_DIR, "training_metrics.json")

def set_seed(seed=42):
    tf.random.set_seed(seed)
    np.random.seed(seed)

def build_transfer_model(num_classes: int):
    """Constructs MobileNetV3Small transfer learning architecture."""
    # MobileNetV3 expects inputs in range [0, 255] because it has an internal Rescaling layer
    base_model = MobileNetV3Small(
        input_shape=(224, 224, 3),
        include_top=False,
        weights="imagenet",
        pooling="avg"
    )
    base_model.trainable = False

    inputs = tf.keras.Input(shape=(224, 224, 3))
    
    # Data augmentation active during training only
    x = layers.RandomFlip("horizontal")(inputs)
    x = layers.RandomRotation(0.10)(x)
    x = layers.RandomZoom(0.08)(x)

    x = base_model(x, training=False)
    x = layers.Dense(256, activation="relu")(x)
    x = layers.Dropout(0.3)(x)
    outputs = layers.Dense(num_classes, activation="softmax")(x)

    model = models.Model(inputs=inputs, outputs=outputs, name="WasteWise_MobileNetV3")
    return model, base_model

def load_dataset(data_dir, classes, batch_size=32, shuffle=True):
    """Loads image directory as tf.data.Dataset with pixel values in [0, 255]."""
    ds = tf.keras.utils.image_dataset_from_directory(
        data_dir,
        image_size=(224, 224),
        batch_size=batch_size,
        label_mode="categorical",
        class_names=classes,
        shuffle=shuffle,
        seed=42 if shuffle else None
    )
    return ds.prefetch(tf.data.AUTOTUNE)

def train_model(train_dir=DEFAULT_TRAIN_DIR, val_dir=DEFAULT_VAL_DIR, test_dir=DEFAULT_TEST_DIR,
                weights_path=DEFAULT_WEIGHTS, epochs_head=8, epochs_finetune=4, batch_size=32):
    set_seed(42)

    with open(LABELS_PATH, "r", encoding="utf-8") as f:
        classes = json.load(f)

    print("=" * 78)
    print("  AI WasteWise - MobileNetV3 Model Training Pipeline")
    print("=" * 78)
    print(f"Target Classes ({len(classes)}): {classes}")
    print(f"Train Directory: {train_dir}")
    print(f"Val Directory:   {val_dir}")
    print(f"Test Directory:  {test_dir}")
    print(f"Weights Output:  {weights_path}\n")

    if not os.path.exists(train_dir) or not os.path.exists(val_dir):
        print("[ERROR] Training or validation directories not found. Run prepare_dataset.py first.")
        return

    # Load datasets in native [0, 255] float32
    train_ds = load_dataset(train_dir, classes, batch_size=batch_size, shuffle=True)
    val_ds = load_dataset(val_dir, classes, batch_size=batch_size, shuffle=True)
    test_ds = load_dataset(test_dir, classes, batch_size=batch_size, shuffle=False) if os.path.exists(test_dir) else None

    model, base_model = build_transfer_model(len(classes))
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=1e-3),
        loss="categorical_crossentropy",
        metrics=["accuracy"]
    )

    os.makedirs(os.path.dirname(weights_path), exist_ok=True)
    callbacks = [
        ModelCheckpoint(weights_path, save_best_only=True, save_weights_only=True, monitor="val_accuracy", mode="max"),
        EarlyStopping(monitor="val_loss", patience=4, restore_best_weights=True),
        ReduceLROnPlateau(monitor="val_loss", factor=0.5, patience=2)
    ]

    print("\n--- Phase 1: Training Classification Head (Backbone Frozen) ---")
    history_head = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=epochs_head,
        callbacks=callbacks
    )

    print("\n--- Phase 2: Fine-Tuning Top Layers of MobileNetV3 ---")
    base_model.trainable = True
    # Freeze all except top 30 layers
    for layer in base_model.layers[:-30]:
        layer.trainable = False

    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=1e-4),
        loss="categorical_crossentropy",
        metrics=["accuracy"]
    )

    history_finetune = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=epochs_finetune,
        callbacks=callbacks
    )

    # Evaluate on independent Test Set
    test_metrics = {}
    if test_ds:
        print("\n--- Phase 3: Evaluating on Independent Unseen Test Set ---")
        test_loss, test_acc = model.evaluate(test_ds, verbose=1)
        print(f"\n>> Final Test Accuracy: {test_acc * 100:.2f}%")
        print(f">> Final Test Loss:     {test_loss:.4f}")
        test_metrics = {
            "test_accuracy": round(float(test_acc), 4),
            "test_loss": round(float(test_loss), 4)
        }

    # Save metrics manifest
    best_val_acc = max(history_head.history["val_accuracy"] + history_finetune.history["val_accuracy"])
    metrics_data = {
        "architecture": "MobileNetV3Small Transfer Learning",
        "classes": classes,
        "epochs_head": epochs_head,
        "epochs_finetune": epochs_finetune,
        "final_val_accuracy": round(float(best_val_acc), 4),
        "test_metrics": test_metrics,
        "weights_file": os.path.basename(weights_path)
    }

    with open(METRICS_PATH, "w", encoding="utf-8") as f:
        json.dump(metrics_data, f, indent=2)

    print(f"\n Weights saved to: {weights_path}")
    print(f" Metrics recorded in: {METRICS_PATH}")
    print("=" * 78)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train MobileNetV3 for AI WasteWise")
    parser.add_argument("--epochs_head", type=int, default=8, help="Epochs for classification head")
    parser.add_argument("--epochs_finetune", type=int, default=4, help="Epochs for fine-tuning")
    parser.add_argument("--batch_size", type=int, default=32, help="Batch size")
    args = parser.parse_args()

    train_model(epochs_head=args.epochs_head, epochs_finetune=args.epochs_finetune, batch_size=args.batch_size)
