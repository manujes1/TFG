import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function InicioRedirect({ children }) {
  const { isStaff, loading } = useAuth();

  // Sin esto, el personal vería la bienvenida un instante antes de ir al panel
  if (loading) return null;
  if (isStaff) return <Navigate to="/admin" replace />;
  return children;
}
