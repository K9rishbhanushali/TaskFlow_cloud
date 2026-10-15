import { useState } from "react";
import ErrorMessage from "./ErrorMessage.jsx";
import { fileService } from "../services/fileService.js";
import { apiErrorMessage } from "../services/api.js";

// Real upload: POST /api/files/upload with progress. Backend enforces
// type/size again — this client check is only for fast feedback.
export default function FileUpload({ taskId, onUploaded }) {
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const [busy, setBusy] = useState(false);

  const handle = async (e) => {
    const files = [...(e.target.files || [])];
    e.target.value = "";
    if (files.length === 0) return;
    setError("");
    setBusy(true);
    try {
      for (const f of files) {
        setProgress(0);
        const saved = await fileService.upload(f, taskId, setProgress);
        onUploaded(saved);
      }
    } catch (err) {
      setError(apiErrorMessage(err, "Upload failed."));
    } finally {
      setBusy(false);
      setProgress(0);
    }
  };

  return (
    <div className="tf-glass p-4">
      <label className="text-sm font-semibold" htmlFor="tf-file">
        Upload study notes (PDF / TXT / DOCX, max 5 MB)
      </label>
      <input
        id="tf-file"
        type="file"
        multiple
        accept=".pdf,.txt,.docx"
        onChange={handle}
        disabled={busy}
        className="mt-2 block text-sm text-slate-300"
      />
      {progress > 0 && (
        <div className="mt-3 h-2 overflow-hidden rounded bg-white/10">
          <div className="h-full bg-sky-400 transition-all" style={{ width: `${progress}%` }} />
        </div>
      )}
      <div className="mt-2"><ErrorMessage message={error} /></div>
    </div>
  );
}
