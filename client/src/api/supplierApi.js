import axiosClient from "./axiosClient";

const supplierApi = {
  getAll: () => {
    return axiosClient.get("/suppliers");
  },
  create: (data) => {
    return axiosClient.post("/suppliers", data);
  },
  update: (id, data) => {
    return axiosClient.put(`/suppliers/${id}`, data);
  },
  delete: (id) => {
    return axiosClient.delete(`/suppliers/${id}`);
  }
};

export default supplierApi;