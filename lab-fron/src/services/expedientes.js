import api from './api';

// Obtener expediente de un paciente
export const getExpedienteByPaciente = (pacienteId) => api.get(`/expedientes/${pacienteId}`);

// Obtener diagnósticos de un expediente
export const getDiagnosticosByExpediente = (pacienteId) => api.get(`/expedientes/${pacienteId}/diagnosticos`);

// Crear nuevo diagnóstico
export const createDiagnostico = (pacienteId, data) => api.post(`/expedientes/${pacienteId}/diagnosticos`, data);