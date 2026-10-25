import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CheckSquare, Menu, X } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

const LINKS = [
  { to: "/", label: "Dashboard" },
  { to: "/tasks", label: "All Tasks" },
  { to: "/tasks/new", label: "New Task" },
  { to: "/profile", label: "Profile" },
];

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const onLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-black/60 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2 font-bold text-slate-50">
          <CheckSquare className="h-5 w-5 text-sky-400" />
          TaskFlow Cloud
        </Link>
        <nav className="hidden items-center gap-4 md:flex" aria-label="Primary">
          {LINKS.map((l) => (
            <Link key={l.to} to={l.to} className="text-sm text-slate-300 hover:text-white">
              {l.label}
            </Link>
          ))}
          <span className="text-xs text-slate-500">{user?.email}</span>
          <button className="tf-btn tf-btn-ghost py-1.5 text-sm" onClick={onLogout}>
            Logout
          </button>
        </nav>
        <button
          className="rounded p-2 text-slate-300 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <nav className="flex flex-col gap-1 border-t border-white/10 px-4 py-3 md:hidden" aria-label="Mobile">
          {LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className="rounded px-2 py-2 text-sm text-slate-200 hover:bg-white/5"
            >
              {l.label}
            </Link>
          ))}
          <button className="tf-btn tf-btn-ghost mt-1 text-sm" onClick={onLogout}>
            Logout ({user?.email})
          </button>
        </nav>
      )}
    </header>
  );
}

export function Sidebar() {
  return (
    <aside className="tf-glass hidden w-56 shrink-0 p-4 lg:block" aria-label="Sidebar">
      <p className="px-2 text-xs uppercase tracking-wider text-slate-500">Navigate</p>
      <nav className="mt-2 flex flex-col gap-1">
        {LINKS.map((l) => (
          <Link key={l.to} to={l.to} className="rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white">
            {l.label}
          </Link>
        ))}
      </nav>
      <div className="mt-4 rounded-lg border border-emerald-400/20 bg-emerald-400/10 p-3 text-xs text-emerald-200">
        Connected to the Flask API — your data is stored per account.
      </div>
    </aside>
  );
}
