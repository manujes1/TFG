import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-stone-500">Cargando…</p>
      </div>
    );
  }

  if (!user) {
    // Sin sesión: al login, guardando la ruta para volver después
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && !roles.includes(user.rol)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8">
        <h1 className="text-2xl font-bold text-stone-900 tracking-tight mb-2">Acceso denegado</h1>
        <p className="text-stone-500">No tienes permisos para ver esta página.</p>
      </div>
    );
  }

  return children;
}
