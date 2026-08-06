import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      <section className="bg-white shadow rounded-xl p-8 text-center">
        <h1 className="text-3xl font-bold text-refugio-700 mb-3">
          Encuentra a tu nuevo compañero
        </h1>
        <p className="text-gray-600 max-w-xl mx-auto mb-6">
          Somos un refugio de animales. Aquí puedes conocer a los animales que
          buscan hogar, solicitar una adopción, apadrinar o colaborar con una
          donación.
        </p>
        <Link
          to="/animales"
          className="inline-block bg-refugio-600 hover:bg-refugio-700 text-white font-medium rounded-lg px-6 py-3 transition"
        >
          Ver animales disponibles
        </Link>
      </section>

      {user && (
        <section className="bg-white shadow rounded-xl p-6">
          <h2 className="font-semibold text-gray-800 mb-1">
            Hola, {user.nombre} 👋
          </h2>
          <p className="text-sm text-gray-600">
            Has iniciado sesión como <span className="font-medium">{user.rol}</span>.
          </p>
        </section>
      )}
    </div>
  );
}
