import os
import xml.etree.ElementTree as ET
from urllib.parse import quote
from datetime import datetime

# Configuration
base_url = "https://www.hogeai.com/"  # Adjusted base URL of your site
docs_path = "./docs"  # Local path to the 'docs' directory relative to where the script is run
sitemap_path = "./docs/sitemap.xml"  # Path to save the sitemap in the docs directory

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
    print(f"Sitemap generated at {sitemap_path}")

if __name__ == "__main__":
    generate_sitemap(docs_path, base_url, sitemap_path)
