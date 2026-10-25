"""Seed a demo account + sample tasks. Idempotent (skips if email exists).

PowerShell (venv activated, from backend/):
    python seed_demo.py
Then log in with demo@college.edu / password123.
"""
from dotenv import load_dotenv

load_dotenv()

from app import create_app
from app.extensions import db
from app.models import Task, User

app = create_app()
with app.app_context():
    db.create_all()
    user = User.query.filter_by(email="demo@college.edu").first()
    if user:
        print("Demo user already exists — nothing seeded.")
    else:
        user = User(name="Demo Student", email="demo@college.edu")
        user.set_password("password123")
        db.session.add(user)
        db.session.commit()
        samples = [
            ("DBMS Assignment 4 — Normalization", "DBMS", "High", "Pending", "2026-11-05"),
            ("Cloud Lab — Static website deployment", "Cloud Computing", "Medium", "In Progress", "2026-11-08"),
            ("Maths revision — Laplace transforms", "Maths", "Medium", "Completed", "2026-10-20"),
            ("OS report — paging vs segmentation", "Operating Systems", "Low", "Pending", "2026-10-28"),
        ]
        from datetime import datetime

        for title, subject, pri, status, due in samples:
            db.session.add(
                Task(
                    user_id=user.id,
                    title=title,
                    description="Seeded sample task.",
                    subject=subject,
                    priority=pri,
                    status=status,
                    due_date=datetime.strptime(due, "%Y-%m-%d"),
                )
            )
        db.session.commit()
        print("Seeded demo@college.edu / password123 with 4 tasks.")
