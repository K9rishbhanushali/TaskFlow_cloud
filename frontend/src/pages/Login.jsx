import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "../layouts/Layouts.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { isValidEmail } from "../utils/helpers.js";
import { apiErrorMessage } from "../services/api.js";
import ErrorMessage from "../components/ErrorMessage.jsx";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!isValidEmail(email)) return setError("Enter a valid email address.");
    if (!password) return setError("Enter your password.");
    setBusy(true);
    try {
      await login(email.trim(), password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(apiErrorMessage(err, "Login failed. Is the backend running?"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout>
      <h1 className="text-2xl font-bold">Welcome back</h1>
      <p className="mt-1 text-sm text-slate-400">Log in to your TaskFlow Cloud account.</p>
      <form onSubmit={submit} className="mt-5 flex flex-col gap-3">
        <div>
          <label className="text-sm text-slate-300" htmlFor="login-email">Email</label>
          <input id="login-email" className="tf-input mt-1" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        </div>
        <div>
          <label className="text-sm text-slate-300" htmlFor="login-pass">Password</label>
          <div className="mt-1 flex gap-2">
            <input
              id="login-pass"
              type={show ? "text" : "password"}
              className="tf-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
            <button type="button" className="tf-btn tf-btn-ghost text-sm" onClick={() => setShow((v) => !v)}>
              {show ? "Hide" : "Show"}
            </button>
          </div>
        </div>
        <ErrorMessage message={error} />
        <button className="tf-btn tf-btn-primary" disabled={busy}>
          {busy ? "Signing in…" : "Login"}
        </button>
      </form>
      <p className="mt-4 text-sm text-slate-400">
        No account? <Link to="/register">Register</Link>
      </p>
    </AuthLayout>
  );
}
