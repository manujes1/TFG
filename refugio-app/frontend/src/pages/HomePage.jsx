import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import ResumenUsuario from '../components/ResumenUsuario.jsx';

export default function HomePage() {
  const { user } = useAuth();

  if (user) return <ResumenUsuario />;

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-refugio-600 via-refugio-700 to-refugio-800 p-8 sm:p-12 text-center shadow-elevated">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 20%, white 0, transparent 35%), radial-gradient(circle at 80% 60%, white 0, transparent 30%)'
          }}
          aria-hidden="true"
        />
        <div className="relative">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
            Encuentra a tu nuevo compañero
          </h1>
          <p className="text-refugio-50 max-w-xl mx-auto mb-6">
            Somos un refugio de animales. Aquí puedes conocer a los animales que
            buscan hogar, solicitar una adopción, apadrinar o colaborar con una
            donación.
          </p>
          <Link
            to="/animales"
            className="inline-block bg-white text-refugio-700 font-semibold rounded-lg px-6 py-3 shadow-md transition-all duration-150 hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98]"
          >
            Ver animales disponibles
          </Link>
        </div>
      </section>
    </div>
  );
}
