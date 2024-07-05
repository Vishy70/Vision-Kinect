import os
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, random_split
import torchvision.transforms as transforms
from tqdm import tqdm
from dataset import CustomDataset
from helper import process_annotations
from model import ResNetModel
from constants import targets

# Paths
output_dir = "classified_data"
ann_dir = "hagrid-sample-120k-384p/ann_train_val"
images_dir = "hagrid-sample-120k-384p/hagrid_120k"

# Step 1: Process annotations
if not os.path.exists(output_dir):
    for json_file in os.listdir(ann_dir):
        json_file_path = os.path.join(ann_dir, json_file)
        print(f"Processing JSON file: {json_file_path}")
        process_annotations(output_dir, json_file_path, images_dir, json_file)

# Step 2: Check if output_dir has been populated
for category in os.listdir(output_dir):
    category_path = os.path.join(output_dir, category)
    if os.path.isdir(category_path):
        print(f"Category {category} has {len(os.listdir(category_path))} images")

# Step 3: Prepare Data Loaders
transform = transforms.Compose([
    transforms.Resize((224, 224)),  # ResNet expects 224x224 images
    transforms.ToTensor(),
    transforms.Normalize((0.485, 0.456, 0.406), (0.229, 0.224, 0.225)),
])

dataset = CustomDataset(root_dir=output_dir, transform=transform)

# Check dataset size
print(f"Total dataset size: {len(dataset)}")

train_size = int(0.8 * len(dataset))
valid_size = int(0.1 * len(dataset))
test_size = len(dataset) - train_size - valid_size

print(f"Train size: {train_size}, Valid size: {valid_size}, Test size: {test_size}")

# Ensure sizes are non-zero
if train_size == 0 or valid_size == 0 or test_size == 0:
    raise ValueError("One of the dataset splits is zero. Check the dataset and split ratios.")

train_dataset, valid_dataset, test_dataset = random_split(dataset, [train_size, valid_size, test_size])

train_loader = DataLoader(train_dataset, batch_size=32, shuffle=True)
valid_loader = DataLoader(valid_dataset, batch_size=32, shuffle=False)
test_loader = DataLoader(test_dataset, batch_size=32, shuffle=False)

# Step 4: Define and Train ResNet Model
num_classes = len(targets)  # Assuming 'no_gesture' is not counted
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
model = ResNetModel(num_classes=num_classes).to(device)
criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(model.parameters(), lr=0.001)

num_epochs = 10
for epoch in range(num_epochs):
    model.train()
    running_loss = 0.0
    for inputs, labels in tqdm(train_loader, desc=f"Epoch {epoch+1}/{num_epochs}"):
        inputs, labels = inputs.to(device), labels.to(device)
        
        optimizer.zero_grad()
        outputs = model(inputs)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()
        
        running_loss += loss.item()
    
    print(f'Epoch [{epoch+1}/{num_epochs}], Loss: {running_loss/len(train_loader):.4f}')

# Save the model
torch.save(model.state_dict(), 'resnet_model.pth')

# Evaluation function
def evaluate(model, dataloader):
    model.eval()
    correct = 0
    total = 0
    with torch.no_grad():
        for inputs, labels in dataloader:
            inputs, labels = inputs.to(device), labels.to(device)
            outputs = model(inputs)
            _, predicted = torch.max(outputs.data, 1)
            total += labels.size(0)
            correct += (predicted == labels).sum().item()
    return 100 * correct / total

# Evaluate on validation and test sets
valid_accuracy = evaluate(model, valid_loader)
test_accuracy = evaluate(model, test_loader)
print(f'Validation Accuracy: {valid_accuracy}%')
print(f'Test Accuracy: {test_accuracy}%')


