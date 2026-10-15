import api from "./api.js";

export const fileService = {
  async list() {
    const { data } = await api.get("/files");
    return data.files;
  },
  async upload(file, taskId, onProgress) {
    const form = new FormData();
    form.append("file", file);
    if (taskId) form.append("task_id", taskId);
    const { data } = await api.post("/files/upload", form, {
      onUploadProgress: (e) => {
        if (e.total && onProgress) onProgress(Math.round((e.loaded / e.total) * 100));
      },
    });
    return data.file;
  },
  downloadUrl(id) {
    const token = localStorage.getItem("tf_token");
    // Backend streams the file for local storage (auth via query is NOT
    // used); instead fetch with the Bearer header and blob it. Simpler and
    // keeps the token out of URLs. See Notes.jsx.
    return { url: `${api.defaults.baseURL}/files/${id}/download`, token };
  },
  async downloadBlob(id) {
    const { data, headers } = await api.get(`/files/${id}/download`, {
      responseType: "blob",
    });
    return { blob: data, contentType: headers["content-type"] };
  },
  async remove(id) {
    const { data } = await api.delete(`/files/${id}`);
    return data;
  },
};
