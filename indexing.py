import json
import os
from pathlib import Path
from datetime import datetime, timezone

def get_file_info(existing_index):
    base_path = Path('.')  # This is the root of the repository
    all_files = {}
    for path in base_path.rglob('*'):  # Recursively find all files
        if path.is_file():
            # Skip the script itself and index.json to avoid recursion issues
            if path.name not in ['indexing.py', 'index.json']:
                rel_path = str(path.relative_to(base_path))
                mod_time = datetime.fromtimestamp(path.stat().st_mtime, timezone.utc).strftime('%Y-%m-%d %H:%M:%S')
                # Update the modification time if it's a new file or the file has been modified
                if rel_path not in existing_index or existing_index[rel_path] != mod_time:
                    all_files[rel_path] = mod_time
                else:
                    # Keep existing modification time for unchanged files
                    all_files[rel_path] = existing_index[rel_path]
    return all_files

def main():
    index_path = 'index.json'
    if os.path.exists(index_path):
        with open(index_path, 'r') as json_file:
            existing_index = json.load(json_file)
    else:
        existing_index = {}

    files_info = get_file_info(existing_index)

    # Remove entries for deleted files
    files_info = {key: val for key, val in files_info.items() if Path(key).exists()}

    with open(index_path, 'w') as json_file:
        json.dump(files_info, json_file, indent=4)

if __name__ == "__main__":
    main()
