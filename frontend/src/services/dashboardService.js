import api from "./api.js";

export const dashboardService = {
  async stats() {
    const { data } = await api.get("/dashboard/stats");
    return data;
  },
};
