"""Storage selector: local disk for dev, S3 for cloud.

STORAGE_BACKEND=local (default) -> LocalStorage under LOCAL_UPLOAD_DIR
STORAGE_BACKEND=s3             -> S3Storage with IAM role (EC2) / env creds
"""
from pathlib import Path

from flask import current_app

from app.storage.local_storage import LocalStorage

_s3_instance = None


def get_storage():
    backend = current_app.config.get("STORAGE_BACKEND", "local")
    if backend == "s3":
        global _s3_instance
        if _s3_instance is None:
            from app.storage.s3_storage import S3Storage

            _s3_instance = S3Storage(
                bucket=current_app.config.get("S3_BUCKET", ""),
                region=current_app.config.get("S3_REGION", ""),
                prefix=current_app.config.get("S3_PREFIX", "study-files/"),
            )
        return _s3_instance
    base = Path(current_app.instance_path).parent / current_app.config.get(
        "LOCAL_UPLOAD_DIR", "uploads"
    )
    return LocalStorage(base)
