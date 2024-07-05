import os
import json
import shutil
from tqdm import tqdm
from constants import targets

def make_folders(path="output"):
    if os.path.exists(path):
        return path
    os.makedirs(path)
    return path

def process_annotations(output_path, json_file, images_base_path, name):
    path = make_folders(output_path)

    with open(json_file) as f:
        json_data = json.load(f)

    image_count = 0
    for key in tqdm(json_data.keys(), desc=f"Processing {name}"):
        # Find the correct subfolder for each image
        for subfolder in os.listdir(images_base_path):
            img_path = os.path.join(images_base_path, subfolder, key + ".jpg")
            if os.path.isfile(img_path):
                break
        else:
            print(f"Image file not found for key: {key}")
            continue

        df = json_data[key]
        labels = df["labels"]

        for label in labels:
            if label == "no_gesture":
                continue
            category = targets[label]
            label_dir = os.path.join(output_path, str(category))
            make_folders(label_dir)
            shutil.copy(img_path, os.path.join(label_dir, key + ".jpg"))
            image_count += 1

    print(f"Processed {image_count} images for {name}")
