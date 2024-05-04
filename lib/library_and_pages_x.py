import os
import json
import subprocess
import time
from PIL import Image

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

def generate_favicon(image_path, output_dir, seed, size=(64, 64)):
    print(f"Attempting to generate favicon for: {image_path}")
    try:
        with Image.open(image_path) as img:
            img.thumbnail(size, Image.Resampling.LANCZOS)
            favicon_filename = f'{seed}_favicon.ico'
            favicon_path = os.path.join(output_dir, favicon_filename)
            img.save(favicon_path, format='ICO', sizes=[size])
            print(f"Favicon successfully saved at: {favicon_path}")
            return favicon_filename
    except Exception as e:
        print(f"Error creating favicon for {image_path}: {e}")
        return None



def generate_html_page(metadata, output_dir, image_path):
    seed = metadata.get("Seed", "Unknown")
    favicon_filename = generate_favicon(image_path, output_dir, seed)
    favicon_url = favicon_filename if favicon_filename else ''

    html_template = '''
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="format-detection" content="telephone=no">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>{title}</title>
        <link rel="icon" href="{favicon_url}" type="image/x-icon">
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:title" content="Created with HogeAI">
        <meta name="twitter:description" content="{description}">
        <meta name="twitter:image" content="{image_url}">
        <style>
            @font-face {{
                font-family: 'JetBrainsMono-Bold';
                src: url('fonts/JetBrainsMono-Bold.woff2') format('woff2'), /* Modern Browsers */
                     url('fonts/JetBrainsMono-Bold.ttf') format('truetype'); /* Safari, Android, iOS */
            
                font-style: normal;
            }}

            body {{
                font-family: 'JetBrainsMono-Bold', sans-serif;
                background-color: black;
                color: #00ffcc;
                margin: 0;
                padding: 0;
                overflow: hidden; /* Hide any potential scrollbars */
                background-image: url(''); /* Placeholder for initial background image */
                background-repeat: repeat; /* Allow the background to tile vertically and horizontally */
                background-size: auto calc(100vh * 0.92); /* Scale the image to 92% of the viewport height */
                background-position: center top; /* Center the background image horizontally and align top */
                opacity: 0; /* Start fully transparent */
                transition: opacity 1.11s ease-in-out;
            }}

            html {{
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale;
                         
            }}

            .container {{
                display: flex;
                align-items: center;
                justify-content: center;
                flex-direction: column;
                margin: 0 auto;
                padding: 0 20px; /* Removed padding top and bottom */
                height: 100vh; /* Set container height to 90% of viewport height */
                width: 100vh; /* Set container width to 90% of viewport height */
                max-width: 80vw; /* Limit the maximum width of the container */
            }}

            .frame {{
                border: 2px solid #00ffcc;
                border-radius: 20px;
                overflow: hidden;
                width: 80%;
                height: 80%;
                margin-top: 5vh; /* Changed margin top to 5% of viewport height */
                position: relative; /* Allows absolute positioning inside */
                box-sizing: border-box;
                height: auto; /* Allow the height to adjust based on content */
            }}

            @media screen and (orientation: portrait) {{
                .frame {{
                    width: 111%;
                }}
            }}

            .image-frame img {{
                display: block;
                width: calc(100% + 4px);
                height: auto;
                position: relative;
                left: -2px;
                top: -2px;
            }}

            .text-frame {{
                position: absolute;
                bottom: -2px; /* Move the frame 2 pixels down */
                left: 50%; /* Aligns the left edge of the frame to the center */
                transform: translate(-50%, 0); /* Moves the frame back by half of its width */
                width: calc(100% + 4px); /* Increase width by 4 pixels on each side */
                background-color: rgba(0, 0, 0, 0.8);
                padding: 10px 20px;
                text-align: left; /* Left align text */
                font-size: 1em;
                max-height: calc(100vh - 10vh); /* Set max-height relative to viewport height */
                overflow-y: auto; /* Enable vertical scrollbar if needed */
                opacity: 0;
                transition: visibility 0s linear 500ms, opacity 250ms ease; /* Ensure visibility transitions out after opacity */
            }}

            .seed-creator {{
                text-align: center; /* Center align Seed and Creator */
            }}

            .link {{
                display: block;
                width: fit-content;
                margin: 5vh auto; /* Changed margin top and bottom to 5% of viewport height */
                font-size: 1em;
                color: #00ffcc;
                text-decoration: none;
                border: 2px solid #00ffcc;
                border-radius: 20px;
                padding: 5px 10px;
                background-color: black;
            }}
        </style>

    </head>
    <body>
        <div class="container">
            <div class="frame image-frame">
                <img src="{image_url}" alt="{description}">
                <div class="frame text-frame">
                    <p><strong>Prompt:</strong> {prompt} </p>
                    <div class="seed-creator">
                        <p><strong>Seed:</strong> {seed} | <strong>Creator:</strong> {creator}</p>
                    </div>
                </div>
            </div>
            <a href="https://hogeai.com" class="link">Visit HOGEAI</a>
        </div>
        <script>
            //<![CDATA[

            document.addEventListener('DOMContentLoaded', function() {{
                const imageFrame = document.querySelector('.image-frame');
                const textFrame = document.querySelector('.text-frame');

                function manageVisibility(visible) {{
                    if (visible) {{
                        textFrame.style.visibility = 'visible';
                        textFrame.style.opacity = 1;
                        textFrame.style.display = 'block'; // Ensure text frame is visible before adjusting font size
                    }} else {{
                        textFrame.style.opacity = 0;
                        textFrame.addEventListener('transitionend', function() {{
                            if (textFrame.style.opacity === '0') {{
                                textFrame.style.visibility = 'hidden';
                                textFrame.style.display = 'none'; // Hide the text frame to avoid interaction when invisible
                            }}
                        }}, {{ once: true }});
                    }}
                }}

                // Event listeners for mouse enter and leave
                imageFrame.addEventListener('mouseenter', () => manageVisibility(true));
                imageFrame.addEventListener('mouseleave', () => manageVisibility(false));

                // Handle touch events separately
                imageFrame.addEventListener('touchstart', function() {{
                    // Toggle visibility based on the current opacity state
                    const isVisible = textFrame.style.opacity === '1';
                    manageVisibility(!isVisible);
                }});
            }});

            function setRandomBackground() {{
                const imageNumber = Math.floor(Math.random() * 50) + 1;
                const imageUrl = `https://github.com/Mischlichter/data/raw/main/sharingbgs/${{String(imageNumber).padStart(2, '0')}}.png`;

                    // Create a new Image object
                const bgImage = new Image();
                bgImage.onload = function() {{
                        // Set the background image when it is fully loaded
                    document.body.style.backgroundImage = `url('${{imageUrl}}')`;
                        // Fade in the background after it is loaded
                    document.body.style.opacity = 1;
                }};
                
                bgImage.src = imageUrl; // Start loading the image
            }}

            setRandomBackground();

            window.addEventListener('load', function() {{
                document.body.style.opacity = 1; // Fade-in effect when page is fully loaded
            }});

            function setupTextFrameSizeControl() {{
                const textFrame = document.querySelector('.text-frame');
                let originalFontSize = parseFloat(window.getComputedStyle(textFrame, null).getPropertyValue('font-size')); // Capture original font size

                function adjustFontSize() {{
                    if (textFrame.style.visibility === 'hidden') {{
                        return; // Skip adjustments if textFrame is not visible
                    }}

                    let currentHeight = textFrame.clientHeight;
                    let maxWidth = textFrame.clientWidth;
                    let maxHeight = maxWidth * 0.85; // Calculate 85% of width
                    let fontSize = parseFloat(window.getComputedStyle(textFrame, null).getPropertyValue('font-size'));

                    // Reduce font size if necessary
                    while (currentHeight > maxHeight && fontSize > 1) {{
                        fontSize -= 0.5;
                        textFrame.style.fontSize = fontSize + 'px';
                        currentHeight = textFrame.clientHeight;
                    }}

                    // Attempt to increase font size back to original or max allowed
                    if (currentHeight < maxHeight && fontSize < originalFontSize) {{
                        fontSize = originalFontSize; // Try setting back to original
                        textFrame.style.fontSize = fontSize + 'px';
                        if (textFrame.clientHeight > maxHeight) {{ // Check if original is too large
                            // Decrease gradually if original font size exceeds the max height
                            while (textFrame.clientHeight > maxHeight && fontSize > 1) {{
                                fontSize -= 0.5;
                                textFrame.style.fontSize = fontSize + 'px';
                            }}
                        }}
                    }}
                }}


                // Set event listeners for showing the text frame
                const imageFrame = document.querySelector('.image-frame');
                imageFrame.addEventListener('mouseenter', function() {{
                    textFrame.style.display = 'block'; // Ensure text frame is visible

                    adjustFontSize(); // Adjust font size immediately after showing the text frame
                }});

                imageFrame.addEventListener('mouseleave', function() {{


                }});

                // Listen for window resize events to adjust font size
                window.addEventListener('resize', adjustFontSize);

                // Initial font size adjustment on load
                adjustFontSize(); // Directly call to set the initial size based on the current window size
            }};

            window.addEventListener('load', function() {{
            setupTextFrameSizeControl(); // Assuming this function encapsulates your font size adjustments
            }});


            //]]>
        
        </script>




    </body>
    </html>

    '''
    
    title = "Created with HogeAI"
    prompt = metadata.get("Prompt", "No Description Available")
    description = f"Created by {metadata.get('Creator', 'Unknown')} using HogeAI BOT"
    image_url = f'https://github.com/Mischlichter/data/raw/main/gallerycom/{os.path.basename(image_path)}'
    seed = metadata.get("Seed", "Unknown")  # Extracting seed from metadata
    creator = metadata.get("Creator", "Unknown")  # Extracting creator from metadata
    
    
    html_content = html_template.format(
        title=title, 
        description=description, 
        image_url=image_url,
        prompt=prompt,
        seed=seed,
        creator=creator,
        favicon_url=favicon_url  # Add favicon URL to the format method
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

    # Load existing metadata from JSON
    if os.path.exists(json_file_path) and os.path.getsize(json_file_path) > 0:
        with open(json_file_path, 'r') as file:
            existing_metadata = json.load(file)
    else:
        existing_metadata = {}

    # Scan gallery directory for images and update metadata if needed
    for image in os.listdir(gallery_path):
        if image.lower().endswith(('.jpg', '.jpeg')):
            image_path = os.path.join(gallery_path, image)
            image_metadata = extract_specific_metadata(image_path)
            if image_metadata:
                # Check if the image is already in metadata and if it has been updated
                if image not in existing_metadata or existing_metadata[image] != image_metadata:
                    existing_metadata[image] = image_metadata
                    # Generate HTML page for updated metadata
                    output_html_path = os.path.join(html_output_dir, image_metadata["Seed"] + ".html")
                    if not os.path.exists(output_html_path):
                        generate_html_page(image_metadata, html_output_dir, image_path)

    # Update JSON file with new metadata
    with open(json_file_path, 'w') as file:
        json.dump(existing_metadata, file, indent=4)

if __name__ == "__main__":
    main()