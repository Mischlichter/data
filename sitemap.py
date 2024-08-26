import sys
import os
import xml.etree.ElementTree as ET
from urllib.parse import quote
from datetime import datetime

# Configuration
base_url = "https://www.hogeai.com/"
docs_path = "./docs"
sitemap_path = "./docs/sitemap.xml"

def get_last_modified(file_path):
    """Get the last modified date of a file if it exists."""
    if os.path.exists(file_path):
        return datetime.fromtimestamp(os.path.getmtime(file_path))
    else:
        return datetime.now()  # Use current time if the file isn't found

def normalize_path(file_path, base_dir):
    """Normalize the file path by removing the base directory and returning relative path."""
    relative_path = file_path.replace(base_dir, "").lstrip('/')
    return relative_path

def generate_sitemap(directory, base_url, sitemap_path, html_list_file):
    """Generate the sitemap XML file, including specific HTML files."""
    urlset = ET.Element("urlset", xmlns="http://www.sitemaps.org/schemas/sitemap/0.9")

    # Read the specific HTML files from the provided list (these are relative to the root and should not include docs)
    with open(html_list_file, 'r') as file:
        html_files = file.readlines()
        html_files = [line.strip() for line in html_files]

    # Process the files from the list directly (no docs/ prefix)
    for html_file in html_files:
        url = ET.SubElement(urlset, "url")
        loc = ET.SubElement(url, "loc")
        full_url = base_url.rstrip('/') + '/' + quote(html_file)  # <-- This line changed to avoid docs/ prefix
        loc.text = full_url

        # Get last modified date for these files if they exist in the docs folder
        full_path = os.path.join(directory, html_file)
        last_modified = get_last_modified(full_path)
        lastmod = ET.SubElement(url, "lastmod")
        lastmod.text = last_modified.strftime("%Y-%m-%d")

    # Scan through the docs folder and add any other .html files
    for subdir, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith(".html"):
                file_path = os.path.join(subdir, file)
                relative_path = normalize_path(file_path, directory)
                if relative_path not in html_files:  # Skip files already in the list
                    url = ET.SubElement(urlset, "url")
                    loc = ET.SubElement(url, "loc")
                    full_url = base_url.rstrip('/') + '/' + quote(relative_path)
                    loc.text = full_url

                    last_modified = get_last_modified(file_path)
                    lastmod = ET.SubElement(url, "lastmod")
                    lastmod.text = last_modified.strftime("%Y-%m-%d")

    # Write the final sitemap
    tree = ET.ElementTree(urlset)
    tree.write(sitemap_path, xml_declaration=True, encoding='utf-8', method="xml")
    print(f"Sitemap generated at {sitemap_path}")

if __name__ == "__main__":
    html_list_file = sys.argv[1] if len(sys.argv) > 1 else ""
    if html_list_file:
        generate_sitemap(docs_path, base_url, sitemap_path, html_list_file)
