
import api from "./api.js";

export const taskService = {
  async list(params = {}) {
    const { data } = await api.get("/api/tasks", { params });
    return data;
  },
  async get(id) {
    const { data } = await api.get(`/api/tasks/${id}`);
    return data.task;
  },
  async create(payload) {
    const { data } = await api.post("/api/tasks", payload);
    return data.task;
  },
  async update(id, payload) {
    const { data } = await api.put(`/api/tasks/${id}`, payload);
    return data.task;
  },
  async setStatus(id, status) {
    const { data } = await api.patch(`/api/tasks/${id}/status`, { status });
    return data.task;
  },
  async remove(id) {
    const { data } = await api.delete(`/api/tasks/${id}`);
    return data;
  },
};
