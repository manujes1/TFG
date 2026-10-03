import axios from 'axios';

/**
 * Cliente axios centralizado para hablar con el backend.
 *
 * Todas las peticiones a la API pasan por aquí, lo que nos permite:
 *  - Definir la baseURL en un solo sitio.
 *  - Inyectar automáticamente el token JWT si el usuario está autenticado.
 *  - Manejar globalmente errores comunes (401 → forzar logout, etc.).
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
});

// Interceptor de petición: añade el token si existe en localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de respuesta: si el backend responde 401 (token expirado o inválido),
// limpiamos la sesión local. El AuthContext detectará el cambio y redirigirá al login.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.dispatchEvent(new Event('auth:expirada'));
    }
    return Promise.reject(error);
  }
);

export default api;
