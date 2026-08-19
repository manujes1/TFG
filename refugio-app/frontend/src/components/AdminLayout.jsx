import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const SECCIONES = [
  { to: '/admin', end: true, label: 'Resumen', icono: '📊' },
  { to: '/admin/animales', label: 'Animales', icono: '🐾' },
  { to: '/admin/adopciones', label: 'Adopciones', icono: '📋' }
];

export default function AdminLayout() {
  const { user } = useAuth();

  const linkClass = ({ isActive }) =>
    `flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition ${
      isActive
        ? 'bg-refugio-100 text-refugio-700'
        : 'text-refugio-900/70 hover:bg-refugio-50'
    }`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-refugio-900 mb-1">
          Panel de administración
        </h1>
        <p className="text-sm font-mono text-refugio-900/50">
          {user.nombre} ·{' '}
          <span className="font-medium text-refugio-700">
            {user.rol === 'ADMIN' ? 'Administrador' : 'Voluntario'}
          </span>
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[200px_1fr]">
        <aside>
          <nav className="bg-papel shadow-card rounded-lg p-2 flex lg:flex-col gap-1 overflow-x-auto border border-refugio-100">
            {SECCIONES.map((seccion) => (
              <NavLink
                key={seccion.to}
                to={seccion.to}
                end={seccion.end}
                className={linkClass}
              >
                <span aria-hidden="true">{seccion.icono}</span>
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
