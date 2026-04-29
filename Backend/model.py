# -*- coding: utf-8 -*-
import torch.nn as nn
from torchvision import models

def build_model(num_classes: int = 101, dropout: float = 0.4, pretrained: bool = True) -> nn.Module:
    """
    Build EfficientNet-B4 with a custom classifier head.
    
    Args:
        num_classes: Number of output classes (101 for Food-101)
        dropout: Dropout rate for the classifier head
        pretrained: If True, uses ImageNet weights (for training). False for inference.
    """
    if pretrained:
        weights = models.EfficientNet_B4_Weights.DEFAULT
    else:
        weights = None
        
    model = models.efficientnet_b4(weights=weights)
    
    # Replace classifier head
    in_features = model.classifier[1].in_features  # 1792 for B4
    
    model.classifier = nn.Sequential(
        nn.Dropout(p=dropout, inplace=True),
        nn.Linear(in_features, num_classes),
    )
    
    return model
