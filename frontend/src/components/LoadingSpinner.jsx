export default function LoadingSpinner({ label = "Loading…" }) {
  return (
    <div className="flex items-center justify-center gap-2 py-10 text-slate-300" role="status">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-500 border-t-sky-400" />
      <span className="text-sm">{label}</span>
    </div>
  );
}
