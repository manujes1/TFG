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
    `relative px-1 py-2 text-sm font-medium transition after:absolute after:left-0 after:right-0 after:-bottom-0.5 after:h-0.5 after:rounded-full after:transition-transform after:origin-left ${
      isActive
        ? 'text-refugio-700 after:bg-acento-500 after:scale-x-100'
        : 'text-refugio-900/70 hover:text-refugio-700 after:bg-acento-500 after:scale-x-0 hover:after:scale-x-100'
    }`;

  return (
    <div className="min-h-screen bg-refugio-50 flex flex-col">
      <header className="bg-papel/95 backdrop-blur border-b-2 border-dashed border-refugio-200 sticky top-0 z-10">
        <nav className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-6">
          <Link to="/" className="flex items-center gap-2 shrink-0 group">
            <span className="grid place-items-center w-8 h-8 rounded-full bg-refugio-700 text-acento-100 text-sm rotate-[-6deg] group-hover:rotate-0 transition-transform">
              🐾
            </span>
            <span className="font-display text-lg font-semibold tracking-tight text-refugio-900">
              Refugio
            </span>
          </Link>

          <div className="flex items-center gap-5 flex-wrap">
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
                  className="text-sm text-refugio-900/70 hover:text-refugio-700 hidden sm:inline transition"
                >
                  {user.nombre}
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-sm px-3 py-2 rounded-md text-refugio-900/70 hover:bg-refugio-100 transition"
                >
                  Salir
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm px-3 py-2 rounded-md text-refugio-900/70 hover:bg-refugio-100 transition"
                >
                  Entrar
                </Link>
                <Link
                  to="/registro"
                  className="text-sm px-4 py-2 rounded-md bg-acento-500 hover:bg-acento-600 text-white font-semibold transition"
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

      <footer className="border-t-2 border-dashed border-refugio-200 py-6">
        <p className="text-center text-xs font-mono tracking-wide text-refugio-900/50 uppercase">
          Refugio de Animales · TFG Ingeniería Informática
        </p>
      </footer>
    </div>
  );
}
