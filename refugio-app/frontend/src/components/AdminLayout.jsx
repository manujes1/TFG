import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { ROLES } from '../utils/constants.js';

const SECCIONES = [
  { to: '/admin', end: true, label: 'Resumen' },
  { to: '/admin/animales', label: 'Animales' },
  { to: '/admin/adopciones', label: 'Adopciones' },
  { to: '/admin/usuarios', label: 'Usuarios', soloAdmin: true }
];

export default function AdminLayout() {
  const { user, isAdmin } = useAuth();
  const secciones = SECCIONES.filter((s) => !s.soloAdmin || isAdmin);

  const linkClass = ({ isActive }) =>
    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
      isActive
        ? 'bg-refugio-600 text-white shadow-sm'
        : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
    }`;

  return (
    <div className="space-y-6">
      <div className="border-b border-stone-200 pb-4">
        <h1 className="page-title">Panel de administración</h1>
        <p className="page-subtitle">
          Sesión de <span className="font-medium text-stone-700">{user.nombre}</span> ·{' '}
          <span className="font-medium text-refugio-700">
            {ROLES[user.rol]}
          </span>
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[200px_1fr]">
        <aside>
          <nav className="card p-2 flex lg:flex-col gap-1 overflow-x-auto">
            {secciones.map((seccion) => (
              <NavLink
                key={seccion.to}
                to={seccion.to}
                end={seccion.end}
                className={linkClass}
              >
                <span className="whitespace-nowrap">{seccion.label}</span>
              </NavLink>
            ))}
          </nav>
        </aside>

        <div className="min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
