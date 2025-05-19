import axiosClient from "./axiosClient";

const promotionApi = {
  getAll: () => axiosClient.get("/promotions"),
  create: (data) => axiosClient.post("/promotions", data),
  update: (id, data) => axiosClient.put(`/promotions/${id}`, data),
  delete: (id) => axiosClient.delete(`/promotions/${id}`),
};

export default promotionApi;