import { createContext, useContext, useEffect, useState } from 'react';
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

  // Al montar, si hay token guardado, verificamos que sigue siendo válido
  // preguntando al backend quién somos.
  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      setLoading(false);
      return;
    }

    api.get('/api/auth/me')
      .then((res) => {
        setUser(res.data.user);
        localStorage.setItem('user', JSON.stringify(res.data.user));
      })
      .catch(() => {
        // El token es inválido o ha expirado: limpiamos.
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  /**
   * Inicia sesión y guarda token + usuario.
   */
  async function login(email, password) {
    const res = await api.post('/api/auth/login', { email, password });
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data.user;
  }

  /**
   * Registra un usuario nuevo y lo deja logueado.
   */
  async function register(data) {
    const res = await api.post('/api/auth/register', data);
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data.user;
  }

  /**
   * Cierra sesión.
   */
  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: user !== null,
    isStaff: user?.rol === 'ADMIN' || user?.rol === 'VOLUNTARIO',
    isAdmin: user?.rol === 'ADMIN'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook para consumir el contexto de autenticación.
 * Lanza si se usa fuera del AuthProvider (error de programación).
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}
