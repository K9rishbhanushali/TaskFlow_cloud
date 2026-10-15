import { Link } from "react-router-dom";
import { formatDate, isOverdue } from "../utils/mockData.js";
import PriorityBadge from "./PriorityBadge.jsx";
import StatusBadge from "./StatusBadge.jsx";

export default function TaskCard({ task }) {
  const overdue = isOverdue(task);
  return (
    <Link
      to={`/tasks/${task.id}`}
      className={`tf-glass block p-4 transition hover:border-sky-400/40 ${overdue ? "border-red-400/40" : ""}`}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-slate-100">{task.title}</h3>
        <StatusBadge status={task.status} />
      </div>
      <p className="mt-1 text-sm text-slate-400">
        {task.subject} · Due {formatDate(task.due_date)}
        {overdue && <span className="ml-2 font-semibold text-red-300">Overdue</span>}
      </p>
      <div className="mt-2">
        <PriorityBadge priority={task.priority} />
      </div>
    </Link>
  );
}
