const COLORS = {
  High: "bg-red-400/15 text-red-300 border-red-400/30",
  Medium: "bg-orange-400/15 text-orange-300 border-orange-400/30",
  Low: "bg-slate-400/15 text-slate-300 border-slate-400/30",
};

export default function PriorityBadge({ priority }) {
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${COLORS[priority] || "bg-white/10"}`}>
      {priority}
    </span>
  );
}
