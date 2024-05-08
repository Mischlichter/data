import os
import xml.etree.ElementTree as ET
from urllib.parse import quote
from datetime import datetime

# Configuration
base_url = "https://www.hogeai.com/"  # Adjusted base URL of your site
docs_path = "./docs"  # Local path to the 'docs' directory relative to where the script is run
sitemap_path = "./sitemap.xml"  # Path to save the sitemap

def get_last_modified(file_path):
    """Get the last modified date of a file."""
    return datetime.fromtimestamp(os.path.getmtime(file_path))

def generate_sitemap(directory, base_url, sitemap_path):
    """Generate the sitemap XML file."""
    urlset = ET.Element("urlset", xmlns="http://www.sitemaps.org/schemas/sitemap/0.9")
    for subdir, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith(".html"):
                file_path = os.path.join(subdir, file)
                last_modified = get_last_modified(file_path)
                url = ET.SubElement(urlset, "url")
                loc = ET.SubElement(url, "loc")
                loc.text = base_url + quote(file_path.replace(directory, "").lstrip('/'))
                lastmod = ET.SubElement(url, "lastmod")
                lastmod.text = last_modified.strftime("%Y-%m-%d")

    tree = ET.ElementTree(urlset)
    tree.write(sitemap_path, xml_declaration=True, encoding='utf-8', method="xml")

if __name__ == "__main__":
    # Check if the sitemap file exists
    if not os.path.exists(sitemap_path):
        print("Sitemap file does not exist. Generating a new one.")
        generate_sitemap(docs_path, base_url, sitemap_path)
    else:
        # Check if any HTML files have been modified since the last sitemap generation
        last_sitemap_modification = get_last_modified(sitemap_path)
        for subdir, dirs, files in os.walk(docs_path):
            for file in files:
                if file.endswith(".html"):
                    file_path = os.path.join(subdir, file)
                    if get_last_modified(file_path) > last_sitemap_modification:
                        print(f"Detected changes in '{file_path}'. Updating sitemap.")
                        generate_sitemap(docs_path, base_url, sitemap_path)
                        break
        else:
            print("No changes detected. Sitemap is up to date.")
