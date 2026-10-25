"""Local-disk storage for study-file bytes."""
from pathlib import Path

from flask import current_app

from app.storage.local_storage import LocalStorage

def get_storage():
    base = Path(current_app.instance_path).parent / current_app.config.get(
        "LOCAL_UPLOAD_DIR", "uploads"
    )
    return LocalStorage(base)
