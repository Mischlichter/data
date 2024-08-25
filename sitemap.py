import sys
import os
import xml.etree.ElementTree as ET
from urllib.parse import quote
from datetime import datetime

# Configuration
base_url = "https://www.hogeai.com/sharing/"
docs_path = "./docs"
sitemap_path = "./docs/sitemap.xml"

def get_last_modified(file_path):
    """Get the last modified date of a file if it exists."""
    if os.path.exists(file_path):
        return datetime.fromtimestamp(os.path.getmtime(file_path))
    else:
        return datetime.now()  # Use current time if the file isn't found

def generate_sitemap(directory, base_url, sitemap_path, html_list_file):
    """Generate the sitemap XML file, including specific HTML files."""
    urlset = ET.Element("urlset", xmlns="http://www.sitemaps.org/schemas/sitemap/0.9")

    # Include specific HTML files
    with open(html_list_file, 'r') as file:
        html_files = file.readlines()
        html_files = [line.strip() for line in html_files]

    # Include files from directory scan and ensure all specified files are considered
    all_files = set(os.path.join(directory, f) for f in html_files)
    for subdir, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith(".html"):
                file_path = os.path.join(subdir, file)
                all_files.add(file_path)

    # Create sitemap entries
    for file_path in all_files:
        last_modified = get_last_modified(file_path)
        url = ET.SubElement(urlset, "url")
        loc = ET.SubElement(url, "loc")

        # Get the relative path without 'docs' and avoid double '/sharing/'
        relative_path = file_path.replace(directory, "").lstrip('/')
        
        # If the relative path already starts with 'sharing/', don't add it again
        if relative_path.startswith("sharing/"):
            full_url = base_url.rstrip('/') + '/' + quote(relative_path[len("sharing/"):])
        else:
            full_url = base_url + quote(relative_path)

        loc.text = full_url
        lastmod = ET.SubElement(url, "lastmod")
        lastmod.text = last_modified.strftime("%Y-%m-%d")

    tree = ET.ElementTree(urlset)
    tree.write(sitemap_path, xml_declaration=True, encoding='utf-8', method="xml")
    print(f"Sitemap generated at {sitemap_path}")

if __name__ == "__main__":
    html_list_file = sys.argv[1] if len(sys.argv) > 1 else ""
    if html_list_file:
        generate_sitemap(docs_path, base_url, sitemap_path, html_list_file)
