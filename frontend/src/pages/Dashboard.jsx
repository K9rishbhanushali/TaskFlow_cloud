import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import DashboardCard from "../components/DashboardCard.jsx";
import TaskCard from "../components/TaskCard.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import ErrorMessage from "../components/ErrorMessage.jsx";
import { dashboardService } from "../services/dashboardService.js";
import { apiErrorMessage } from "../services/api.js";
import { formatDate } from "../utils/mockData.js";

const PIE_COLORS = ["#fbbf24", "#38bdf8", "#34d399"];

export default function Dashboard() {
  // Live data: GET /api/dashboard/stats (no hardcoded numbers).
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let live = true;
    dashboardService
      .stats()
      .then((s) => live && setStats(s))
      .catch((err) => live && setError(apiErrorMessage(err, "Could not load dashboard.")));
    return () => { live = false; };
  }, []);

  if (error) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <ErrorMessage message={error} />
      </div>
    );
  }
  if (!stats) return <LoadingSpinner label="Loading dashboard…" />;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Link to="/tasks/new" className="tf-btn tf-btn-primary text-sm">+ New Task</Link>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <DashboardCard label="Total" value={stats.total} />
        <DashboardCard label="Pending" value={stats.pending} accent="text-amber-300" />
        <DashboardCard label="In Progress" value={stats.in_progress} accent="text-sky-300" />
        <DashboardCard label="Completed" value={stats.completed} accent="text-emerald-300" />
        <DashboardCard label="Overdue" value={stats.overdue} accent="text-red-300" />
        <DashboardCard label="Done %" value={`${stats.completion}%`} accent="text-violet-300" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="tf-glass p-4">
          <h2 className="font-semibold">Tasks by status</h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.by_status}>
                <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fill: "#94a3b8" }} />
                <Tooltip contentStyle={{ background: "#0b0c12", border: "1px solid #333" }} />
                <Bar dataKey="value" fill="#38bdf8" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="tf-glass p-4">
          <h2 className="font-semibold">Completion mix</h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={stats.by_status} dataKey="value" nameKey="name" outerRadius={80} label>
                  {stats.by_status.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "#0b0c12", border: "1px solid #333" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="tf-glass p-4">
          <h2 className="font-semibold">Due soon</h2>
          {stats.upcoming.length === 0 ? (
            <p className="mt-2 text-sm text-slate-500">Nothing due. Enjoy the calm.</p>
          ) : (
            <ul className="mt-2 flex flex-col gap-2 text-sm">
              {stats.upcoming.map((t) => (
                <li key={t.id} className="flex justify-between gap-2 text-slate-300">
                  <Link to={`/tasks/${t.id}`} className="hover:underline">{t.title}</Link>
                  <span className="shrink-0 text-slate-500">{formatDate(t.due_date)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="tf-glass p-4">
          <h2 className="font-semibold">Recent tasks</h2>
          <div className="mt-2 flex flex-col gap-2">
            {stats.recent.slice(0, 3).map((t) => (
              <TaskCard key={t.id} task={t} />
            ))}
            {stats.recent.length === 0 && (
              <p className="text-sm text-slate-500">No tasks yet — create your first one.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
