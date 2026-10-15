import { Outlet } from "react-router-dom";
import { Navbar, Sidebar } from "../components/Navbar.jsx";

export function DashboardLayout() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="mx-auto flex max-w-6xl gap-4 px-4 py-6">
        <Sidebar />
        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export function AuthLayout({ children }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="tf-glass w-full max-w-md p-6">{children}</div>
    </div>
  );
}
