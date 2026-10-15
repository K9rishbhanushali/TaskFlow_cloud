import api from "./api.js";

export const authService = {
  async register({ name, email, password }) {
    const { data } = await api.post("/auth/register", { name, email, password });
    return data; // { user, access_token }
  },
  async login({ email, password }) {
    const { data } = await api.post("/auth/login", { email, password });
    return data;
  },
  async me() {
    const { data } = await api.get("/auth/me");
    return data.user;
  },
  async updateName(name) {
    const { data } = await api.patch("/auth/me", { name });
    return data.user;
  },
};
