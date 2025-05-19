import axiosClient from './axiosClient';

const publisherApi = {
  getAll: (params) => {
    return axiosClient.get('/publishers', { params });
  },
  create: (data) => {
    return axiosClient.post('/publishers', data);
  },
  update: (id, data) => {
    return axiosClient.put(`/publishers/${id}`, data);
  },
  delete: (id) => {
    return axiosClient.delete(`/publishers/${id}`);
  }
};

export default publisherApi;