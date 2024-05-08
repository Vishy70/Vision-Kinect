# Hand Gesture Detection with YOLOv5

## Introduction

This is our work on building a yolov5 object detection model for hand gesture detection, to be used by a front end application (_tetris_). The repository is divided into the following structure:

//Insert Image...

- `hagrid` deals with the HaGrid dataset, used for training.
- `yolo` is our attempt at building a simple object detection model (yolov3) from scratch in pure Pytorch (as opposed to in C, with darknet).
- `yolov5` utilizes the framework published by _ultralytics_ to fine-tune a yolov5 model for hand gesture detection. You can download this from [ultralytics/yolov5](https://pytorch.org/get-started/locally/).

The following sections dive into these directories.

## HAGRID

This directory contains all the code relevant to downloading and processing that we used. The current state of the repository (after downloading) should look as below:

[Directory #1]()

### The Dataset

Our training and model building relies on the **HAnd Gesture Recognition Image Dataset** (_HaGRID_), available at the following [link](https://github.com/hukenovs/hagrid). This dataset is fantastic, containing 554,800 FullHD RGB images of 18 different hand gesture classes (plus the class of _no gesture_ - for a second hand, showing no gesture). However, it is 723GB in size (~ 40GB per class), and may not be realistic to download on your local instance. Thankfully, [Christian J. Mills](https://github.com/cj-mills) has provided more managable, downsized-versions of the dataset, as below (we used the 30k dataset):

- [HaGRID Sample 30k 384p](https://www.kaggle.com/datasets/innominate817/hagrid-sample-30k-384p)
- [HaGRID Sample 120k 384p](https://www.kaggle.com/datasets/innominate817/hagrid-sample-120k-384p)

Download the zip file, extract them into `hagrid` folder, such that your repository looks like this:

[Directory #2]()

### Requirements

Requirements for this data handling section:
- tqdm 

### Data to YOLO formatting

The *ann_train_val* directory consists of .json files, which are the annotations for each class(call, dislike, etc.). The hagrid_30k directory contains sub-directories for each class, consisting of images for the class.

The YOLOv5 model we use requires bounding box (_bbox_) annotations to be in the following row format:
**class** **x_center_rel** **y_center_rel** **width_rel** **height_rel**
for each hand-gesture, in each image (contained in a .txt file, with name corresponding to image name). However, the .jsons contain annotations, in the [**COCO**](https://cocodataset.org/#home) dataset format:
**top left x absolute** **top left x absolute** **width** **height**
for each hand-gesture, in each image.

Thus, we have provided the `json_to_yolo` script to do conversion automatically, assuming the default directory configuration, as mentioned above. Feel free to have a look!

After running `json_to_yolo`, the directory structure looks like so:

[Directory #3]()

The images and text files for a class will be mixed in its class subdirectory. You can now split the data using the `split_data script`. By default, the final yolo format data will be in the dataset directory, as show below:

![Directory #4]()

## YOLOv5

This is the directory where you can fine-tune a general Yolov5 object detection model (pretrained on COCO dataset) for hand-gesture detection.

### Requirements 2

Make sure your yolov5 directory looks like that from `ultralytics/yolov5`. If not, feel free to download from their [Github](https://github.com/ultralytics/yolov5).
We recommend to download Pytorch from the official [Pytorch website](https://pytorch.org/get-started/locally/), to enable cuda support for your local GPU.
After that, you can run the command (having your *terminal instance* inside the `yolov5` directory):
`pip install -r requirements.txt`

### Setting up training for our HaGRID dataset

Feel free to refer the following tutorial provided by [ultralytics](https://docs.ultralytics.com/yolov5/tutorials/train_custom_data/) themselves, it is well documented.

For example, if we decide to fine-tune a yolov5s model (small - 7M parameters), after setting up a [manual dataset](https://docs.ultralytics.com/yolov5/tutorials/train_custom_data/#option-2-create-a-manual-dataset) in *data/custom-dataset.yaml* and modifying the yolov5s.yaml config file to have *19 classes* (18 if you disclude the no gesture class) into *models/yolov5s_custom.yaml*, you can run the command to train (in the *yolov5* directory):

`python train.py --img 416 --batch 16 --epochs 10 --data ./data/custom-dataset.yaml --cfg ./models/yolov5s_custom.yaml --weights yolov5s.pt --device 0 --optimizer Adam`

to train with batch size 16 for 10 epochs with Adam optimizer on your local GPU (assuming `torch.cuda.is_available()` evaluates to `True`).