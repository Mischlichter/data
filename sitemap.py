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

    # Include specific HTML files from the provided list (these are relative to the root and should not be normalized with docs_path)
    with open(html_list_file, 'r') as file:
        html_files = file.readlines()
        html_files = [line.strip() for line in html_files]

    # Files from the list are directly added without any further normalization
    list_files = set(html_files)  # Files from the list are treated as relative to the root

    # Include files from directory scan and normalize them
    for subdir, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith(".html"):
                file_path = os.path.join(subdir, file)
                # Normalize file paths relative to the docs directory
                normalized_path = normalize_path(file_path, directory)
                list_files.add(normalized_path)

    # Create sitemap entries
    for relative_path in list_files:
        # Only normalize paths found by scanning the docs directory, not the ones from the list
        if not os.path.isabs(relative_path):  # Checking if it's already an absolute URL
            full_path = os.path.join(directory, relative_path)  # Full path to get last modified date
        else:
            full_path = relative_path

        last_modified = get_last_modified(full_path)
        url = ET.SubElement(urlset, "url")
        loc = ET.SubElement(url, "loc")

        # Handle URLs in the sharing folder separately
        if relative_path.startswith("sharing/"):
            full_url = base_url.rstrip('/') + '/' + quote(relative_path)
        else:
            # For everything else (e.g., index.html), place it under the root domain
            full_url = base_url.rstrip('/') + '/' + quote(relative_path)

        loc.text = full_url
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
