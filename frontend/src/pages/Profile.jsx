import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import ErrorMessage from "../components/ErrorMessage.jsx";
import { apiErrorMessage } from "../services/api.js";
import { useToast } from "../context/ToastContext.jsx";

export default function Profile() {
  const { user, updateName, logout } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const { push } = useToast();

  const save = async (e) => {
    e.preventDefault();
    setError("");
    if (name.trim().length < 2) return setError("Name needs at least 2 characters.");
    setBusy(true);
    try {
      await updateName(name.trim());
      push("Profile updated.");
    } catch (err) {
      setError(apiErrorMessage(err, "Save failed."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="tf-glass p-6">
      <h1 className="text-2xl font-bold">Profile & Settings</h1>
      <p className="mt-1 text-sm text-slate-400">Signed in as {user?.email}</p>
      <form onSubmit={save} className="mt-4 max-w-md">
        <label className="text-sm" htmlFor="profile-name">Display name</label>
        <input id="profile-name" className="tf-input mt-1" value={name} onChange={(e) => setName(e.target.value)} />
        <div className="mt-2"><ErrorMessage message={error} /></div>
        <div className="mt-3 flex gap-2">
          <button className="tf-btn tf-btn-primary text-sm" disabled={busy}>
            {busy ? "Saving…" : "Save"}
          </button>
          <button
            type="button"
            className="tf-btn tf-btn-ghost text-sm"
            onClick={() => { logout(); navigate("/login"); }}
          >
            Logout
          </button>
        </div>
      </form>
    </div>
  );
}
