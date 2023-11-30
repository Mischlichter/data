from PIL import Image
import os

input_folder = 'gallery/'
output_folder = 'gallery/scaled/'

if not os.path.exists(output_folder):
    os.makedirs(output_folder)

scaling_factor = 1.236  # Scale factor
golden_ratio = 0.618  # Golden ratio

for filename in os.listdir(input_folder):
    if filename.endswith('.jpg') or filename.endswith('.png'):
        print(f"Processing file: {filename}")
        try:
            with Image.open(os.path.join(input_folder, filename)) as img:
                original_width, original_height = img.size

                # Scale the image
                scaled_width = int(original_width * scaling_factor)
                scaled_height = int(original_height * scaling_factor)
                img = img.resize((scaled_width, scaled_height), Image.LANCZOS)

                # Calculate the vertical center for cropping
                vertical_center = int(scaled_height * golden_ratio)

                # Calculate top and bottom coordinates for cropping
                top = max(0, vertical_center - original_height // 2)
                bottom = min(scaled_height, top + original_height)

                # Ensure the crop dimensions are within the image boundaries
                if bottom > scaled_height:
                    bottom = scaled_height
                    top = bottom - original_height

                # Crop the image
                img = img.crop((0, top, original_width, bottom))

                # Save the processed image
                new_filename = os.path.splitext(filename)[0] + '_scaled' + os.path.splitext(filename)[1]
                img.save(os.path.join(output_folder, new_filename))
                print(f"Saved scaled file: {new_filename}")
        except Exception as e:
            print(f"Error processing {filename}: {e}")
