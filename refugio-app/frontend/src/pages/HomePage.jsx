import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden bg-refugio-700 rounded-2xl px-8 py-14 sm:py-20 text-center">
        <span
          aria-hidden="true"
          className="absolute -top-6 -right-4 text-[9rem] leading-none opacity-10 rotate-12 select-none"
        >
          🐾
        </span>
        <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-acento-400 bg-refugio-900/40 rounded-full px-3 py-1 mb-5">
          Refugio de animales
        </span>
        <h1 className="font-display text-4xl sm:text-5xl font-semibold text-white mb-4 max-w-2xl mx-auto leading-tight">
          Encuentra a tu nuevo compañero
        </h1>
        <p className="text-refugio-50/80 max-w-xl mx-auto mb-8 text-base sm:text-lg">
          Conoce a los animales que buscan hogar, solicita una adopción,
          apadrina o colabora con una donación.
        </p>
        <Link
          to="/animales"
          className="btn-stamp inline-block bg-acento-500 hover:bg-acento-600 text-white font-semibold rounded-md px-6 py-3 transition"
        >
          Ver animales disponibles →
        </Link>
      </section>

      {user && (
        <section className="bg-acento-50 rounded-xl p-6 border-2 border-dashed border-acento-100 -rotate-1">
          <h2 className="font-semibold text-refugio-900 mb-1">
            Hola, {user.nombre} 👋
          </h2>
          <p className="text-sm text-refugio-900/60">
            Has iniciado sesión como <span className="font-medium">{user.rol}</span>.
          </p>
        </section>
      )}
    </div>
  );
}
