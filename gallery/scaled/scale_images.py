from PIL import Image
import os

input_folder = 'gallery/'
output_folder = 'gallery/scaled/'

if not os.path.exists(output_folder):
    os.makedirs(output_folder)

for filename in os.listdir(input_folder):
    if filename.endswith('.jpg') or filename.endswith('.png'):
        with Image.open(os.path.join(input_folder, filename)) as img:
            # Calculate new dimensions
            new_width = int(img.width * 0.236)
            new_height = int(img.height * 0.236)

            # Resize and save the image with '_scaled' appended to the filename
            img = img.resize((new_width, new_height), Image.ANTIALIAS)
            new_filename = os.path.splitext(filename)[0] + '_scaled' + os.path.splitext(filename)[1]
            img.save(os.path.join(output_folder, new_filename))
