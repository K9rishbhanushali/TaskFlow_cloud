import { useEffect, useState } from "react";
import FileUpload from "../components/FileUpload.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import EmptyState from "../components/EmptyState.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import ErrorMessage from "../components/ErrorMessage.jsx";
import { formatDate } from "../utils/mockData.js";
import { formatSize } from "../utils/helpers.js";
import { fileService } from "../services/fileService.js";
import { apiErrorMessage } from "../services/api.js";
import { useToast } from "../context/ToastContext.jsx";

export default function Notes() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pendingDelete, setPendingDelete] = useState(null);
  const { push } = useToast();

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      setFiles(await fileService.list());
    } catch (err) {
      setError(apiErrorMessage(err, "Could not load files."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const download = async (f) => {
    try {
      const { blob } = await fileService.downloadBlob(f.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = f.original_filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      push(apiErrorMessage(err, "Download failed."));
    }
  };

  const confirmDelete = async () => {
    try {
      await fileService.remove(pendingDelete.id);
      setFiles((p) => p.filter((x) => x.id !== pendingDelete.id));
      push("File deleted.");
    } catch (err) {
      push(apiErrorMessage(err, "Delete failed."));
    } finally {
      setPendingDelete(null);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Study Notes</h1>
      <FileUpload
        onUploaded={(saved) => {
          setFiles((p) => [saved, ...p]);
          push("File uploaded.");
        }}
      />
      {error && <ErrorMessage message={error} />}
      {loading ? (
        <LoadingSpinner label="Loading files…" />
      ) : files.length === 0 ? (
        <EmptyState title="No files yet" hint="Upload a PDF, TXT, or DOCX above." />
      ) : (
        <div className="tf-glass divide-y divide-white/10">
          {files.map((f) => (
            <div key={f.id} className="flex flex-wrap items-center justify-between gap-2 p-4">
              <div>
                <p className="font-semibold text-slate-100">{f.original_filename}</p>
                <p className="text-xs text-slate-500">
                  {formatSize(f.file_size)} · {f.content_type} · {formatDate(f.uploaded_at)}
                  {f.task_id ? ` · task #${f.task_id}` : ""}
                </p>
              </div>
              <div className="flex gap-2">
                <button className="tf-btn tf-btn-ghost text-sm" onClick={() => download(f)}>Download</button>
                <button className="tf-btn tf-btn-ghost text-sm" onClick={() => setPendingDelete(f)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
      <ConfirmDialog
        open={!!pendingDelete}
        title="Delete this file?"
        message={pendingDelete ? `"${pendingDelete.original_filename}" will be removed from storage.` : ""}
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
