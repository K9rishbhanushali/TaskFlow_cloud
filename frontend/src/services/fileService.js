
import api from "./api.js";

export const fileService = {
  async list() {
    const { data } = await api.get("/api/files");
    return data.files;
  },

  async upload(file, taskId, onProgress) {
    const form = new FormData();
    form.append("file", file);
    if (taskId) form.append("task_id", taskId);

    const { data } = await api.post("/api/files/upload", form, {
      onUploadProgress: (e) => {
        if (e.total && onProgress) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      },
    });
    return data.file;
  },

  downloadUrl(id) {
    const token = localStorage.getItem("tf_token");
    return { url: `${api.defaults.baseURL}/api/files/${id}/download`, token };
  },

  async downloadBlob(id) {
    const { data, headers } = await api.get(`/api/files/${id}/download`, {
      responseType: "blob",
    });
    return { blob: data, contentType: headers["content-type"] };
  },

  async remove(id) {
    const { data } = await api.delete(`/api/files/${id}`);
    return data;
  },
};
