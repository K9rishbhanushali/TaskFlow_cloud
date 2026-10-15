import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "../layouts/Layouts.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { isValidEmail } from "../utils/helpers.js";
import { apiErrorMessage } from "../services/api.js";
import ErrorMessage from "../components/ErrorMessage.jsx";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (name.trim().length < 2) return setError("Enter your full name.");
    if (!isValidEmail(email)) return setError("Enter a valid email address.");
    if (password.length < 6) return setError("Password must be at least 6 characters.");
    if (password !== confirm) return setError("Passwords do not match.");
    setBusy(true);
    try {
      await register(name.trim(), email.trim(), password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(apiErrorMessage(err, "Registration failed. Is the backend running?"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout>
      <h1 className="text-2xl font-bold">Create account</h1>
      <p className="mt-1 text-sm text-slate-400">Stored securely in the TaskFlow database.</p>
      <form onSubmit={submit} className="mt-5 flex flex-col gap-3">
        <div>
          <label className="text-sm" htmlFor="reg-name">Full name</label>
          <input id="reg-name" className="tf-input mt-1" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
        </div>
        <div>
          <label className="text-sm" htmlFor="reg-email">Email</label>
          <input id="reg-email" className="tf-input mt-1" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        </div>
        <div>
          <label className="text-sm" htmlFor="reg-pass">Password</label>
          <input id="reg-pass" type="password" className="tf-input mt-1" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
        </div>
        <div>
          <label className="text-sm" htmlFor="reg-confirm">Confirm password</label>
          <input id="reg-confirm" type="password" className="tf-input mt-1" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" />
        </div>
        <ErrorMessage message={error} />
        <button className="tf-btn tf-btn-primary" disabled={busy}>
          {busy ? "Creating…" : "Register"}
        </button>
      </form>
      <p className="mt-4 text-sm text-slate-400">
        Have an account? <Link to="/login">Login</Link>
      </p>
    </AuthLayout>
  );
}
