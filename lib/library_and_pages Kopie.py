import os
import json
import subprocess
import time

def extract_specific_metadata(image_path):
    try:
        result = subprocess.run(['exiftool', '-FileName', '-Directory', '-Description', '-Model', '-Creator', image_path], capture_output=True, text=True)
        metadata = result.stdout.splitlines()
        
        file_name = metadata[0].split(": ")[-1]
        seed = ''.join(filter(str.isdigit, file_name))
        
        metadata_dict = {
            "File Name": file_name,
            "Directory": metadata[1].split(": ")[-1],
            "Prompt": metadata[2].split(": ")[-1],
            "Model": metadata[3].split(": ")[-1],
            "Creator": metadata[4].split(": ")[-1],
            "Seed": seed
        }
        return metadata_dict
    except Exception as e:
        print(f"Error extracting metadata for {image_path}: {e}")
        return None



def update_metadata_json(metadata, json_file):
    with open(json_file, 'w') as file:
        json.dump(metadata, file, indent=4)

def generate_html_page(metadata, output_dir, image_path):
    html_template = '''
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>{title}</title>
        <meta name="description" content="{description}">
        <meta property="og:title" content="{title}" />
        <meta property="og:description" content="{description}" />
        <meta property="og:image" content="{image_url}" />
        <meta property="og:type" content="website" />
        <style>
            @font-face {{
                font-family: 'JetBrainsMono-Regular';
                src: url('https://raw.githubusercontent.com/Mischlichter/data/main/docs/fonts/JetBrainsMono-Regular.woff2') format('woff2');
                font-weight: 400;
                font-style: normal;
            }}

            body {{
                font-family: 'JetBrainsMono-Regular', sans-serif;
                background-color: black;
                color: #7cfc05;
                margin: 0;
                padding: 0;
                overflow: auto;
            }}

            .container {{
                display: flex;
                align-items: center;
                justify-content: center;
                flex-direction: column;
                max-width: 30%; /* Set max-width to 50% */
                margin: 0 auto; /* Center-align the container horizontally */
            }}

            .metadata {{
                margin-top: 20px;
                width: 100%; /* Set width to 100% to match the container width */
                text-align: left; /* Align metadata text to the left */
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <img src="{image_url}" alt="{description}" style="max-width: 100%; height: auto;">
            <div class="metadata">
                <p><strong>Title:</strong> {title}</p>
                <p><strong>Seed:</strong> {seed}</p>
                <p><strong>Creator:</strong> @{creator}</p>
                <p><strong>Created with:</strong> HogeAI</p>
            </div>
        </div>
    </body>
    </html>
    '''

    title = metadata.get("Prompt", "No Title")
    description = f"Created by {metadata.get('Creator', 'Unknown')} using {metadata.get('Model', 'Unknown Model')}"
    image_url = f'https://github.com/Mischlichter/data/raw/main/gallerycom/{os.path.basename(image_path)}'
    seed = metadata.get("Seed", "Unknown")  # Extracting seed from metadata
    creator = metadata.get("Creator", "Unknown")  # Extracting creator from metadata

    html_content = html_template.format(
        title=title, 
        description=description, 
        image_url=image_url,
        seed=seed,
        creator=creator  # Add creator here
    )
    
    output_path = os.path.join(output_dir, metadata["Seed"] + ".html")
    
    with open(output_path, "w") as file:
        file.write(html_content)

def main():
    base_path = os.path.dirname(os.path.dirname(os.path.realpath(__file__)))
    gallery_path = os.path.join(base_path, 'gallerycom')
    html_output_dir = os.path.join(base_path, 'docs/sharing')
    json_file_path = os.path.join(base_path, 'lib/metadata.json')

    if not os.path.exists(html_output_dir):
        os.makedirs(html_output_dir)

    existing_metadata = {}

    if os.path.exists(json_file_path):
        with open(json_file_path, 'r') as file:
            try:
                existing_metadata = json.load(file)
            except json.JSONDecodeError as e:
                print(f"Error loading JSON data: {e}")

    if not existing_metadata:  # Check if JSON is empty or doesn't exist
        for image in os.listdir(gallery_path):
            if image.lower().endswith(('.jpg', '.jpeg')):
                image_path = os.path.join(gallery_path, image)
                image_metadata = extract_specific_metadata(image_path)
                if image_metadata:
                    existing_metadata[image] = image_metadata

        update_metadata_json(existing_metadata, json_file_path)

    for image_name, metadata in existing_metadata.items():
        image_path = os.path.join(gallery_path, image_name)
        generate_html_page(metadata, html_output_dir, image_path)
                
  

if __name__ == "__main__":
    main()