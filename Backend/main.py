# -*- coding: utf-8 -*-
"""
Food-101 Classifier Backend API
"""

import os
import sys
import time
import json
import torch
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager

from config import BASE_DIR, CALORIE_MAP_PATH, HISTORY_PATH, OUTPUT_DIR
from predict import load_model_and_classes, predict_single_image
from utils import load_calorie_map

if not torch.cuda.is_available():
    print("  [FATAL]: No CUDA GPU detected!")
    sys.exit(1)

DEVICE = torch.device("cuda")
GPU_NAME = torch.cuda.get_device_name(0)

# ═══════════════════════════════════════════════════════════════════
#  GLOBAL STATE
# ═══════════════════════════════════════════════════════════════════
model = None
class_names = None
calorie_map = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global model, class_names, calorie_map
    print(f"  [START] STARTING FOOD-101 INFERENCE SERVER (EfficientNet-B4)")
    model, class_names = load_model_and_classes(DEVICE)
    calorie_map = load_calorie_map(CALORIE_MAP_PATH)
    yield
    del model, class_names, calorie_map
    torch.cuda.empty_cache()

# ═══════════════════════════════════════════════════════════════════
#  FASTAPI APP
# ═══════════════════════════════════════════════════════════════════
app = FastAPI(title="Food-101 Classifier API", lifespan=lifespan)

app.mount("/output", StaticFiles(directory=os.path.join(BASE_DIR, "outputs")), name="output")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ═══════════════════════════════════════════════════════════════════
#  INCLUDE ROUTERS
# ═══════════════════════════════════════════════════════════════════
from auth import router as auth_router
from user_routes import router as user_router

app.include_router(auth_router)
app.include_router(user_router)

# ═══════════════════════════════════════════════════════════════════
#  CORE ROUTES
# ═══════════════════════════════════════════════════════════════════
@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "gpu": GPU_NAME,
        "model_loaded": model is not None,
    }

@app.get("/classes")
async def list_classes():
    if class_names is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    return {"count": len(class_names), "classes": class_names}

@app.post("/predict")
async def predict_food(file: UploadFile = File(...)):
    if model is None or class_names is None:
        raise HTTPException(status_code=503, detail="Model is not loaded.")
    
    try:
        image_bytes = await file.read()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to read file: {e}")

    try:
        start_time = time.time()
        result = predict_single_image(model, class_names, image_bytes, DEVICE, calorie_map)
        inference_ms = (time.time() - start_time) * 1000
        result["inference_time_ms"] = round(inference_ms, 2)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference failed: {e}")

# ═══════════════════════════════════════════════════════════════════
#  MODEL METRICS & STATUS
# ═══════════════════════════════════════════════════════════════════
@app.get("/model/metrics")
async def get_model_metrics():
    """Return parsed training history data for chart rendering."""
    if not os.path.exists(HISTORY_PATH):
        raise HTTPException(status_code=404, detail="Training history not found. Train the model first.")
    
    with open(HISTORY_PATH, "r") as f:
        history = json.load(f)
    
    # Build per-epoch structured data
    total_epochs = len(history.get("train_acc", []))
    epochs = []
    for i in range(total_epochs):
        epoch_data = {"epoch": i + 1}
        for key in history:
            if isinstance(history[key], list) and len(history[key]) > i:
                epoch_data[key] = history[key][i]
        epochs.append(epoch_data)
    
    return {
        "total_epochs": total_epochs,
        "available_metrics": list(history.keys()),
        "epochs": epochs,
        "summary": {
            "best_val_acc": max(history.get("val_acc", [0])),
            "best_val_top5": max(history.get("val_top5", [0])),
            "final_train_loss": history.get("train_loss", [0])[-1] if history.get("train_loss") else 0,
            "final_val_loss": history.get("val_loss", [0])[-1] if history.get("val_loss") else 0,
        },
    }

@app.get("/model/status")
async def get_model_status():
    """Return current model status for the status indicator."""
    is_training = os.path.exists(os.path.join(OUTPUT_DIR, "logs", "training_in_progress.lock"))
    
    if model is not None:
        return {
            "status": "training" if is_training else "ready",
            "gpu": GPU_NAME,
            "architecture": "EfficientNet-B4",
            "dataset": "Food-101",
            "num_classes": len(class_names) if class_names else 0,
        }
    else:
        return {"status": "offline", "gpu": GPU_NAME}
