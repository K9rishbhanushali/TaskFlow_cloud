import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="tf-glass p-8 text-center">
        <p className="text-sm text-slate-500">404</p>
        <h1 className="text-2xl font-bold">Page not found</h1>
        <p className="mt-1 text-sm text-slate-400">That route does not exist in this prototype.</p>
        <Link to="/" className="tf-btn tf-btn-primary mt-4 text-sm">Back to dashboard</Link>
      </div>
    </div>
  );
}
