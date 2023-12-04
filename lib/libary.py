import os
import json
import subprocess

def extract_specific_metadata(image_path):
    try:
        result = subprocess.run(['exiftool', '-FileName', '-Directory', '-Description', '-Model', '-Creator', image_path], capture_output=True, text=True)
        metadata = result.stdout.splitlines()
        
        # Extracting the numeric part from the file name as Seed
        file_name = metadata[0].split(": ")[-1]
        seed = ''.join(filter(str.isdigit, file_name))
        
        metadata_dict = {
            "File Name": file_name,
            "Directory": metadata[1].split(": ")[-1],
            "Prompt": metadata[2].split(": ")[-1],  # Changed "Description" to "Prompt"
            "Model": metadata[3].split(": ")[-1],
            "Creator": metadata[4].split(": ")[-1],
            "Seed": seed  # Added "Seed" category
        }
        return metadata_dict
    except Exception as e:
        print(f"Error extracting metadata for {image_path}: {e}")
        return None

def update_metadata_json(metadata, json_file):
    with open(json_file, 'w') as file:
        json.dump(metadata, file, indent=4)  # Use indent=4 for better formatting

def main():
    base_path = os.path.dirname(os.path.dirname(os.path.realpath(__file__)))
    gallery_path = os.path.join(base_path, 'gallerycom')
    # Inside libary.py
    json_file_path = os.path.join(base_path, 'lib/metadata.json')

    # Load existing metadata
    if os.path.exists(json_file_path):
        with open(json_file_path, 'r') as file:
            existing_metadata = json.load(file)
    else:
        existing_metadata = {}

    # Process only new images
    for image in os.listdir(gallery_path):
        if image.lower().endswith(('.jpg', '.jpeg')) and image not in existing_metadata:
            image_path = os.path.join(gallery_path, image)
            image_metadata = extract_specific_metadata(image_path)
            if image_metadata:
                existing_metadata[image] = image_metadata

    update_metadata_json(existing_metadata, json_file_path)

if __name__ == "__main__":
    main()
