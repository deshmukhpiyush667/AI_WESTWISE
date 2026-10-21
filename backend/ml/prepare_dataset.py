"""
AI WasteWise - Dataset Preparation & Stratified Splitter
Location: backend/ml/prepare_dataset.py

Takes the verified MWCD raw dataset, maps raw folders to project classes:
  - organic   -> Organic
  - plastic   -> Plastic
  - paper + cardboard -> Paper
  - metal     -> Metal
  - glass     -> Glass
  - battery   -> E-Waste

Performs:
1. MD5 Deduplication (prevents data leakage between splits)
2. Stratified 70% Train / 15% Validation / 15% Test split with fixed random seed (42)
3. Balanced sampling option (--max_per_class) for efficient CPU training
4. Exports organized split folders:
     backend/ml/data/train/<Class>/
     backend/ml/data/val/<Class>/
     backend/ml/data/test/<Class>/
5. Exports split metadata to backend/ml/dataset_split_manifest.json
"""

import os
import shutil
import hashlib
import json
import argparse
from collections import defaultdict, Counter
from sklearn.model_selection import train_test_split

RAW_DATASET_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data", "raw", "final_merged_dataset")
TARGET_BASE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")
MANIFEST_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "dataset_split_manifest.json")

# Class mapping from MWCD raw folders to AI WasteWise project categories
CLASS_MAPPING = {
    "organic": "Organic",
    "plastic": "Plastic",
    "paper": "Paper",
    "cardboard": "Paper",
    "metal": "Metal",
    "glass": "Glass",
    "battery": "E-Waste"
}

VALID_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}

def calculate_file_hash(filepath, block_size=65536):
    hasher = hashlib.md5()
    with open(filepath, 'rb') as f:
        buf = f.read(block_size)
        while len(buf) > 0:
            hasher.update(buf)
            buf = f.read(block_size)
    return hasher.hexdigest()

def prepare_dataset(raw_dir=RAW_DATASET_DIR, target_dir=TARGET_BASE_DIR, max_per_class=1200, random_seed=42):
    print("=" * 78)
    print("  AI WasteWise - Preparing Dataset for MobileNetV3 Training")
    print("=" * 78)
    print(f"Source Raw Directory: {raw_dir}")
    print(f"Target Output Directory: {target_dir}")
    print(f"Max Samples Per Class: {max_per_class if max_per_class else 'ALL available'}")
    print(f"Random Seed: {random_seed}\n")

    if not os.path.exists(raw_dir):
        print(f"[ERROR] Raw dataset directory does not exist: {raw_dir}")
        return

    # 1. Discover, map, and deduplicate files
    print("[1] Discovering and deduplicating raw image files...")
    seen_hashes = set()
    category_files = defaultdict(list)
    duplicates_skipped = 0

    for raw_folder, project_class in CLASS_MAPPING.items():
        folder_path = os.path.join(raw_dir, raw_folder)
        if not os.path.exists(folder_path):
            print(f"  [WARN] Folder not found: {raw_folder}")
            continue

        for fname in os.listdir(folder_path):
            ext = os.path.splitext(fname)[1].lower()
            if ext in VALID_EXTENSIONS:
                fpath = os.path.join(folder_path, fname)
                fhash = calculate_file_hash(fpath)
                if fhash in seen_hashes:
                    duplicates_skipped += 1
                    continue
                seen_hashes.add(fhash)
                category_files[project_class].append(fpath)

    print(f"    Total unique images discovered: {len(seen_hashes):,}")
    print(f"    Duplicate copies skipped to prevent leakage: {duplicates_skipped:,}\n")

    # 2. Stratified Subsampling (if max_per_class specified)
    sampled_files = []
    sampled_labels = []

    print("[2] Applying category balancing...")
    for cls_name in sorted(category_files.keys()):
        files = category_files[cls_name]
        if max_per_class and len(files) > max_per_class:
            import random
            rng = random.Random(random_seed)
            selected = rng.sample(files, max_per_class)
        else:
            selected = files

        print(f"    {cls_name:<10}: {len(selected):,} images (out of {len(files):,} unique)")
        sampled_files.extend(selected)
        sampled_labels.extend([cls_name] * len(selected))

    # 3. Stratified 70% / 15% / 15% Split
    print("\n[3] Splitting into Train (70%), Validation (15%), Test (15%)...")
    # First split: 70% train, 30% temp (val + test)
    train_files, temp_files, train_labels, temp_labels = train_test_split(
        sampled_files, sampled_labels,
        test_size=0.30,
        random_state=random_seed,
        stratify=sampled_labels
    )

    # Second split: split 30% temp equally into 15% val and 15% test
    val_files, test_files, val_labels, test_labels = train_test_split(
        temp_files, temp_labels,
        test_size=0.50,
        random_state=random_seed,
        stratify=temp_labels
    )

    print(f"    Train Split : {len(train_files):,} images (70%)")
    print(f"    Val Split   : {len(val_files):,} images (15%)")
    print(f"    Test Split  : {len(test_files):,} images (15%)")

    # 4. Copying files to structured directories
    splits = [
        ("train", train_files, train_labels),
        ("val", val_files, val_labels),
        ("test", test_files, test_labels)
    ]

    print("\n[4] Populating target split directories...")
    for split_name, flist, llist in splits:
        split_dir = os.path.join(target_dir, split_name)
        # Clear existing split directory if present
        if os.path.exists(split_dir):
            shutil.rmtree(split_dir)
        os.makedirs(split_dir, exist_ok=True)

        for src_path, label in zip(flist, llist):
            label_dir = os.path.join(split_dir, label)
            os.makedirs(label_dir, exist_ok=True)
            fname = os.path.basename(src_path)
            dst_path = os.path.join(label_dir, fname)
            shutil.copy2(src_path, dst_path)

    # 5. Export metadata manifest
    print("\n[5] Writing split metadata manifest...")
    manifest = {
        "random_seed": random_seed,
        "classes": sorted(list(set(sampled_labels))),
        "summary": {
            "total_images": len(sampled_files),
            "train_count": len(train_files),
            "val_count": len(val_files),
            "test_count": len(test_files),
            "duplicates_removed": duplicates_skipped
        },
        "train_distribution": dict(Counter(train_labels)),
        "val_distribution": dict(Counter(val_labels)),
        "test_distribution": dict(Counter(test_labels))
    }

    with open(MANIFEST_PATH, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)

    print(f"    Manifest saved to: {MANIFEST_PATH}")
    print("\n" + "=" * 78)
    print("  Dataset preparation completed successfully!")
    print("=" * 78)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Prepare and split MWCD dataset for training")
    parser.add_argument("--max_per_class", type=int, default=1200, help="Max images per category (default: 1200 for balanced CPU training; 0 for all)")
    parser.add_argument("--seed", type=int, default=42, help="Random seed for reproducibility")
    args = parser.parse_args()

    max_c = args.max_per_class if args.max_per_class > 0 else None
    prepare_dataset(max_per_class=max_c, random_seed=args.seed)
