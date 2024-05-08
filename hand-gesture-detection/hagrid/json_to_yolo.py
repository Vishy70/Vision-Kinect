import os
import json
from tqdm import tqdm
import shutil

from constants import targets



def convert_bbox_coco2yolo(bbox):
    """
    Convert bounding box from HaGrid COCO format to YOLO format

    Parameters
    ----------
    bbox : list[float]
        bounding box annotation in COCO format: 
        [top left x position, top left y position, width, height]

    Returns
    -------
    list[float]
        bounding box annotation in YOLO format: 
        [x_center_rel, y_center_rel, width_rel, height_rel]
    """
    
    # YOLO bounding box format: [x_center, y_center, width, height]
    # (float values relative to width and height of image)

    x_tl, y_tl, w, h = bbox

    x_center = x_tl + w / 2.0
    y_center = y_tl + h / 2.0

    x = x_center
    y = y_center
    w = w
    h = h

    return [x, y, w, h]

def make_folders(path="output"):
    '''
    Helper, to make the required directories on local disk.

    Parameters
    ----------
    path : string
        Path of the desired location
    
    Returns
    -------
    The path provided.
    
    '''
    if os.path.exists(path):
        #shutil.rmtree(path)
        return path
    os.makedirs(path)
    return path


def convert_coco_json_to_yolo_txt(output_path, json_file, images_path, name):
    '''
    Function to convert json folders of HaGRID dataset's json format to YOLO format.
    Convert's only those bbox annotation entries that have a correpsonding entry in the image set.

    Parameters
    ----------
    output_path : string
        Path of the output directory, where all images and annotations will be contained in sub-directories.
    
    json_file : string
        Path of the json_file being manipulated on.

    images_path : string
        Path to the location of images correspodning to json_file.   
    
    '''

    path = make_folders(output_path)

    with open(json_file) as f:
        json_data = json.load(f)

    count = 0
    count_in = 0
    count_not = 0
    for key in tqdm(json_data.keys(), desc=f"Annotation txt for {name}"):

        count += 1
        path = os.path.join(images_path, key + ".jpg")
        if not os.path.isfile(path):
            count_not += 1
            #print(f" :( {count_not}")
            continue 
        #print("Number: ", count)
        #print(f" :) {count_in}")

        df = json_data[key]

        with open(os.path.join(output_path, key + ".txt"), "w") as f:
            for bbox, label in zip(df["bboxes"], df["labels"]):
                x, y, w, h = convert_bbox_coco2yolo(bbox)
                category = targets[label]
                f.write(f"{category} {x:.6f} {y:.6f} {w:.6f} {h:.6f}\n")
            
            shutil.copy(path, os.path.join(output_path, key + ".jpg"))


        count_in += 1
        #if count_in == 5: break

    #print("Converting COCO Json to YOLO txt finished!\n")
    #print("count_in: ", count_in)
    #print("count_not: ", count_not)


if __name__ == "__main__":
    output_dir = "all_data"
    ann_dir = "ann_train_val"
    images_dir = "hagrid_30k"

    for key in targets.keys():
        if key == "no_gesture": continue

        folder = key
        img_folder = "train_val_" + folder

        convert_coco_json_to_yolo_txt(os.path.join(output_dir, key), os.path.join(ann_dir, folder + ".json"), os.path.join(images_dir, img_folder), folder)
