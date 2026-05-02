/**
 * api.js - Cliente axios y endpoints REST.
 * Centraliza toda la comunicación con el backend (puerto 3002).
 */
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  headers: { 'Content-Type': 'application/json' },
});

export const herramientasAPI = {
  getAll: () => api.get('/herramientas'),
  getById: (id) => api.get(`/herramientas/${id}`),
  create: (data) => api.post('/herramientas', data),
  update: (id, data) => api.put(`/herramientas/${id}`, data),
  delete: (id) => api.delete(`/herramientas/${id}`),
};

export const prestamosAPI = {
  getAll: () => api.get('/prestamos'),
  create: (data) => api.post('/prestamos', data),
  devolver: (id) => api.put(`/prestamos/${id}/devolver`),
  getVencidos: () => api.get('/prestamos/vencidos'),
};

export const informesAPI = {
  resumen: () => api.get('/informes/resumen'),
};
