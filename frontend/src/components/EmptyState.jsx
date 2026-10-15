export default function EmptyState({ title, hint, action }) {
  return (
    <div className="tf-glass p-8 text-center">
      <p className="text-lg font-semibold text-slate-100">{title}</p>
      {hint && <p className="mt-1 text-sm text-slate-400">{hint}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
