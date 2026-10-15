"""Import models here so Flask-Migrate (alembic) can discover them."""
from app.models.study_file import StudyFile  # noqa: F401
from app.models.task import Task  # noqa: F401
from app.models.user import User  # noqa: F401

__all__ = ["User", "Task", "StudyFile"]
