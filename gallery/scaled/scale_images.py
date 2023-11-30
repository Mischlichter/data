from PIL import Image
import os

input_folder = 'gallery/'
output_folder = 'gallery/scaled/'

if not os.path.exists(output_folder):
    os.makedirs(output_folder)

for filename in os.listdir(input_folder):
    if filename.endswith('.jpg') or filename.endswith('.png'):
        print(f"Processing file: {filename}")
        try:
            with Image.open(os.path.join(input_folder, filename)) as img:
                # Calculate new dimensions
                new_width = int(img.width * 1.236)  # Scale up to 123.6%
                new_height = int(img.height * 1.236)

                # Crop the center to maintain original dimensions
                left = (new_width - img.width) // 2
                top = (new_height - img.height) // 2
                right = (new_width + img.width) // 2
                bottom = (new_height + img.height) // 2

                img = img.resize((new_width, new_height), Image.LANCZOS)
                img = img.crop((left, top, right, bottom))

                new_filename = os.path.splitext(filename)[0] + '_scaled' + os.path.splitext(filename)[1]
                img.save(os.path.join(output_folder, new_filename))
                print(f"Saved scaled file: {new_filename}")
        except Exception as e:
            print(f"Error processing {filename}: {e}")
