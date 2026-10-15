import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api from '../api/client.js';

const AuthContext = createContext(null);

/**
 * Proveedor de autenticación.
 * Mantiene el usuario actual en estado y lo sincroniza con localStorage,
 * de modo que la sesión sobreviva a recargas de página.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * Vuelve a pedir los datos del usuario al backend.
   * Se usa tras modificar el perfil, para que el contexto refleje los cambios.
   */
  const refrescarUsuario = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      const res = await api.get('http://localhost:3001/api/auth/me');
      setUser(res.data.user);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      return res.data.user;
    } catch {
      return null;
    }
  }, []);

  // Al montar, si hay token guardado, verificamos que sigue siendo válido
  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      setLoading(false);
      return;
    }

    api.get('http://localhost:3001/api/auth/me')
      .then((res) => {
        setUser(res.data.user);
        localStorage.setItem('user', JSON.stringify(res.data.user));
      })
      .catch(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  // Si el interceptor detecta un 401, cerramos la sesión en el estado de React
  useEffect(() => {
    const onExpirada = () => setUser(null);
    window.addEventListener('auth:expirada', onExpirada);
    return () => window.removeEventListener('auth:expirada', onExpirada);
  }, []);

  async function login(email, password) {
    const res = await api.post('http://localhost:3001/api/auth/login', { email, password });
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data.user;
  }

  async function register(data) {
    const res = await api.post('http://localhost:3001/api/auth/register', data);
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data.user;
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }

  const tienePerfil =
    user?.preferencias != null && Object.keys(user.preferencias).length > 0;

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    refrescarUsuario,
    isAuthenticated: user !== null,
    isStaff: user?.rol === 'ADMIN' || user?.rol === 'VOLUNTARIO',
    isAdmin: user?.rol === 'ADMIN',
    tienePerfil
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}
