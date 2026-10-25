"""Tasks table: assignments/deadlines owned by exactly one user."""
from datetime import datetime

from app.extensions import db

PRIORITIES = ("Low", "Medium", "High")
STATUSES = ("Pending", "In Progress", "Completed")


class Task(db.Model):
    __tablename__ = "tasks"
    __table_args__ = (
        db.Index("ix_tasks_user_status", "user_id", "status"),
        db.Index("ix_tasks_user_due", "user_id", "due_date"),
        db.CheckConstraint(
            "priority IN ('Low', 'Medium', 'High')", name="ck_tasks_priority"
        ),
        db.CheckConstraint(
            "status IN ('Pending', 'In Progress', 'Completed')", name="ck_tasks_status"
        ),
    )

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(
        db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True, default="")
    subject = db.Column(db.String(120), nullable=True, default="", index=True)
    priority = db.Column(db.String(10), nullable=False, default="Medium")
    status = db.Column(db.String(20), nullable=False, default="Pending", index=True)
    due_date = db.Column(db.DateTime, nullable=True, index=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    owner = db.relationship("User", back_populates="tasks")

    @property
    def is_overdue(self):
        # Single definition of overdue, shared with the frontend chart logic:
        # incomplete task whose due date has passed.
        if self.status == "Completed" or not self.due_date:
            return False
        return self.due_date < datetime.utcnow()

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description or "",
            "subject": self.subject or "",
            "priority": self.priority,
            "status": self.status,
            "due_date": self.due_date.isoformat() if self.due_date else None,
            "is_overdue": self.is_overdue,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

    def __repr__(self):
        return f"<Task {self.id} {self.title!r}>"
