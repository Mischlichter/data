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
                original_width, original_height = img.size
                new_width = int(original_width * 1.236)  # 123.6% of original width
                new_height = int(original_height * 1.236)  # 123.6% of original height

                # Calculate cropping box to center the content
                left = (new_width - original_width) // 2
                top = (new_height - original_height) // 2
                right = (new_width + original_width) // 2
                bottom = (new_height + original_height) // 2

                # Crop and resize the image
                img = img.crop((left, top, right, bottom))
                img = img.resize((new_width, new_height), Image.ANTIALIAS)

                # Save the image with '_scaled' appended to the filename
                new_filename = os.path.splitext(filename)[0] + '_scaled' + os.path.splitext(filename)[1]
                img.save(os.path.join(output_folder, new_filename))
                print(f"Saved scaled file: {new_filename}")
        except Exception as e:
            print(f"Error processing {filename}: {e}")
