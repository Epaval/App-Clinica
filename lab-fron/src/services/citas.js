import api from './api';

export const getCitas = () => api.get('/citas');
export const createCita = (data) => api.post('/citas', data);
export const updateCita = (id, data) => api.put(`/citas/${id}`, data);
export const deleteCita = (id) => api.delete(`/citas/${id}`);