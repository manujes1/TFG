import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Si veníamos de una ruta protegida, volvemos allí tras el login
  const from = location.state?.from?.pathname || '/';

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo iniciar sesión');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-refugio-50 flex items-center justify-center p-4">
      <div className="kennel-tag bg-papel shadow-card rounded-lg p-8 w-full max-w-md border-t-2 border-dashed border-refugio-100">
        <h1 className="font-display text-2xl font-semibold text-refugio-900 mb-1">
          Iniciar sesión
        </h1>
        <p className="text-sm text-refugio-900/60 mb-6">
          Accede para gestionar el refugio o seguir tus solicitudes.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-refugio-900/80 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full border border-refugio-100 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-acento-400 focus:border-acento-400"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-refugio-900/80 mb-1">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full border border-refugio-100 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-acento-400 focus:border-acento-400"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md px-3 py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="btn-stamp w-full bg-acento-500 hover:bg-acento-600 disabled:opacity-50 text-white font-semibold rounded-md py-2 transition"
          >
            {submitting ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="text-sm text-refugio-900/60 mt-6 text-center">
          ¿No tienes cuenta?{' '}
          <Link to="/registro" className="text-refugio-700 hover:underline font-medium">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  );
}
