import os
import xml.etree.ElementTree as ET
from urllib.parse import quote

# Configuration
base_url = "https://www.hogeai.com/"  # Adjusted base URL of your site
docs_path = "./docs"  # Local path to the 'docs' directory relative to where the script is run
sitemap_path = "./docs/sitemap.xml"  # Path to save the sitemap

def generate_sitemap(directory, base_url):
    urlset = ET.Element("urlset", xmlns="http://www.sitemaps.org/schemas/sitemap/0.9")
    for subdir, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith(".html"):
                url = ET.SubElement(urlset, "url")
                loc = ET.SubElement(url, "loc")
                file_path = os.path.join(subdir, file).replace(directory, "").lstrip('/')
                loc.text = base_url + quote(file_path)
                lastmod = ET.SubElement(url, "lastmod")
                lastmod.text = "2024-01-01"  # This should ideally be the actual last modification date of the file

    tree = ET.ElementTree(urlset)
    tree.write(sitemap_path, xml_declaration=True, encoding='utf-8', method="xml")

if __name__ == "__main__":
    generate_sitemap(docs_path, base_url)
    print(f"Sitemap generated at {sitemap_path}")
