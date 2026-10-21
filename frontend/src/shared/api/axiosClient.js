import axios from 'axios';
import { STORAGE_KEYS } from '../authStorage';

// Tolera valores mal pegados en el panel de Render: "VITE_API_URL=https://..." o sin el /api final.
function normalizarBaseURL(valor) {
  const url = (valor || 'http://localhost:5000/api')
    .trim()
    .replace(/^VITE_API_URL\s*=\s*/, '')
    .replace(/^["']|["']$/g, '')
    .replace(/\/+$/, '');
  return url.endsWith('/api') ? url : `${url}/api`;
}

const baseURL = normalizarBaseURL(import.meta.env.VITE_API_URL);

const axiosClient = axios.create({ baseURL });

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(STORAGE_KEYS.token);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

let unauthorizedHandler = null;

export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler;
}

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const teniaSesion = !!localStorage.getItem(STORAGE_KEYS.token);
    if (error.response?.status === 401 && teniaSesion && unauthorizedHandler) {
      unauthorizedHandler();
    }
    return Promise.reject(error);
  }
);

export function getErrorMessage(error, fallback = 'Ocurrio un error inesperado') {
  return error?.response?.data?.error || fallback;
}

export default axiosClient;
