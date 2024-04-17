import json
import os
from pathlib import Path
from datetime import datetime, timezone

def get_file_info():
    # Change the working directory to the repository root
    os.chdir(Path(__file__).parent.parent)  # Move up to the main directory
    base_path = Path('.')  # Now the base path is the root of your repository
    all_files = {}
    for path in base_path.rglob('*'):  # Recursively find all files and folders
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
    with open('index.json', 'w') as json_file:  # Make sure this path is correct relative to the script's new working directory
        json.dump(files_info, json_file, indent=4)

if __name__ == "__main__":
    main()
