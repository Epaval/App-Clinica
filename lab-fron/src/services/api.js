import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000'; // Ajusta si tu backend está en otro puerto

const api = axios.create({
  baseURL: API_BASE_URL,
});

export default api;