const COLORS = {
  Pending: "bg-amber-400/15 text-amber-300 border-amber-400/30",
  "In Progress": "bg-sky-400/15 text-sky-300 border-sky-400/30",
  Completed: "bg-emerald-400/15 text-emerald-300 border-emerald-400/30",
};

export default function StatusBadge({ status }) {
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${COLORS[status] || "bg-white/10 text-slate-200"}`}>
      {status}
    </span>
  );
}
