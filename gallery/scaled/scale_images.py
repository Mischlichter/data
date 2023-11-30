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
                # Assuming new_width, new_height, img.width, and img.height are defined

                # Horizontal center remains the same
                left = (new_width - img.width) // 2
                right = (new_width + img.width) // 2


                vertical_shift = 0.618
                vertical_center = new_height * vertical_shift
                 vertical_offset = img.height // 2

                top = int(vertical_center - vertical_offset)
                bottom = int(vertical_center + vertical_offset)



                img = img.resize((new_width, new_height), Image.LANCZOS)
                img = img.crop((left, top, right, bottom))

                new_filename = os.path.splitext(filename)[0] + '_scaled' + os.path.splitext(filename)[1]
                img.save(os.path.join(output_folder, new_filename))
                print(f"Saved scaled file: {new_filename}")
        except Exception as e:
            print(f"Error processing {filename}: {e}")
