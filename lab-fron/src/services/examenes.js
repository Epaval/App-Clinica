import api from './api';

// Obtener todos los perfiles de exámenes
export const getPerfilesExamenes = () => api.get('/perfiles_examenes');

// Obtener todos los exámenes
export const getExamenes = () => api.get('/examenes');

// Obtener exámenes por diagnóstico
export const getExamenesPorDiagnostico = (diagnosticoId) => api.get(`/examenes_por_diagnostico/${diagnosticoId}`);

// Agregar exámenes a diagnóstico
export const addExamenesADiagnostico = (diagnosticoId, data) => api.post(`/examenes_por_diagnostico/${diagnosticoId}`, data);