import axiosClient from "./axiosClient";

const stockReceiptApi = {
  getAll: (params) => axiosClient.get("/stockreceipt", { params }),
  create: (data) => axiosClient.post("/stockreceipt", data),
  update: (id, data) => axiosClient.put(`/stockreceipt/${id}`, data),
  delete: (id) => axiosClient.delete(`/stockreceipt/${id}`),
};

export default stockReceiptApi;