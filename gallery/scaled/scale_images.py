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

                # Resize the image
                img = img.resize((new_width, new_height), Image.LANCZOS)

                # Adjust the vertical center to 61.8%
                golden_ratio = 0.618
                vertical_center = int(new_height * golden_ratio)

                # Calculate top and bottom coordinates for cropping
                top = max(vertical_center - img.height // 2, 0)
                bottom = top + img.height

                # Ensure the crop dimensions are within the image boundaries
                if bottom > new_height:
                    bottom = new_height
                    top = bottom - img.height

                # Crop the image
                img = img.crop((0, top, img.width, bottom))

                # Save the processed image
                new_filename = os.path.splitext(filename)[0] + '_scaled' + os.path.splitext(filename)[1]
                img.save(os.path.join(output_folder, new_filename))
                print(f"Saved scaled file: {new_filename}")
        except Exception as e:
            print(f"Error processing {filename}: {e}")
