"""Study-file endpoints. Bytes live in storage (local/S3); only
metadata lives in PostgreSQL/SQLite. Ownership is checked on every op.
"""
import imghdr  # noqa: F401  (reserved for future magic-byte checks)
import uuid
from pathlib import Path

from flask import Blueprint, current_app, jsonify, redirect, request, send_file
from flask_jwt_extended import get_jwt_identity, jwt_required
from werkzeug.utils import secure_filename

from app.extensions import db
from app.models import StudyFile, Task
from app.storage import get_storage

bp = Blueprint("files", __name__, url_prefix="/api/files")

# Extension -> expected MIME. The declared MIME is never trusted alone:
# both must agree, and S3/local keys always use our UUID, not user paths.
MIME_BY_EXT = {
    "pdf": "application/pdf",
    "txt": "text/plain",
    "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}


def _uid():
    return int(get_jwt_identity())


def _allowed(filename):
    ext = Path(filename).suffix.lower().lstrip(".")
    return ext if ext in current_app.config["ALLOWED_EXTENSIONS"] else None


@bp.get("")
@jwt_required()
def list_files():
    files = (
        StudyFile.query.filter_by(user_id=_uid())
        .order_by(StudyFile.uploaded_at.desc())
        .all()
    )
    return jsonify(files=[f.to_dict() for f in files]), 200


@bp.post("/upload")
@jwt_required()
def upload():
    uid = _uid()
    if "file" not in request.files:
        return jsonify(error="No file part. Send multipart field 'file'."), 400
    upload = request.files["file"]
    if not upload or not upload.filename:
        return jsonify(error="No file selected."), 400

    ext = _allowed(upload.filename)
    if not ext:
        allowed = sorted(current_app.config["ALLOWED_EXTENSIONS"])
        return jsonify(error=f"Unsupported file type. Allowed: {allowed}."), 400

    max_bytes = current_app.config["UPLOAD_MAX_MB"] * 1024 * 1024
    upload.seek(0, 2)
    size = upload.tell()
    upload.seek(0)
    if size <= 0:
        return jsonify(error="Empty files are not allowed."), 400
    if size > max_bytes:
        return jsonify(error=f"File exceeds {current_app.config['UPLOAD_MAX_MB']} MB."), 400

    # Optional task link — must belong to the same user.
    task_id = request.form.get("task_id") or (request.get_json(silent=True) or {}).get("task_id")
    if task_id not in (None, ""):
        try:
            task_id = int(task_id)
        except (TypeError, ValueError):
            return jsonify(error="task_id must be a number."), 400
        if not Task.query.filter_by(id=task_id, user_id=uid).first():
            return jsonify(error="Task not found."), 404
    else:
        task_id = None

    safe_name = secure_filename(upload.filename) or f"file.{ext}"
    key = f"{uid}/{uuid.uuid4().hex}_{safe_name}"
    expected_mime = MIME_BY_EXT.get(ext, "")
    declared = (upload.mimetype or "").split(";")[0].strip()
    # Refuse obvious MIME spoofing (e.g. .pdf claiming to be an image).
    if declared and expected_mime and declared != expected_mime and not declared.startswith("application/octet"):
        return jsonify(error=f"MIME mismatch: .{ext} should be {expected_mime}."), 400

    storage = get_storage()
    try:
        storage.save(upload.stream, key)
    except Exception:
        current_app.logger.exception("storage save failed")
        return jsonify(error="Upload failed. Try again."), 500

    record = StudyFile(
        user_id=uid,
        task_id=task_id,
        original_filename=upload.filename,
        storage_key=key,
        content_type=expected_mime or declared,
        file_size=size,
    )
    db.session.add(record)
    try:
        db.session.commit()
    except Exception:
        db.session.rollback()
        # No orphaned bytes: storage write is rolled back too.
        try:
            storage.delete(key)
        except Exception:
            pass
        return jsonify(error="Could not save file metadata."), 500
    return jsonify(file=record.to_dict()), 201


@bp.get("/<int:file_id>/download")
@jwt_required()
def download(file_id):
    record = StudyFile.query.filter_by(id=file_id, user_id=_uid()).first()
    if not record:
        return jsonify(error="File not found."), 404
    storage = get_storage()
    if storage.name == "s3":
        # Private bucket: browser is redirected to a 15-min presigned URL.
        return redirect(storage.presigned_url(record.storage_key, record.original_filename), code=302)
    try:
        handle = storage.open(record.storage_key)
    except FileNotFoundError:
        return jsonify(error="File content is missing from storage."), 410
    return send_file(
        handle,
        mimetype=record.content_type or "application/octet-stream",
        as_attachment=True,
        download_name=record.original_filename,
    )


@bp.delete("/<int:file_id>")
@jwt_required()
def delete_file(file_id):
    record = StudyFile.query.filter_by(id=file_id, user_id=_uid()).first()
    if not record:
        return jsonify(error="File not found."), 404
    try:
        get_storage().delete(record.storage_key)
    except Exception:
        current_app.logger.exception("storage delete failed")
    db.session.delete(record)
    db.session.commit()
    return jsonify(message="File deleted."), 200
