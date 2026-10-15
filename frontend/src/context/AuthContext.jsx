import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { authService } from "../services/authService.js";

// Real JWT auth (Phases 4+). Token in localStorage (`tf_token`), user cached
// in `tf_user`. See services/api.js for the documented trade-off.
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem("tf_user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [booting, setBooting] = useState(!!localStorage.getItem("tf_token"));

  useEffect(() => {
    if (!localStorage.getItem("tf_token")) return;
    authService
      .me()
      .then((u) => {
        setUser(u);
        localStorage.setItem("tf_user", JSON.stringify(u));
      })
      .catch(() => {
        localStorage.removeItem("tf_token");
        localStorage.removeItem("tf_user");
        setUser(null);
      })
      .finally(() => setBooting(false));
  }, []);

  const saveSession = (u, token) => {
    localStorage.setItem("tf_token", token);
    localStorage.setItem("tf_user", JSON.stringify(u));
    setUser(u);
  };

  const login = useCallback(async (email, password) => {
    const { user: u, access_token } = await authService.login({ email, password });
    saveSession(u, access_token);
    return u;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const { user: u, access_token } = await authService.register({ name, email, password });
    saveSession(u, access_token);
    return u;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("tf_token");
    localStorage.removeItem("tf_user");
    // Drop any legacy mock session key from Phase 2.
    localStorage.removeItem("tf_mock_user");
    setUser(null);
  }, []);

  const updateName = useCallback(async (name) => {
    const u = await authService.updateName(name);
    localStorage.setItem("tf_user", JSON.stringify(u));
    setUser(u);
    return u;
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, booting, login, register, logout, updateName }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
