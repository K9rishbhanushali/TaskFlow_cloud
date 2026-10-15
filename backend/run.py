"""Local dev entry point. Run: python run.py (with venv activated).

Production (EC2) does NOT use this server — it runs `gunicorn run:app`.
"""
from dotenv import load_dotenv

load_dotenv()  # read backend/.env during local dev (ignored in git)

from app import create_app  # noqa: E402
from app.extensions import db  # noqa: E402

app = create_app()

if __name__ == "__main__":
    # Dev convenience ONLY: ensure SQLite tables exist locally.
    # Production/RDS must use migrations: `flask --app run db upgrade`.
    with app.app_context():
        db.create_all()
    # Debug ON for local only. Never enable debug in production.
    app.run(host="127.0.0.1", port=5000, debug=True)
