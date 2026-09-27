from pathlib import Path
import json

ROOT = Path(__file__).resolve().parent
PHOTOS = ROOT / "photos"
OUT = ROOT / "photos.js"
EXTS = {".jpg", ".jpeg", ".png", ".webp"}

files = sorted(p.name for p in PHOTOS.iterdir() if p.is_file() and p.suffix.lower() in EXTS)
OUT.write_text(
    "window.MEMORY_FILES = " + json.dumps(files, ensure_ascii=False, indent=2) + ";\n",
    encoding="utf-8"
)
print(f"Generated photos.js with {len(files)} images.")
