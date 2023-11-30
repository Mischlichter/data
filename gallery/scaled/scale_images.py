from PIL import Image
import os

input_folder = 'gallery/'
output_folder = 'gallery/scaled/'

if not os.path.exists(output_folder):
    os.makedirs(output_folder)

# Define the scaling factor (123.6%)
scaling_factor = 1.236

for filename in os.listdir(input_folder):
    if filename.endswith('.jpg') or filename.endswith('.png'):
        print(f"Processing file: {filename}")
        try:
            with Image.open(os.path.join(input_folder, filename)) as img:
                # Calculate the new dimensions based on the scaling factor
                new_width = int(img.width * scaling_factor)
                new_height = int(img.height * scaling_factor)

                # Resize the image while keeping the original dimensions
                img = img.resize((new_width, new_height), Image.LANCZOS)

                # Calculate the crop dimensions based on the golden ratio
                crop_top = int((new_height - img.height) * 0.382)  # 38.2% from the top
                crop_bottom = new_height - crop_top

                # Crop the image
                img = img.crop((0, crop_top, img.width, crop_bottom))

                # Resize the cropped image back to the original dimensions
                img = img.resize((img.width, img.height - crop_top - (new_height - img.height - crop_top)), Image.LANCZOS)

                new_filename = os.path.splitext(filename)[0] + '_scaled' + os.path.splitext(filename)[1]
                img.save(os.path.join(output_folder, new_filename))
                print(f"Saved scaled and cropped file: {new_filename}")
        except Exception as e:
            print(f"Error processing {filename}: {e}")
