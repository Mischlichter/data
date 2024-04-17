import json
import os
from pathlib import Path
from datetime import datetime, timezone

def get_file_info():
    base_path = Path('.')  # Assuming the script runs at the root of your local repo clone
    all_files = {}
    for path in base_path.rglob('*'):  # Using rglob to recursively find all files
        # Check if it's a directory and include it even if it's empty
        if path.is_dir():
            dir_path = str(path.relative_to(base_path)) + '/'
            all_files[dir_path] = {}
        elif path.is_file():
            file_path = str(path.relative_to(base_path))
            mod_time = datetime.fromtimestamp(path.stat().st_mtime, timezone.utc).strftime('%Y-%m-%d %H:%M:%S')
            all_files[file_path] = mod_time

    return all_files

def main():
    files_info = get_file_info()
    with open('index.json', 'w') as json_file:
        json.dump(files_info, json_file, indent=4)  # Using indent for better readability

if __name__ == "__main__":
    main()
