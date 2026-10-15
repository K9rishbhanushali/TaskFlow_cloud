import api from "./api.js";

export const taskService = {
  async list(params = {}) {
    const { data } = await api.get("/tasks", { params });
    return data; // { tasks, total, page, per_page, pages }
  },
  async get(id) {
    const { data } = await api.get(`/tasks/${id}`);
    return data.task;
  },
  async create(payload) {
    const { data } = await api.post("/tasks", payload);
    return data.task;
  },
  async update(id, payload) {
    const { data } = await api.put(`/tasks/${id}`, payload);
    return data.task;
  },
  async setStatus(id, status) {
    const { data } = await api.patch(`/tasks/${id}/status`, { status });
    return data.task;
  },
  async remove(id) {
    const { data } = await api.delete(`/tasks/${id}`);
    return data;
  },
};
