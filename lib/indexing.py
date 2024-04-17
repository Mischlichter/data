import json
import os
from pathlib import Path
from datetime import datetime, timezone

def get_file_info():
    # Change the working directory to the repository root
    os.chdir(Path(__file__).resolve().parent.parent)  # Assuming script is in repo/lib/
    base_path = Path('.')  # This now refers to the repository root
    all_files = {}
    for path in base_path.rglob('*'):
        if path.is_file():
            rel_path = str(path.relative_to(base_path))
            mod_time = datetime.fromtimestamp(path.stat().st_mtime, timezone.utc).strftime('%Y-%m-%d %H:%M:%S')
            all_files[rel_path] = mod_time
    return all_files

def main():
    files_info = get_file_info()
    with open('index.json', 'w') as json_file:  # Path relative to script location in lib/
        json.dump(files_info, json_file, indent=4)

if __name__ == "__main__":
    main()
