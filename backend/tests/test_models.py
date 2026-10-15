"""Phase 3 model tests — run: pytest (from backend/, venv activated).

Uses an isolated in-memory SQLite DB; never touches taskflow.db or RDS.
"""
from datetime import datetime, timedelta

import pytest
from sqlalchemy.exc import IntegrityError

from app import create_app
from app.extensions import db
from app.models import StudyFile, Task, User


@pytest.fixture
def app_ctx():
    app = create_app(
        config_overrides={
            "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:",
            "TESTING": True,
        }
    )
    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()


def test_password_hashing_and_safe_dict(app_ctx):
    u = User(name="Asha", email="asha@college.edu")
    u.set_password("secret123")
    db.session.add(u)
    db.session.commit()

    assert u.password_hash != "secret123"
    assert u.check_password("secret123") is True
    assert u.check_password("wrong") is False
    assert "password_hash" not in u.to_dict()


def test_duplicate_email_rejected(app_ctx):
    a = User(name="A", email="dup@college.edu")
    a.set_password("password1")
    b = User(name="B", email="dup@college.edu")
    b.set_password("password2")
    db.session.add_all([a, b])
    with pytest.raises(IntegrityError):
        db.session.commit()


def test_task_overdue_rule(app_ctx):
    u = User(name="Dev", email="dev@college.edu")
    u.set_password("password1")
    db.session.add(u)
    db.session.commit()

    overdue = Task(
        user_id=u.id, title="Late", status="Pending",
        due_date=datetime.utcnow() - timedelta(days=1),
    )
    done_late = Task(
        user_id=u.id, title="Done", status="Completed",
        due_date=datetime.utcnow() - timedelta(days=1),
    )
    db.session.add_all([overdue, done_late])
    db.session.commit()

    assert overdue.is_overdue is True
    assert done_late.is_overdue is False


def test_deleting_task_keeps_file_with_null_task(app_ctx):
    u = User(name="File", email="file@college.edu")
    u.set_password("password1")
    db.session.add(u)
    db.session.commit()

    t = Task(user_id=u.id, title="With file", status="Pending")
    db.session.add(t)
    db.session.commit()

    f = StudyFile(
        user_id=u.id, task_id=t.id, original_filename="notes.pdf",
        storage_key="test/unique-key-1", file_size=100,
    )
    db.session.add(f)
    db.session.commit()

    db.session.delete(t)
    db.session.commit()

    kept = StudyFile.query.one()
    assert kept.task_id is None
    assert kept.original_filename == "notes.pdf"
