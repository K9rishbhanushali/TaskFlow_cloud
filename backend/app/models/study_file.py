"""StudyFiles table: metadata for uploaded study documents.

The actual bytes live on local disk.
This table only stores metadata + the storage key, so the same rows
work with SQLite locally and PostgreSQL in the cloud.
"""
from datetime import datetime

from app.extensions import db


class StudyFile(db.Model):
    __tablename__ = "study_files"
    __table_args__ = (db.Index("ix_files_user_uploaded", "user_id", "uploaded_at"),)

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(
        db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    # Optional link to a task. ondelete=SET NULL keeps the file if its
    # task is deleted (see Task.files relationship).
    task_id = db.Column(
        db.Integer, db.ForeignKey("tasks.id", ondelete="SET NULL"), nullable=True, index=True
    )
    original_filename = db.Column(db.String(255), nullable=False)
    # Unique object key (UUID-based), never a user-supplied path.
    storage_key = db.Column(db.String(512), nullable=False, unique=True, index=True)
    content_type = db.Column(db.String(120), nullable=True, default="")
    file_size = db.Column(db.Integer, nullable=False, default=0)
    uploaded_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    owner = db.relationship("User", back_populates="files")
    task = db.relationship("Task", back_populates="files")

    def to_dict(self):
        return {
            "id": self.id,
            "task_id": self.task_id,
            "original_filename": self.original_filename,
            "storage_key": self.storage_key,
            "content_type": self.content_type or "",
            "file_size": self.file_size,
            "uploaded_at": self.uploaded_at.isoformat() if self.uploaded_at else None,
        }

    def __repr__(self):
        return f"<StudyFile {self.original_filename}>"
