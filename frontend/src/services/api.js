
// Central Axios client. Every service module uses this instance.
// Base URL: VITE_API_BASE_URL (falls back to legacy VITE_API_URL).
import axios from "axios";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:5000";

const api = axios.create({ baseURL: API_BASE_URL, timeout: 15000 });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("tf_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && localStorage.getItem("tf_token")) {
      localStorage.removeItem("tf_token");
      localStorage.removeItem("tf_user");
      if (!window.location.pathname.startsWith("/login")) {
        window.location.assign("/login");
      }
    }
    return Promise.reject(err);
  }
);

export function apiErrorMessage(err, fallback = "Something went wrong.") {
  return err?.response?.data?.error || err?.message || fallback;
}

export async function getHealth() {
  const res = await api.get("/api/health");
  return res.data;
}

export default api;
