import api from "./api.js";

export const authService = {
  async register({ name, email, password }) {
    const { data } = await api.post("/api/auth/register", { name, email, password });
    return data; // { user, access_token }
  },
  async login({ email, password }) {
    const { data } = await api.post("/api/auth/login", { email, password });
    return data;
  },
  async me() {
    const { data } = await api.get("/api/auth/me");
    return data.user;
  },
  async updateName(name) {
    const { data } = await api.patch("/api/auth/me", { name });
    return data.user;
  },
};
