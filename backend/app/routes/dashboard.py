"""Dashboard stats — always computed from the JWT user's own rows."""
from flask import Blueprint, jsonify
from flask_jwt_extended import get_jwt_identity, jwt_required

from app.models import Task

bp = Blueprint("dashboard", __name__, url_prefix="/api/dashboard")


@bp.get("/stats")
@jwt_required()
def stats():
    uid = int(get_jwt_identity())
    tasks = Task.query.filter_by(user_id=uid).all()

    total = len(tasks)
    pending = sum(1 for t in tasks if t.status == "Pending")
    in_progress = sum(1 for t in tasks if t.status == "In Progress")
    completed = sum(1 for t in tasks if t.status == "Completed")
    overdue = sum(1 for t in tasks if t.is_overdue)
    completion = round((completed / total) * 100) if total else 0

    upcoming = sorted(
        [t for t in tasks if t.status != "Completed" and t.due_date],
        key=lambda t: t.due_date,
    )[:5]
    recent = sorted(tasks, key=lambda t: t.created_at or t.id, reverse=True)[:5]

    return jsonify(
        total=total,
        pending=pending,
        in_progress=in_progress,
        completed=completed,
        overdue=overdue,
        completion=completion,
        by_status=[
            {"name": "Pending", "value": pending},
            {"name": "In Progress", "value": in_progress},
            {"name": "Completed", "value": completed},
        ],
        upcoming=[t.to_dict() for t in upcoming],
        recent=[t.to_dict() for t in recent],
    ), 200
