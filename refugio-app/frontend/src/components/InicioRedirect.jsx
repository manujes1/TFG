import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

/**
 * Página de inicio según el rol: el personal del refugio (admin y
 * trabajador) va directo al panel de gestión; el resto ve la página
 * de bienvenida.
 */
export default function InicioRedirect({ children }) {
  const { isStaff, loading } = useAuth();

  // Mientras se comprueba la sesión no mostramos nada, para que el
  // personal no vea la bienvenida un instante antes de ir al panel
  if (loading) return null;
  if (isStaff) return <Navigate to="/admin" replace />;
  return children;
}
