import json
import logging
import os
from typing import Dict, List, Tuple

import albumentations as A
import numpy as np
import pandas as pd
import torch
import torch.nn as nn
import torch.optim as optim
from albumentations.pytorch import ToTensorV2
from omegaconf import OmegaConf, DictConfig
from PIL import Image
from torch.utils.data import DataLoader, Dataset, random_split
from tqdm import tqdm
from model import Yolov1

IMAGES = (".jpeg", ".jpg", ".jp2", ".png", ".tiff", ".jfif", ".bmp", ".webp", ".heic")

targets = {
    1: "call",
    2: "dislike",
    3: "fist",
    4: "four",
    5: "like",
    6: "mute",
    7: "ok",
    8: "one",
    9: "palm",
    10: "peace",
    11: "rock",
    12: "stop",
    13: "stop_inverted",
    14: "three",
    15: "two_up",
    16: "two_up_inverted",
    17: "three2",
    18: "peace_inverted",
    19: "no gesture",
}

# Sample configuration
conf = OmegaConf.create({
    "dataset": {
        "targets": list(targets.values()),
        "annotations": "hagrid-sample-120k-384p/ann_train_val",
        "dataset": "hagrid-sample-120k-384p/hagrid_120k",
        "subset": None,  # Set a value if you want to use a subset of the dataset
        "one_class": False,  # Set to True if you want to treat all gestures as a single class
        "train_val_split": 0.8,  # Ratio of the dataset to be used for training
    }
})

print(conf.dataset.targets)

class HagridDataset(Dataset):
    def __init__(self, conf: DictConfig, transform):
        self.conf = conf
        self.labels = {
            label: num for (label, num) in zip(self.conf.dataset.targets, range(len(self.conf.dataset.targets)))
        }

        subset = self.conf.dataset.get("subset", None)

        self.path_to_annotations = os.path.expanduser(self.conf.dataset.annotations)
        self.path_to_dataset = os.path.expanduser(self.conf.dataset.dataset)
        self.annotations = self.__read_annotations(subset)

        self.transform = transform

    @staticmethod
    def _load_image(image_path: str):
        """
        Load image from path

        Parameters
        ----------
        image_path : str
            Path to image
        """
        image = Image.open(image_path).convert("RGB")

        return image

    def __read_annotations(self, subset: int = None) -> pd.DataFrame:
        """
        Read annotations json

        Parameters
        ----------
        subset : int
            Length of subset for each target

        Returns
        -------
        pd.DataFrame
            Dataframe with annotations
        """
        exists_images = set()
        annotations_all = []

        for target in tqdm(self.conf.dataset.targets, desc="Prepare dataset"):
            if target == "no_gesture":
                continue
            target_json = os.path.join(self.path_to_annotations, f"{target}.json")
            if os.path.exists(target_json):
                with open(target_json, "r") as file:
                    json_annotation = json.load(file)
                    # print(f"JSON annotation for {target}:")
                    # print(json_annotation)

                json_annotation = [
                    {**annotation, "target": target, "id": key}
                    for key, annotation in json_annotation.items()
                ]
                if subset is not None and subset > 1:
                    json_annotation = json_annotation[:subset]

                annotation = pd.DataFrame(json_annotation)
                # print(f"Annotation DataFrame for {target}:")
                # print(annotation)
                annotations_all.append(annotation)
                exists_images.update(
                    self.__get_files_from_dir(os.path.join(self.path_to_dataset, target), IMAGES)
                )
            else:
                logging.info(f"Database for {target} not found. Please check the dataset")

        if annotations_all:
            annotations_all = pd.concat(annotations_all, ignore_index=True)
            print("Final annotations of all labels DataFrame:")
            print(annotations_all)
        else:
            annotations_all = pd.DataFrame()
            print("No annotations found. Please check the dataset provided")

        annotations_all = annotations_all.reset_index(drop=True)
        return annotations_all

    @staticmethod
    def __get_files_from_dir(pth: str, extns: Tuple) -> List:
        """
        Get list of files from dir according to extensions(extns)

        Parameters
        ----------
        pth : str
            Path ot dir
        extns: Tuple
            Set of file extensions
        """
        if not os.path.exists(pth):
            logging.warning(f"Dataset directory doesn't exist {pth}")
            return []
        files = [f for f in os.listdir(pth) if f.endswith(extns)]
        return files

    def __len__(self):
        """
        Get length of dataset
        """
        return self.annotations.shape[0]

class DetectionDataset(HagridDataset):
    def __init__(self, conf: DictConfig, transform):
        super().__init__(conf, transform)
        self.one_class = self.conf.dataset.get("one_class", False)
        self.num_classes = len(conf.dataset.targets)

    def __getitem__(self, index: int) -> Tuple[Image.Image, Dict]:
        """
        Get item from annotations

        Parameters
        ----------
        item : int
            Index of annotation item

        Returns
        -------
        Tuple[Image.Image, Dict]
            Image and target
        """
        row = self.annotations.iloc[[index]].to_dict("records")[0]

        # Construct the image path based on the actual file naming convention
        image_filename = f"{row['id']}.jpg"
        image_pth = os.path.join(self.path_to_dataset, row["target"], image_filename)

        if not os.path.exists(image_pth):
            # Handle the case where the image file is not found
            logging.warning(f"Image file not found: {image_pth}")
            return None, None

        image = self._load_image(image_pth)

        labels = np.array([self.labels[row["target"]]])

        target = {}
        width, height = image.size

        bboxes = []

        for bbox in row["bboxes"]:
            x1, y1, w, h = bbox
            x_min = int(x1)
            y_min = int(y1)
            x_max = int(x1 + w)
            y_max = int(y1 + h)
            if x_min < 0:
                x_min = 0
            if y_min < 0:
                y_min = 0
            if x_max > width:
                x_max = width
            if y_max > height:
                y_max = height
            bboxes.append([x_min, y_min, x_max, y_max])

        bboxes = np.array(bboxes, dtype=np.float32)

        # Prepare the dictionary for Albumentations
        data = {"image": np.array(image)}
        data["bboxes"] = bboxes / np.array([width, height, width, height], dtype=np.float32)
        data["class_labels"] = labels

        if self.transform is not None:
            transformed_data = self.transform(**data)
            image = transformed_data["image"]
            target["boxes"] = torch.tensor(transformed_data["bboxes"], dtype=torch.float32)
            target["labels"] = torch.tensor(transformed_data["class_labels"])
        else:
            image = data["image"] / 255.0
            target["boxes"] = torch.tensor(data["bboxes"], dtype=torch.float32)
            target["labels"] = torch.tensor(data["class_labels"])

        if self.one_class:
            target["labels"] = torch.ones_like(target["labels"])

        return image, target

# Define data transformations
train_transform = A.Compose([
    A.Resize(height=448, width=448),
    A.HorizontalFlip(p=0.5),
    A.VerticalFlip(p=0.5),
    A.GaussNoise(p=0.2),
    A.ToGray(p=0.1),
    A.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ToTensorV2(),
], bbox_params=A.BboxParams(format='yolo', label_fields=['class_labels']))

val_transform = A.Compose([
    A.Resize(height=448, width=448),
    A.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ToTensorV2(),
], bbox_params=A.BboxParams(format='yolo', label_fields=['class_labels']))

dataset = DetectionDataset(conf, train_transform)
num_classes = dataset.num_classes

train_size = int(conf.dataset.train_val_split * len(dataset))
val_size = len(dataset) - train_size
train_dataset, val_dataset = random_split(dataset, [train_size, val_size])

# Get the labels from the original dataset
labels = dataset.labels


# Create data loaders
train_loader = DataLoader(train_dataset, batch_size=32, shuffle=True, num_workers=4)
val_loader = DataLoader(val_dataset, batch_size=32, shuffle=False, num_workers=4)

# Define the YOLO model
split_size = 7  # Specify the split size for the YOLO architecture
num_boxes = 2  # Specify the number of bounding boxes per grid cell # Specify the number of classes

# Create an instance of the Yolov1 model
model = Yolov1(in_channels=3, split_size=split_size, num_boxes=num_boxes, num_classes=19)

# Move the model to the appropriate device
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
model = model.to(device)

# Define the loss function and optimizer
criterion = nn.MSELoss()
optimizer = optim.SGD(model.parameters(), lr=0.001, momentum=0.9)

# Training loop
num_epochs = 50
for epoch in range(num_epochs):
    model.train()
    running_loss = 0.0
    for images, targets in tqdm(train_loader, desc=f'Epoch {epoch + 1}'):
        images = list(image.to(device) for image in images)
        targets = [{k: v.to(device) for k, v in t.items()} for t in targets]

        optimizer.zero_grad()
        outputs = model(images, targets)
        loss = sum(loss for loss in outputs.values())
        loss.backward()
        optimizer.step()

        running_loss += loss.item()

    print(f'Epoch {epoch + 1}, Loss: {running_loss / len(train_loader)}')

# Evaluation
model.eval()
with torch.no_grad():
    for images, targets in tqdm(val_loader, desc='Evaluating'):
        images = list(image.to(device) for image in images)
        targets = [{k: v.to(device) for k, v in t.items()} for t in targets]

        outputs = model(images)

        # Implement your evaluation logic here
        # For example, calculate mAP or other metrics

print('Evaluation completed.')