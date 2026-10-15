import { SUBJECTS } from "../utils/mockData.js";

// Search + filter + sort controls for the Tasks page.
export default function TaskFilters({ filters, onChange }) {
  const set = (key) => (e) => onChange({ ...filters, [key]: e.target.value });
  return (
    <div className="tf-glass grid gap-3 p-4 md:grid-cols-5">
      <div className="md:col-span-2">
        <label className="text-xs text-slate-400" htmlFor="tf-search">Search title</label>
        <input
          id="tf-search"
          className="tf-input mt-1"
          placeholder="e.g. DBMS"
          value={filters.search}
          onChange={set("search")}
        />
      </div>
      <div>
        <label className="text-xs text-slate-400" htmlFor="tf-status">Status</label>
        <select id="tf-status" className="tf-input mt-1" value={filters.status} onChange={set("status")}>
          <option value="">All</option>
          <option>Pending</option>
          <option>In Progress</option>
          <option>Completed</option>
        </select>
      </div>
      <div>
        <label className="text-xs text-slate-400" htmlFor="tf-priority">Priority</label>
        <select id="tf-priority" className="tf-input mt-1" value={filters.priority} onChange={set("priority")}>
          <option value="">All</option>
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
        </select>
      </div>
      <div>
        <label className="text-xs text-slate-400" htmlFor="tf-subject">Subject</label>
        <select id="tf-subject" className="tf-input mt-1" value={filters.subject} onChange={set("subject")}>
          <option value="">All</option>
          {SUBJECTS.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
