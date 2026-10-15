"""Shared validation helpers — one place so every blueprint agrees."""
from datetime import datetime

from app.models.task import PRIORITIES, STATUSES


def parse_due_date(value):
    """Accept ISO date/datetime strings; '' / None -> None. Raises ValueError."""
    if value is None or value == "":
        return None
    if isinstance(value, datetime):
        return value
    text = str(value).strip()
    if not text:
        return None
    # Plain YYYY-MM-DD from <input type="date">
    if len(text) == 10 and text[4] == "-" and text[7] == "-":
        return datetime.strptime(text, "%Y-%m-%d")
    try:
        return datetime.fromisoformat(text.replace("Z", "+00:00").replace("+00:00", ""))
    except ValueError:
        raise ValueError("due_date must be an ISO date like 2026-11-05")


def check_task_payload(data, partial=False):
    """Return a dict of field->message errors (empty = valid)."""
    errors = {}
    if not isinstance(data, dict):
        return {"body": "Request body must be JSON."}

    if not partial or "title" in data:
        title = str(data.get("title", "")).strip()
        if len(title) < 3:
            errors["title"] = "Title needs at least 3 characters."
        elif len(title) > 200:
            errors["title"] = "Title must be under 200 characters."

    if "priority" in data and data["priority"] not in PRIORITIES:
        errors["priority"] = f"Priority must be one of {list(PRIORITIES)}."
    if "status" in data and data["status"] not in STATUSES:
        errors["status"] = f"Status must be one of {list(STATUSES)}."
    if "subject" in data and len(str(data["subject"] or "")) > 120:
        errors["subject"] = "Subject must be under 120 characters."
    if "due_date" in data:
        try:
            parse_due_date(data["due_date"])
        except ValueError as e:
            errors["due_date"] = str(e)
    return errors
