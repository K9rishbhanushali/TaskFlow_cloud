import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import StatusBadge from "../components/StatusBadge.jsx";
import PriorityBadge from "../components/PriorityBadge.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import EmptyState from "../components/EmptyState.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import ErrorMessage from "../components/ErrorMessage.jsx";
import { taskService } from "../services/taskService.js";
import { apiErrorMessage } from "../services/api.js";
import { formatDate } from "../utils/mockData.js";
import { useToast } from "../context/ToastContext.jsx";

export default function TaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { push } = useToast();
  const [task, setTask] = useState(null);
  const [error, setError] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let live = true;
    taskService
      .get(id)
      .then((t) => live && setTask(t))
      .catch((err) => live && setError(apiErrorMessage(err, "Could not load task.")));
    return () => { live = false; };
  }, [id]);

  const remove = async () => {
    setDeleting(true);
    try {
      await taskService.remove(id);
      push("Task deleted.");
      navigate("/tasks");
    } catch (err) {
      push(apiErrorMessage(err, "Delete failed."));
      setDeleting(false);
      setConfirm(false);
    }
  };

  if (error) {
    return (
      <EmptyState
        title="Task not available"
        hint={error}
        action={<Link to="/tasks" className="tf-btn tf-btn-ghost text-sm">Back to tasks</Link>}
      />
    );
  }
  if (!task) return <LoadingSpinner label="Loading task…" />;

  return (
    <div className="tf-glass p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h1 className="text-2xl font-bold">{task.title}</h1>
        <StatusBadge status={task.status} />
      </div>
      <p className="mt-2 text-slate-300">{task.description || "No description."}</p>
      {task.is_overdue && <p className="mt-2 text-sm font-semibold text-red-300">Overdue — past its due date.</p>}
      <dl className="mt-4 grid gap-2 text-sm md:grid-cols-2">
        <div><dt className="text-slate-500">Subject</dt><dd>{task.subject || "—"}</dd></div>
        <div><dt className="text-slate-500">Priority</dt><dd><PriorityBadge priority={task.priority} /></dd></div>
        <div><dt className="text-slate-500">Due date</dt><dd>{formatDate(task.due_date)}</dd></div>
        <div><dt className="text-slate-500">Created</dt><dd>{formatDate(task.created_at)}</dd></div>
      </dl>
      <div className="mt-5 flex gap-2">
        <Link to={`/tasks/${task.id}/edit`} className="tf-btn tf-btn-primary text-sm">Edit</Link>
        <button className="tf-btn tf-btn-ghost text-sm" onClick={() => setConfirm(true)}>Delete</button>
        <Link to="/tasks" className="tf-btn tf-btn-ghost text-sm">Back</Link>
      </div>
      <ConfirmDialog
        open={confirm}
        title="Delete this task?"
        message={`"${task.title}" will be permanently removed. Linked files are kept.`}
        confirmLabel={deleting ? "Deleting…" : "Delete"}
        onCancel={() => setConfirm(false)}
        onConfirm={remove}
      />
    </div>
  );
}
