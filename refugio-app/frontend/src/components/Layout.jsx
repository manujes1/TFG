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
    `px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
      isActive
        ? 'bg-refugio-100 text-refugio-700'
        : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
    }`;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white/90 backdrop-blur border-b border-stone-200 shadow-soft sticky top-0 z-10">
        <nav className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link
            to="/"
            className="text-xl font-bold text-refugio-700 shrink-0 tracking-tight hover:text-refugio-800 transition-colors"
          >
            🐾 Refugio
          </Link>

          <div className="flex items-center gap-1 flex-wrap">
            <NavLink to="/" end className={linkClass}>
              Inicio
            </NavLink>
            <NavLink to="/animales" className={linkClass}>
              Animales
            </NavLink>

            {user && !isStaff && (
              <NavLink to="/recomendaciones" className={linkClass}>
                Para ti
              </NavLink>
            )}

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
                <Link
                  to="/perfil"
                  className="text-sm text-stone-600 hover:text-refugio-700 hidden sm:inline transition-colors font-medium"
                >
                  {user.nombre}
                </Link>
                <button onClick={handleLogout} className="btn-ghost text-sm px-3 py-2">
                  Salir
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-ghost text-sm px-3 py-2">
                  Entrar
                </Link>
                <Link to="/registro" className="btn-primary text-sm px-3 py-2">
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

      <footer className="bg-white border-t border-stone-200 py-4">
        <p className="text-center text-xs text-stone-400">
          Refugio de Animales · TFG Ingeniería Informática
        </p>
      </footer>
    </div>
  );
}
