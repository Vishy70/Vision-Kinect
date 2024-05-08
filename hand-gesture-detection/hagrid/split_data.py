import os
import shutil
import random
from itertools import islice
from tqdm import tqdm

from constants import targets

#PARAMETERS
#---------------------------------------------
output_path = 'dataset'
input_dir = 'all_data'
split = {"train":0.8, "valid":0.2, "test":0.0}
#---------------------------------------------
# We were testing using a webcam/images we generated, separate from the dataset (completely new).

try:
    shutil.rmtree(output_path)
    #print("Removed Directory")
except OSError as e:
    os.mkdir(output_path)

for key in targets.keys():
    if key == "no_gesture": continue
    
    input_path = os.path.join(input_dir, key)
    
    #Create directories
    os.makedirs(f"{output_path}/images/train", exist_ok=True)
    os.makedirs(f"{output_path}/images/valid", exist_ok=True)
    os.makedirs(f"{output_path}/images/test", exist_ok=True)
    os.makedirs(f"{output_path}/labels/train", exist_ok=True)
    os.makedirs(f"{output_path}/labels/valid", exist_ok=True)
    os.makedirs(f"{output_path}/labels/test", exist_ok=True)


    #Get the names
    list_names = os.listdir(input_path)
    unique_names = []
    for name in list_names:
        unique_names.append(name.split('.')[0])

    unique_names = list(set(unique_names))
    #print(unique_names)

    #Shuffle
    random.shuffle(unique_names) #in_place

    #Find the number of images for each folder
    len_data = len(unique_names)
    len_train = int(len_data * split["train"])
    len_valid = int(len_data * split["valid"])
    len_test = int(len_data * split["test"])
    #print(f'\n{key}: {len_data}, Trainset: {len_train}, Validset: {len_valid}, Testset: {len_test}')

    #Small bug: Any remaining?
    if len_data != len_train + len_valid + len_test:
        rem = len_data - len_train - len_valid - len_test
        len_train += rem

    #Split the list
    lengths_to_split = []
    lengths_to_split.append(len_train)
    lengths_to_split.append(len_valid)
    lengths_to_split.append(len_test)
    inputy = iter(unique_names)
    outputy = [list(islice(inputy, length)) for length in lengths_to_split]
    print(f'\n {key}: {len_data}, Trainset: {len(outputy[0])}, ValidSet: {len(outputy[1])}, Testset: {len(outputy[2])}')

    #Copy the files
    seq = ['train', 'valid', 'test']
    for i, out in enumerate(outputy):
        for filename in tqdm(out, desc=f"Copying for {seq[i]}"):
            shutil.copy(f'{input_path}/{filename}.jpg', f'{output_path}/images/{seq[i]}/{filename}.jpg')
            shutil.copy(f'{input_path}/{filename}.txt', f'{output_path}/labels/{seq[i]}/{filename}.txt')
