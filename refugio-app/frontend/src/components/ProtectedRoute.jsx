import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

/**
 * Envuelve rutas que requieren sesión.
 *
 * @param {React.ReactNode} children - Contenido protegido.
 * @param {string[]} [roles] - Si se indica, además exige que el usuario
 *                             tenga uno de esos roles.
 */
export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Mientras verificamos el token no decidimos nada
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-refugio-50">
        <p className="text-gray-600">Cargando…</p>
      </div>
    );
  }

  // No autenticado: al login, recordando de dónde veníamos
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Autenticado pero sin el rol necesario
  if (roles && !roles.includes(user.rol)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-refugio-50 p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Acceso denegado</h1>
        <p className="text-gray-600">No tienes permisos para ver esta página.</p>
      </div>
    );
  }

  return children;
}
