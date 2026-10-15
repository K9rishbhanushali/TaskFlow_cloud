import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import TaskCard from "../components/TaskCard.jsx";
import TaskFilters from "../components/TaskFilters.jsx";
import EmptyState from "../components/EmptyState.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import ErrorMessage from "../components/ErrorMessage.jsx";
import { taskService } from "../services/taskService.js";
import { apiErrorMessage } from "../services/api.js";

export default function Tasks() {
  const [filters, setFilters] = useState({ search: "", status: "", priority: "", subject: "" });
  const [sort, setSort] = useState("due");
  const [tasks, setTasks] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = { sort: sort === "created" ? "created" : "due_date", per_page: 100 };
      if (filters.search.trim()) params.search = filters.search.trim();
      if (filters.status) params.status = filters.status;
      if (filters.priority) params.priority = filters.priority;
      if (filters.subject) params.subject = filters.subject;
      const data = await taskService.list(params);
      setTasks(data.tasks);
      setTotal(data.total);
    } catch (err) {
      setError(apiErrorMessage(err, "Could not load tasks."));
    } finally {
      setLoading(false);
    }
  }, [filters, sort]);

  useEffect(() => {
    const t = setTimeout(load, 250); // debounce search typing
    return () => clearTimeout(t);
  }, [load]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">All Tasks {total > 0 && <span className="text-base text-slate-500">({total})</span>}</h1>
        <div className="flex items-center gap-2">
          <select
            aria-label="Sort tasks"
            className="rounded-lg border border-white/10 bg-black/40 px-2 py-2 text-sm"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="due">Sort: deadline</option>
            <option value="created">Sort: newest</option>
          </select>
          <Link to="/tasks/new" className="tf-btn tf-btn-primary text-sm">+ New</Link>
        </div>
      </div>

      <TaskFilters filters={filters} onChange={setFilters} />
      {error && <ErrorMessage message={error} />}
      {loading ? (
        <LoadingSpinner label="Loading tasks…" />
      ) : tasks.length === 0 ? (
        <EmptyState
          title="No tasks found"
          hint="Try clearing a filter, or create a new task."
          action={<Link to="/tasks/new" className="tf-btn tf-btn-primary text-sm">Create task</Link>}
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {tasks.map((t) => (
            <TaskCard key={t.id} task={t} />
          ))}
        </div>
      )}
    </div>
  );
}
