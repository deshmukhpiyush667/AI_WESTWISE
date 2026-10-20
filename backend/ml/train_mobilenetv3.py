"""
AI WasteWise - MobileNetV3 Transfer Learning Training Script
Fine-tunes MobileNetV3 backbone on waste classification datasets (e.g. TrashNet).
Usage:
    python train_mobilenetv3.py --data_dir /path/to/dataset --epochs 20 --batch_size 32
"""

import argparse
import os
import json
import tensorflow as tf
from tensorflow.keras import layers, models
from tensorflow.keras.applications import MobileNetV3Small
from tensorflow.keras.callbacks import ModelCheckpoint, EarlyStopping, ReduceLROnPlateau

def build_transfer_model(num_classes: int):
    base_model = MobileNetV3Small(
        input_shape=(224, 224, 3),
        include_top=False,
        weights="imagenet",
        pooling="avg"
    )
    base_model.trainable = False

    inputs = tf.keras.Input(shape=(224, 224, 3))
    # Data augmentation block
    x = layers.RandomFlip("horizontal")(inputs)
    x = layers.RandomRotation(0.15)(x)
    x = layers.RandomZoom(0.1)(x)

    x = base_model(x, training=False)
    x = layers.Dense(128, activation="relu")(x)
    x = layers.BatchNormalization()(x)
    x = layers.Dropout(0.2)(x)
    outputs = layers.Dense(num_classes, activation="softmax")(x)

    model = models.Model(inputs=inputs, outputs=outputs, name="WasteWise_MobileNetV3")
    return model, base_model

def main():
    parser = argparse.ArgumentParser(description="Train MobileNetV3 for AI WasteWise")
    parser.add_argument("--data_dir", type=str, default="./data", help="Path to image dataset folder structured by class")
    parser.add_argument("--epochs", type=int, default=25, help="Number of training epochs")
    parser.add_argument("--batch_size", type=int, default=32, help="Batch size")
    parser.add_argument("--output_weights", type=str, default="weights/mobilenetv3_wastewise.keras", help="Path to save weights")
    args = parser.parse_args()

    labels_file = os.path.join(os.path.dirname(__file__), "labels.json")
    with open(labels_file, "r") as f:
        classes = json.load(f)
    print(f"Target classes ({len(classes)}): {classes}")

    if not os.path.exists(args.data_dir):
        print(f"Dataset directory '{args.data_dir}' not found. Please provide a dataset with subdirectories matching class names.")
        return

    train_ds = tf.keras.utils.image_dataset_from_directory(
        args.data_dir,
        validation_split=0.2,
        subset="training",
        seed=1337,
        image_size=(224, 224),
        batch_size=args.batch_size,
        label_mode="categorical",
        class_names=classes
    )

    val_ds = tf.keras.utils.image_dataset_from_directory(
        args.data_dir,
        validation_split=0.2,
        subset="validation",
        seed=1337,
        image_size=(224, 224),
        batch_size=args.batch_size,
        label_mode="categorical",
        class_names=classes
    )

    # Rescale inputs to [0, 1]
    rescale_layer = layers.Rescaling(1.0 / 255)
    train_ds = train_ds.map(lambda x, y: (rescale_layer(x), y)).prefetch(tf.data.AUTOTUNE)
    val_ds = val_ds.map(lambda x, y: (rescale_layer(x), y)).prefetch(tf.data.AUTOTUNE)

    model, base_model = build_transfer_model(len(classes))
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=1e-3),
        loss="categorical_crossentropy",
        metrics=["accuracy"]
    )
    model.summary()

    os.makedirs(os.path.dirname(args.output_weights), exist_ok=True)
    callbacks = [
        ModelCheckpoint(args.output_weights, save_best_only=True, monitor="val_accuracy", mode="max"),
        EarlyStopping(monitor="val_loss", patience=5, restore_best_weights=True),
        ReduceLROnPlateau(monitor="val_loss", factor=0.5, patience=3)
    ]

    print("\n--- Stage 1: Training Classification Head ---")
    model.fit(train_ds, validation_data=val_ds, epochs=args.epochs, callbacks=callbacks)

    print("\n--- Stage 2: Fine-Tuning Top Layers of MobileNetV3 ---")
    base_model.trainable = True
    # Unfreeze only the top 20 layers
    for layer in base_model.layers[:-20]:
        layer.trainable = False

    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=1e-4),
        loss="categorical_crossentropy",
        metrics=["accuracy"]
    )
    model.fit(train_ds, validation_data=val_ds, epochs=10, callbacks=callbacks)

    print(f"Training complete. Weights saved to: {args.output_weights}")

if __name__ == "__main__":
    main()
