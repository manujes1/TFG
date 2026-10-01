import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { guardarPerfil } from '../api/recomendaciones.js';
import { useAuth } from '../context/AuthContext.jsx';

const FORM_INICIAL = {
  tipoVivienda: 'piso',
  metrosCuadrados: '',
  jardin: false,
  ninos: false,
  otrosPerros: false,
  otrosGatos: false,
  experiencia: 'ninguna',
  tiempoDiario: 'medio',
  preferenciaEspecie: 'indiferente'
};

export default function PerfilPage() {
  const { user, refrescarUsuario } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [form, setForm] = useState(FORM_INICIAL);
  const [error, setError] = useState(null);
  const [guardado, setGuardado] = useState(false);

  // Precargamos el perfil existente si lo hay
  useEffect(() => {
    const p = user?.preferencias;
    if (!p || Object.keys(p).length === 0) return;
    setForm({
      tipoVivienda: p.tipoVivienda ?? 'piso',
      metrosCuadrados: p.metrosCuadrados ?? '',
      jardin: p.jardin ?? false,
      ninos: p.ninos ?? false,
      otrosPerros: p.otrosPerros ?? false,
      otrosGatos: p.otrosGatos ?? false,
      experiencia: p.experiencia ?? 'ninguna',
      tiempoDiario: p.tiempoDiario ?? 'medio',
      preferenciaEspecie: p.preferenciaEspecie ?? 'indiferente'
    });
  }, [user]);

  const mutation = useMutation({
    mutationFn: guardarPerfil,
    onSuccess: async () => {
      setError(null);
      setGuardado(true);
      await refrescarUsuario();
      queryClient.invalidateQueries({ queryKey: ['recomendaciones'] });
      queryClient.invalidateQueries({ queryKey: ['compatibilidad'] });
    },
    onError: (err) => {
      const detalles = err.response?.data?.details;
      setError(
        detalles?.length
          ? detalles.map((d) => `${d.field}: ${d.message}`).join('. ')
          : err.response?.data?.error || 'No se pudo guardar el perfil'
      );
      setGuardado(false);
    }
  });

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
    setGuardado(false);
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    const payload = {
      tipoVivienda: form.tipoVivienda,
      jardin: form.jardin,
      ninos: form.ninos,
      otrosPerros: form.otrosPerros,
      otrosGatos: form.otrosGatos,
      experiencia: form.experiencia,
      tiempoDiario: form.tiempoDiario,
      preferenciaEspecie: form.preferenciaEspecie
    };
    if (form.metrosCuadrados !== '') {
      payload.metrosCuadrados = Number(form.metrosCuadrados);
    }

    mutation.mutate(payload);
  }

  const inputClass = 'field-input';
  const labelClass = 'field-label';

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div>
        <h1 className="page-title">Tu perfil de adopción</h1>
        <p className="page-subtitle">
          Cuéntanos cómo es tu hogar y tu día a día. Con esta información podemos
          sugerirte los animales que mejor encajan contigo.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-6">
        {/* Hogar */}
        <fieldset className="space-y-4">
          <legend className="text-sm font-semibold text-stone-800 mb-2 uppercase tracking-wide">
            Tu hogar
          </legend>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="tipoVivienda" className={labelClass}>
                Tipo de vivienda
              </label>
              <select
                id="tipoVivienda"
                name="tipoVivienda"
                value={form.tipoVivienda}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="piso">Piso o apartamento</option>
                <option value="casa">Casa</option>
              </select>
            </div>

            <div>
              <label htmlFor="metrosCuadrados" className={labelClass}>
                Superficie aproximada (m²)
              </label>
              <input
                id="metrosCuadrados"
                name="metrosCuadrados"
                type="number"
                min="10"
                max="2000"
                value={form.metrosCuadrados}
                onChange={handleChange}
                placeholder="Opcional"
                className={inputClass}
              />
            </div>
          </div>

          <Checkbox
            name="jardin"
            checked={form.jardin}
            onChange={handleChange}
            label="Dispongo de jardín, patio o terraza amplia"
          />
        </fieldset>

        {/* Convivencia */}
        <fieldset className="space-y-3 pt-4 border-t border-stone-100">
          <legend className="text-sm font-semibold text-stone-800 mb-2 pt-2 uppercase tracking-wide">
            Quién vive contigo
          </legend>

          <Checkbox
            name="ninos"
            checked={form.ninos}
            onChange={handleChange}
            label="Hay niños en casa"
          />
          <Checkbox
            name="otrosPerros"
            checked={form.otrosPerros}
            onChange={handleChange}
            label="Ya tengo perro"
          />
          <Checkbox
            name="otrosGatos"
            checked={form.otrosGatos}
            onChange={handleChange}
            label="Ya tengo gato"
          />
        </fieldset>

        {/* Disponibilidad */}
        <fieldset className="space-y-4 pt-4 border-t border-stone-100">
          <legend className="text-sm font-semibold text-stone-800 mb-2 pt-2 uppercase tracking-wide">
            Tu disponibilidad
          </legend>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="experiencia" className={labelClass}>
                Experiencia previa con animales
              </label>
              <select
                id="experiencia"
                name="experiencia"
                value={form.experiencia}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="ninguna">Sería mi primer animal</option>
                <option value="baja">He tenido alguno puntualmente</option>
                <option value="media">He convivido con animales varios años</option>
                <option value="alta">Tengo mucha experiencia</option>
              </select>
            </div>

            <div>
              <label htmlFor="tiempoDiario" className={labelClass}>
                Tiempo diario que podrías dedicarle
              </label>
              <select
                id="tiempoDiario"
                name="tiempoDiario"
                value={form.tiempoDiario}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="poco">Menos de 1 hora</option>
                <option value="medio">Entre 1 y 3 horas</option>
                <option value="mucho">Más de 3 horas</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="preferenciaEspecie" className={labelClass}>
              ¿Buscas alguna especie en concreto?
            </label>
            <select
              id="preferenciaEspecie"
              name="preferenciaEspecie"
              value={form.preferenciaEspecie}
              onChange={handleChange}
              className={`${inputClass} sm:w-1/2`}
            >
              <option value="indiferente">Me da igual, quiero ver todas</option>
              <option value="PERRO">Perro</option>
              <option value="GATO">Gato</option>
            </select>
          </div>
        </fieldset>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        {guardado && (
          <div className="bg-refugio-50 border border-refugio-200 text-refugio-700 text-sm rounded-lg px-3 py-2 animate-fadeIn">
            ✓ Perfil guardado correctamente.
          </div>
        )}

        <div className="flex flex-wrap gap-2 pt-2">
          <button type="submit" disabled={mutation.isPending} className="btn-primary text-sm px-5 py-2.5">
            {mutation.isPending ? 'Guardando…' : 'Guardar perfil'}
          </button>

          {guardado && (
            <button
              type="button"
              onClick={() => navigate('/recomendaciones')}
              className="btn-secondary text-sm px-5 py-2.5"
            >
              Ver mis recomendaciones →
            </button>
          )}
        </div>
      </form>

      {/* <p className="text-xs text-stone-400 text-center">
        Estos datos se usan únicamente para calcular la compatibilidad y no se
        comparten con terceros.
      </p> */}
    </div>
  );
}

function Checkbox({ name, checked, onChange, label }) {
  return (
    <label className="flex items-center gap-2 text-sm text-stone-700 cursor-pointer">
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
        className="w-4 h-4 rounded border-stone-300 text-refugio-600 focus:ring-refugio-500"
      />
      {label}
    </label>
  );
}
