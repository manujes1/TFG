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
      // Los campos opcionales vacíos no se envían
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

  const inputClass = 'field-input';

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="card shadow-elevated p-8 w-full max-w-md">
        <div className="text-2xl mb-2" aria-hidden="true">🐾</div>
        <h1 className="text-2xl font-bold text-stone-900 tracking-tight mb-1">Crear cuenta</h1>
        <p className="text-sm text-stone-500 mb-6">
          Regístrate para solicitar adopciones, apadrinar o donar.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="nombre" className="field-label">
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
              <label htmlFor="apellidos" className="field-label">
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
            <label htmlFor="email" className="field-label">
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
            <label htmlFor="password" className="field-label">
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
            <p className="text-xs text-stone-500 mt-1">Mínimo 8 caracteres.</p>
          </div>

          <div>
            <label htmlFor="telefono" className="field-label">
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
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <button type="submit" disabled={submitting} className="btn-primary w-full py-2.5">
            {submitting ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        <p className="text-sm text-stone-500 mt-6 text-center">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-refugio-600 hover:underline font-medium">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
