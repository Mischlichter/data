import json
import os
from pathlib import Path
from datetime import datetime

def get_file_info():
    all_files = {}
    for path in Path('.').rglob('*'):
        if path.is_file() and not path.parts[0] in ['docs', 'gallerycom', 'lib']:
            all_files[str(path)] = datetime.utcfromtimestamp(path.stat().st_mtime).strftime('%Y-%m-%d %H:%M:%S')
    return all_files

def main():
    files_info = get_file_info()
    with open('lib/index.json', 'w') as json_file:  # Save in the lib folder
        json.dump(files_info, json_file, indent=2)

if __name__ == "__main__":
    main()
