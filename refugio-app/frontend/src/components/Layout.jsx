import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Layout() {
  const { user, isStaff, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/', { replace: true });
  }

  const linkClass = ({ isActive }) =>
    `px-3 py-2 rounded-lg text-sm font-medium transition ${
      isActive
        ? 'bg-refugio-100 text-refugio-700'
        : 'text-gray-700 hover:bg-gray-100'
    }`;

  return (
    <div className="min-h-screen bg-refugio-50 flex flex-col">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <nav className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link to="/" className="text-xl font-bold text-refugio-700 shrink-0">
            🐾 Refugio
          </Link>

          <div className="flex items-center gap-1 flex-wrap">
            <NavLink to="/" end className={linkClass}>
              Inicio
            </NavLink>
            <NavLink to="/animales" className={linkClass}>
              Animales
            </NavLink>

            {user && (
              <NavLink to="/mis-solicitudes" className={linkClass}>
                Mis solicitudes
              </NavLink>
            )}

            {isStaff && (
              <NavLink to="/admin" className={linkClass}>
                Panel
              </NavLink>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {user ? (
              <>
                <span className="text-sm text-gray-600 hidden sm:inline">
                  {user.nombre}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-sm px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition"
                >
                  Salir
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition"
                >
                  Entrar
                </Link>
                <Link
                  to="/registro"
                  className="text-sm px-3 py-2 rounded-lg bg-refugio-600 hover:bg-refugio-700 text-white font-medium transition"
                >
                  Registro
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        <Outlet />
      </main>

      <footer className="bg-white border-t py-4">
        <p className="text-center text-xs text-gray-500">
          Refugio de Animales · TFG Ingeniería Informática
        </p>
      </footer>
    </div>
  );
}
