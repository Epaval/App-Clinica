import api from './api';

//Login
export const login = (data) => api.post('/login', data);

//Recuperar Contraseña
export const recuperarContrasena = (data) => api.post('/recuperar-contrasena', data);

//Cambiar Contraseña
export const cambiarContrasena = (data) => api.post('/cambiar-contrasena', data);

// Función de logout
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('rol');
  localStorage.removeItem('usuario_id');
};