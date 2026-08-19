import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nombre: '',
    apellidos: '',
    email: '',
    password: '',
    telefono: ''
  });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      // Quitamos campos opcionales vacíos para no enviarlos como ""
      const payload = Object.fromEntries(
        Object.entries(form).filter(([, v]) => v !== '')
      );
      await register(payload);
      navigate('/', { replace: true });
    } catch (err) {
      const details = err.response?.data?.details;
      if (details?.length) {
        setError(details.map((d) => d.message).join('. '));
      } else {
        setError(err.response?.data?.error || 'No se pudo completar el registro');
      }
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    'w-full border border-refugio-100 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-acento-400 focus:border-acento-400';

  return (
    <div className="min-h-screen bg-refugio-50 flex items-center justify-center p-4">
      <div className="kennel-tag bg-papel shadow-card rounded-lg p-8 w-full max-w-md border-t-2 border-dashed border-refugio-100">
        <h1 className="font-display text-2xl font-semibold text-refugio-900 mb-1">Crear cuenta</h1>
        <p className="text-sm text-refugio-900/60 mb-6">
          Regístrate para solicitar adopciones, apadrinar o donar.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="nombre" className="block text-sm font-medium text-refugio-900/80 mb-1">
                Nombre *
              </label>
              <input
                id="nombre"
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="apellidos" className="block text-sm font-medium text-refugio-900/80 mb-1">
                Apellidos
              </label>
              <input
                id="apellidos"
                name="apellidos"
                value={form.apellidos}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-refugio-900/80 mb-1">
              Email *
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="email"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-refugio-900/80 mb-1">
              Contraseña *
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
              minLength={8}
              autoComplete="new-password"
              className={inputClass}
            />
            <p className="text-xs text-refugio-900/50 mt-1">Mínimo 8 caracteres.</p>
          </div>

          <div>
            <label htmlFor="telefono" className="block text-sm font-medium text-refugio-900/80 mb-1">
              Teléfono
            </label>
            <input
              id="telefono"
              name="telefono"
              value={form.telefono}
              onChange={handleChange}
              className={inputClass}
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
            {submitting ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        <p className="text-sm text-refugio-900/60 mt-6 text-center">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-refugio-700 hover:underline font-medium">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
