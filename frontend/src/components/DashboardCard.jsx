export default function DashboardCard({ label, value, accent }) {
  return (
    <div className="tf-glass p-4">
      <p className="text-xs uppercase tracking-wider text-slate-400">{label}</p>
      <p className={`mt-1 text-3xl font-bold ${accent || "text-slate-50"}`}>{value}</p>
    </div>
  );
}
