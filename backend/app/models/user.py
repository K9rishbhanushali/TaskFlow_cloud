"""Users table: one row per student account."""
from datetime import datetime

from app.extensions import bcrypt, db


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(255), nullable=False, unique=True, index=True)
    # NEVER store plain-text passwords — only this bcrypt hash.
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    # One user owns many tasks. Deleting a user removes their rows
    # (cascade) so no orphaned tasks are left behind.
    tasks = db.relationship(
        "Task", back_populates="owner", cascade="all, delete-orphan", lazy="selectin"
    )

    def set_password(self, plain_password):
        self.password_hash = bcrypt.generate_password_hash(plain_password).decode("utf-8")

    def check_password(self, plain_password):
        if not self.password_hash:
            return False
        return bcrypt.check_password_hash(self.password_hash, plain_password)

    def to_dict(self):
        # password_hash is DELIBERATELY excluded — never send it to the frontend.
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

    def __repr__(self):
        return f"<User {self.email}>"
