import json
import os
from pathlib import Path
from datetime import datetime, timezone

def get_file_info():
    # Change the working directory to the repository root
    os.chdir(Path(__file__).resolve().parent.parent)  # Navigate up two levels to the root
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
    # Change path if needed depending on where you want the index.json to be stored
    with open('index.json', 'w') as json_file:
        json.dump(files_info, json_file, indent=4)

if __name__ == "__main__":
    main()
