import json
import os
from pathlib import Path
from datetime import datetime, timezone

def get_file_info():
    base_path = Path('.')  # This is the root of the repository
    all_files = {}
    for path in base_path.rglob('*'):  # Recursively find all files
        if path.is_file():
            # Skip the script itself and index.json to avoid recursion issues
            if path.name not in ['indexing.py', 'index.json']:
                rel_path = str(path.relative_to(base_path))
                mod_time = datetime.fromtimestamp(path.stat().st_mtime, timezone.utc).strftime('%Y-%m-%d %H:%M:%S')
                all_files[rel_path] = mod_time
    return all_files

def main():
    files_info = get_file_info()
    with open('index.json', 'w') as json_file:
        json.dump(files_info, json_file, indent=4)

if __name__ == "__main__":
    main()
