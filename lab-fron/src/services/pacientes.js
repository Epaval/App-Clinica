import api from './api';

export const getPacientes = () => api.get('/pacientes');
export const createPaciente = (data) => api.post('/pacientes', data);
export const updatePaciente = (id, data) => api.put(`/pacientes/${id}`, data);
export const deletePaciente = (id) => api.delete(`/pacientes/${id}`);