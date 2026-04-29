# -*- coding: utf-8 -*-
"""
Configuration settings and hyperparameters for Food-101 Model.
"""

import os

# ═══════════════════════════════════════════════════════════════════
#  PATHS
# ═══════════════════════════════════════════════════════════════════
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_DIR = r"C:\dl\food-101\food-101\images"
OUTPUT_DIR = os.path.join(BASE_DIR, "outputs")
MODEL_PATH = os.path.join(OUTPUT_DIR, "food101_model.pth")
CLASSES_PATH = os.path.join(OUTPUT_DIR, "class_names.json")
HISTORY_PATH = os.path.join(OUTPUT_DIR, "training_history.json")
CALORIE_MAP_PATH = os.path.join(BASE_DIR, "calorie_map.json")

# Ensure outputs directory exists
os.makedirs(OUTPUT_DIR, exist_ok=True)

# ═══════════════════════════════════════════════════════════════════
#  HYPERPARAMETERS
# ═══════════════════════════════════════════════════════════════════
IMG_SIZE = 288  # Safe size for EfficientNet-B4 on 8GB VRAM
BATCH_SIZE = 32
NUM_CLASSES = 101
NUM_WORKERS = 4
VAL_SPLIT = 0.2

# ── Phase 1: Train Head Only (Frozen Backbone) ──
PHASE1_EPOCHS = 10
PHASE1_LR = 1e-3

# ── Phase 2: Fine-Tuning (Unfrozen Backbone) ──
PHASE2_EPOCHS = 25
PHASE2_LR = 5e-5
FINE_TUNE_BLOCK = 0 # Unfreeze all layers for EfficientNet Phase 2

# ── Regularization & Augmentation ──
DROPOUT = 0.4
LABEL_SMOOTHING = 0.1
WEIGHT_DECAY = 1e-4

# ── Early Stopping ──
EARLY_STOP_PATIENCE = 7

# ImageNet normalization constants
IMAGENET_MEAN = [0.485, 0.456, 0.406]
IMAGENET_STD = [0.229, 0.224, 0.225]
