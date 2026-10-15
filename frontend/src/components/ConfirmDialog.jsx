export default function ConfirmDialog({ open, title, message, onCancel, onConfirm, confirmLabel = "Delete" }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" role="dialog" aria-modal="true">
      <div className="tf-glass w-full max-w-sm p-6">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="mt-2 text-sm text-slate-400">{message}</p>
        <div className="mt-5 flex justify-end gap-2">
          <button className="tf-btn tf-btn-ghost" onClick={onCancel}>Cancel</button>
          <button
            className="tf-btn bg-red-500/90 text-white"
            onClick={onConfirm}
            autoFocus
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
