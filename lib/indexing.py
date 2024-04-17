import json
import os
from pathlib import Path
from datetime import datetime, timezone

def get_file_info():
    all_files = {}
    for path in Path('.').rglob('*'):
        if path.is_file():
            # Ensures the file path is relative to the current directory
            rel_path = os.path.relpath(path, start=Path('.'))
            all_files[rel_path] = datetime.fromtimestamp(path.stat().st_mtime, timezone.utc).strftime('%Y-%m-%d %H:%M:%S')
    return all_files

def main():
    files_info = get_file_info()
    # Directly write to 'index.json' assuming the current directory is correct
    with open('index.json', 'w') as json_file:
        json.dump(files_info, json_file, indent=2)

if __name__ == "__main__":
    main()
