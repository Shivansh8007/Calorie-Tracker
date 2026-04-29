# -*- coding: utf-8 -*-
import torch
from torch.utils.data import DataLoader, random_split
from torchvision import datasets, transforms
from torchvision.transforms import v2

from config import (
    IMG_SIZE, IMAGENET_MEAN, IMAGENET_STD, DATASET_DIR, 
    VAL_SPLIT, BATCH_SIZE, NUM_WORKERS, NUM_CLASSES
)

# ═══════════════════════════════════════════════════════════════════
#  TRANSFORMS
# ═══════════════════════════════════════════════════════════════════
# We use v2 transforms for advanced augmentations
train_transform = v2.Compose([
    v2.RandomResizedCrop(IMG_SIZE, scale=(0.7, 1.0)),
    v2.RandomHorizontalFlip(p=0.5),
    v2.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2, hue=0.1),
    v2.RandAugment(num_ops=2, magnitude=9),
    v2.ToImage(),
    v2.ToDtype(torch.float32, scale=True),
    v2.Normalize(mean=IMAGENET_MEAN, std=IMAGENET_STD),
    v2.RandomErasing(p=0.2, scale=(0.02, 0.1), value=0)
])

val_transform = v2.Compose([
    v2.Resize(int(IMG_SIZE * 1.14)), # Typical resize factor
    v2.CenterCrop(IMG_SIZE),
    v2.ToImage(),
    v2.ToDtype(torch.float32, scale=True),
    v2.Normalize(mean=IMAGENET_MEAN, std=IMAGENET_STD),
])

inference_transform = transforms.Compose([
    transforms.Resize(int(IMG_SIZE * 1.14)),
    transforms.CenterCrop(IMG_SIZE),
    transforms.ToTensor(),
    transforms.Normalize(mean=IMAGENET_MEAN, std=IMAGENET_STD),
])

# ═══════════════════════════════════════════════════════════════════
#  MIXUP / CUTMIX
# ═══════════════════════════════════════════════════════════════════
mixup_cutmix = v2.RandomChoice([
    v2.MixUp(alpha=0.2, num_classes=NUM_CLASSES),
    v2.CutMix(alpha=1.0, num_classes=NUM_CLASSES)
])

def apply_mixup_cutmix(imgs, labels):
    """Apply MixUp/CutMix to a batch of images and labels."""
    return mixup_cutmix(imgs, labels)


class TransformSubset(torch.utils.data.Dataset):
    """Wraps a Subset so training/val splits get different transforms."""
    def __init__(self, subset, transform):
        self.subset    = subset
        self.transform = transform

    def __len__(self):
        return len(self.subset)

    def __getitem__(self, idx):
        img, label = self.subset[idx]
        if self.transform:
            img = self.transform(img)
        return img, label

# ═══════════════════════════════════════════════════════════════════
#  DATA LOADERS
# ═══════════════════════════════════════════════════════════════════
def get_dataloaders():
    """Load dataset, split, and create DataLoaders."""
    full_dataset = datasets.ImageFolder(root=DATASET_DIR)
    class_names = full_dataset.classes
    
    val_size = int(len(full_dataset) * VAL_SPLIT)
    train_size = len(full_dataset) - val_size
    train_sub, val_sub = random_split(
        full_dataset, [train_size, val_size],
        generator=torch.Generator().manual_seed(42)
    )
    
    train_ds = TransformSubset(train_sub, train_transform)
    val_ds   = TransformSubset(val_sub, val_transform)

    train_loader = DataLoader(
        train_ds, batch_size=BATCH_SIZE, shuffle=True,
        num_workers=NUM_WORKERS, pin_memory=True, persistent_workers=True
    )
    val_loader = DataLoader(
        val_ds, batch_size=BATCH_SIZE, shuffle=False,
        num_workers=NUM_WORKERS, pin_memory=True, persistent_workers=True
    )
    
    return train_loader, val_loader, class_names, train_size, val_size
