"""
AI WasteWise - MWCD Dataset Inspection Script
Location: backend/ml/inspect_dataset.py

Performs comprehensive inspection of the raw dataset:
1. Directory structure and nested folder detection
2. Category discovery and image counts
3. File format verification (Pillow)
4. Corrupted / unreadable image detection (non-destructive)
5. Duplicate image detection via MD5 hashing
6. Class imbalance metrics
7. Unexpected files and archive detection
"""

import os
import sys
import hashlib
from collections import Counter, defaultdict
from PIL import Image, UnidentifiedImageError

RAW_BASE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data", "raw")
VALID_IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".webp", ".bmp"}

def find_dataset_root(base_dir):
    """Locate the actual dataset directory containing class subfolders."""
    if not os.path.exists(base_dir):
        return None, []
    
    # Check if base_dir directly contains class subfolders (folders with images)
    subdirs = [os.path.join(base_dir, d) for d in os.listdir(base_dir) if os.path.isdir(os.path.join(base_dir, d))]
    
    # Priority check: look for final_merged_dataset
    for s in subdirs:
        if os.path.basename(s).lower() == "final_merged_dataset":
            return s, [d for d in os.listdir(s) if os.path.isdir(os.path.join(s, d))]
            
    # Check subdirectories recursively up to depth 2
    for s in subdirs:
        nested = [os.path.join(s, d) for d in os.listdir(s) if os.path.isdir(os.path.join(s, d))]
        for n in nested:
            if os.path.basename(n).lower() == "final_merged_dataset":
                return n, [d for d in os.listdir(n) if os.path.isdir(os.path.join(n, d))]
        if nested:
            return s, [os.path.basename(n) for n in nested]

    return base_dir, [os.path.basename(s) for s in subdirs]

def calculate_file_hash(filepath, block_size=65536):
    """Compute MD5 hash of a file for duplicate detection."""
    hasher = hashlib.md5()
    with open(filepath, 'rb') as f:
        buf = f.read(block_size)
        while len(buf) > 0:
            hasher.update(buf)
            buf = f.read(block_size)
    return hasher.hexdigest()

def inspect_dataset(data_dir=RAW_BASE_DIR):
    print("=" * 78)
    print("  AI WasteWise - MWCD Dataset Comprehensive Inspection")
    print("=" * 78)
    print(f"Base Directory: {data_dir}\n")

    if not os.path.exists(data_dir):
        print(f"[ERROR] Directory does not exist: {data_dir}")
        return

    # 1. Structure Detection
    dataset_root, categories = find_dataset_root(data_dir)
    print(f"[1] Dataset Structure Detected:")
    print(f"    Target Dataset Root: {dataset_root}")
    print(f"    Categories Discovered: {len(categories)} folders: {categories}\n")

    # 2. Check for unexpected archives or non-image files in raw base
    unexpected_files = []
    for root, dirs, files in os.walk(data_dir):
        for f in files:
            ext = os.path.splitext(f)[1].lower()
            if ext in [".zip", ".tar", ".gz", ".rar", ".7z", ".txt", ".csv", ".json", ".ini", ".db"]:
                rel_path = os.path.relpath(os.path.join(root, f), data_dir)
                unexpected_files.append((rel_path, ext))

    # 3. Category Inspection, Integrity & Duplicates
    print("[2] Inspecting Image Files, Integrity & Format Validation...")
    category_counts = Counter()
    format_counts = Counter()
    corrupted_images = []
    hash_map = defaultdict(list)
    image_resolutions = []

    for cat in sorted(categories):
        cat_path = os.path.join(dataset_root, cat)
        files = os.listdir(cat_path)
        for fname in files:
            fpath = os.path.join(cat_path, fname)
            if not os.path.isfile(fpath):
                continue
            
            ext = os.path.splitext(fname)[1].lower()
            format_counts[ext] += 1
            
            if ext in VALID_IMAGE_EXTS:
                category_counts[cat] += 1
                # Check image integrity with Pillow
                try:
                    with Image.open(fpath) as img:
                        img.verify()
                except Exception as e:
                    corrupted_images.append((cat, fname, str(e)))
                
                # Check for duplicates using file hash
                fhash = calculate_file_hash(fpath)
                hash_map[fhash].append((cat, fname))

    # Identify duplicate image groups
    duplicate_groups = {h: paths for h, paths in hash_map.items() if len(paths) > 1}
    total_duplicates = sum(len(paths) - 1 for paths in duplicate_groups.values())

    # 4. Print Summary Table
    total_valid = sum(category_counts.values())
    print("\n" + "=" * 78)
    print(f"{'Category':<16} | {'Count':<8} | {'Percentage':<10} | {'Status':<12}")
    print("-" * 78)
    for cat in sorted(categories):
        cnt = category_counts[cat]
        pct = (cnt / total_valid * 100) if total_valid > 0 else 0
        status = "Valid" if cnt > 0 else "Empty"
        print(f"{cat:<16} | {cnt:<8,} | {pct:>8.2f}% | {status:<12}")
    print("-" * 78)
    print(f"{'TOTAL VALID IMAGES':<16} | {total_valid:<8,} | {'100.00%':>9} |")
    print("=" * 78)

    # 5. Format Breakdown
    print("\n[3] File Formats Detected:")
    for ext, cnt in format_counts.most_common():
        print(f"    {ext or '(no extension)':<10}: {cnt:,} files")

    # 6. Quality & Anomaly Report
    print("\n[4] Data Quality & Anomaly Inspection:")
    print(f"    Corrupted/Unreadable Images : {len(corrupted_images)}")
    if corrupted_images:
        for c, f, err in corrupted_images[:5]:
            print(f"      - {c}/{f}: {err}")
        if len(corrupted_images) > 5:
            print(f"      ... and {len(corrupted_images) - 5} more")
    else:
        print("      No corrupted files found. 100% of images passed Pillow header verification.")

    print(f"    Duplicate Images Detected   : {total_duplicates} duplicate instances across {len(duplicate_groups)} groups")
    if duplicate_groups:
        sample_h = list(duplicate_groups.keys())[0]
        print(f"      Sample duplicate group ({len(duplicate_groups[sample_h])} copies):")
        for c, f in duplicate_groups[sample_h]:
            print(f"        - {c}/{f}")

    # 7. Class Imbalance Ratio
    if category_counts:
        counts_list = list(category_counts.values())
        max_c, min_c = max(counts_list), min(counts_list)
        imbalance_ratio = max_c / min_c if min_c > 0 else float('inf')
        print(f"\n[5] Class Imbalance Metrics:")
        print(f"    Majority Class: {max(category_counts, key=category_counts.get)} ({max_c:,} images)")
        print(f"    Minority Class: {min(category_counts, key=category_counts.get)} ({min_c:,} images)")
        print(f"    Imbalance Ratio: {imbalance_ratio:.2f}:1")

    # 8. Unexpected files/archives
    print(f"\n[6] Non-Dataset / Archive Files Detected in Raw:")
    if unexpected_files:
        for p, ext in unexpected_files:
            print(f"    - {p}")
    else:
        print("    None.")
    print("=" * 78)

if __name__ == "__main__":
    inspect_dataset()
