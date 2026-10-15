"""Task CRUD blueprint. Every query is scoped to the JWT user —
the client never supplies user_id; ownership is taken from the token.
"""
from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required
from sqlalchemy import or_

from app.extensions import db
from app.models import StudyFile, Task
from app.services import check_task_payload, parse_due_date

bp = Blueprint("tasks", __name__, url_prefix="/api/tasks")


def _uid():
    return int(get_jwt_identity())


def _get_owned(task_id):
    return Task.query.filter_by(id=task_id, user_id=_uid()).first()


@bp.get("")
@jwt_required()
def list_tasks():
    q = Task.query.filter_by(user_id=_uid())

    search = request.args.get("search", "").strip()
    if search:
        like = f"%{search}%"
        q = q.filter(or_(Task.title.ilike(like), Task.description.ilike(like)))
    for field in ("status", "priority", "subject"):
        val = request.args.get(field, "").strip()
        if val:
            q = q.filter(getattr(Task, field) == val)

    sort = request.args.get("sort", "due_date")
    if sort == "created":
        q = q.order_by(Task.created_at.desc())
    else:  # due_date asc, tasks without a date go last
        q = q.order_by(Task.due_date.is_(None), Task.due_date.asc())

    try:
        page = max(int(request.args.get("page", 1)), 1)
        per_page = min(max(int(request.args.get("per_page", 20)), 1), 100)
    except ValueError:
        return jsonify(error="page and per_page must be numbers."), 400

    total = q.count()
    items = q.offset((page - 1) * per_page).limit(per_page).all()
    return jsonify(
        tasks=[t.to_dict() for t in items],
        total=total,
        page=page,
        per_page=per_page,
        pages=(total + per_page - 1) // per_page,
    ), 200


@bp.post("")
@jwt_required()
def create_task():
    data = request.get_json(silent=True) or {}
    errors = check_task_payload(data)
    if errors:
        return jsonify(error="Validation failed.", fields=errors), 400
    task = Task(
        user_id=_uid(),
        title=str(data["title"]).strip(),
        description=str(data.get("description", "") or ""),
        subject=str(data.get("subject", "") or ""),
        priority=data.get("priority", "Medium"),
        status=data.get("status", "Pending"),
        due_date=parse_due_date(data.get("due_date")),
    )
    db.session.add(task)
    db.session.commit()
    return jsonify(task=task.to_dict()), 201


@bp.get("/<int:task_id>")
@jwt_required()
def get_task(task_id):
    task = _get_owned(task_id)
    if not task:
        return jsonify(error="Task not found."), 404
    return jsonify(task=task.to_dict()), 200


@bp.put("/<int:task_id>")
@jwt_required()
def update_task(task_id):
    task = _get_owned(task_id)
    if not task:
        return jsonify(error="Task not found."), 404
    data = request.get_json(silent=True) or {}
    errors = check_task_payload(data)
    if errors:
        return jsonify(error="Validation failed.", fields=errors), 400
    task.title = str(data["title"]).strip()
    task.description = str(data.get("description", "") or "")
    task.subject = str(data.get("subject", "") or "")
    task.priority = data.get("priority", "Medium")
    task.status = data.get("status", "Pending")
    task.due_date = parse_due_date(data.get("due_date"))
    db.session.commit()
    return jsonify(task=task.to_dict()), 200


@bp.patch("/<int:task_id>/status")
@jwt_required()
def update_status(task_id):
    task = _get_owned(task_id)
    if not task:
        return jsonify(error="Task not found."), 404
    data = request.get_json(silent=True) or {}
    errors = check_task_payload({"status": data.get("status")}, partial=True)
    if errors:
        return jsonify(error="Validation failed.", fields=errors), 400
    task.status = data["status"]
    db.session.commit()
    return jsonify(task=task.to_dict()), 200


@bp.delete("/<int:task_id>")
@jwt_required()
def delete_task(task_id):
    task = _get_owned(task_id)
    if not task:
        return jsonify(error="Task not found."), 404
    # Documented behavior: linked files survive; their task link is cleared.
    StudyFile.query.filter_by(task_id=task.id, user_id=_uid()).update({"task_id": None})
    db.session.delete(task)
    db.session.commit()
    return jsonify(message="Task deleted."), 200
