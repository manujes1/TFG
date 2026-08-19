import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchAnimalById,
  createAnimal,
  updateAnimal
} from '../../api/animales.js';
import GestionFotos from '../../components/GestionFotos.jsx';
import { ESPECIES, SEXOS, ESTADOS_ANIMAL } from '../../utils/constants.js';
import GenerarDescripcionIA from '../../components/GenerarDescripcionIA.jsx';

const FORM_INICIAL = {
  nombre: '',
  especie: 'PERRO',
  raza: '',
  sexo: 'MACHO',
  edadEstimada: '',
  peso: '',
  color: '',
  chip: '',
  estado: 'DISPONIBLE',
  ubicacion: '',
  descripcionManual: '',
  energia: '',
  temperamento: '',
  aptoNinos: false,
  aptoOtrosPerros: false,
  aptoGatos: false
};

export default function AnimalFormPage() {
  const { id } = useParams();
  const esEdicion = Boolean(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [form, setForm] = useState(FORM_INICIAL);
  const [error, setError] = useState(null);

  // En edición, cargamos el animal existente
  const { data: animal, isPending: cargando } = useQuery({
    queryKey: ['animal', id],
    queryFn: () => fetchAnimalById(id),
    enabled: esEdicion
  });

  // Rellenamos el formulario cuando llegan los datos
  useEffect(() => {
    if (!animal) return;
    const c = animal.caracteristicas ?? {};
    setForm({
      nombre: animal.nombre ?? '',
      especie: animal.especie ?? 'PERRO',
      raza: animal.raza ?? '',
      sexo: animal.sexo ?? 'MACHO',
      edadEstimada: animal.edadEstimada ?? '',
      peso: animal.peso ?? '',
      color: animal.color ?? '',
      chip: animal.chip ?? '',
      estado: animal.estado ?? 'DISPONIBLE',
      ubicacion: animal.ubicacion ?? '',
      descripcionManual: animal.descripcionManual ?? '',
      energia: c.energia ?? '',
      temperamento: c.temperamento ?? '',
      aptoNinos: c.aptoNinos ?? false,
      aptoOtrosPerros: c.aptoOtrosPerros ?? false,
      aptoGatos: c.aptoGatos ?? false
    });
  }, [animal]);

  const mutation = useMutation({
    mutationFn: (payload) =>
      esEdicion ? updateAnimal(id, payload) : createAnimal(payload),
    onSuccess: (animalGuardado) => {
      queryClient.invalidateQueries({ queryKey: ['animales'] });
      queryClient.invalidateQueries({ queryKey: ['estadisticas'] });
      if (esEdicion) {
        queryClient.invalidateQueries({ queryKey: ['animal', id] });
        navigate('/admin/animales');
      } else {
        // Tras crear, vamos a la edición para poder subir fotos
        navigate(`/admin/animales/${animalGuardado.id}/editar`);
      }
    },
    onError: (err) => {
      const detalles = err.response?.data?.details;
      if (detalles?.length) {
        setError(detalles.map((d) => `${d.field}: ${d.message}`).join('. '));
      } else {
        setError(err.response?.data?.error || 'No se pudo guardar el animal');
      }
    }
  });

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    // Construimos el payload que espera el backend:
    // - campos opcionales vacíos se omiten
    // - números se envían como number, no como string
    const payload = {
      nombre: form.nombre.trim(),
      especie: form.especie,
      sexo: form.sexo,
      estado: form.estado,
      caracteristicas: {
        energia: form.energia || undefined,
        temperamento: form.temperamento || undefined,
        aptoNinos: form.aptoNinos,
        aptoOtrosPerros: form.aptoOtrosPerros,
        aptoGatos: form.aptoGatos
      }
    };

    if (form.raza.trim()) payload.raza = form.raza.trim();
    if (form.color.trim()) payload.color = form.color.trim();
    if (form.chip.trim()) payload.chip = form.chip.trim();
    if (form.ubicacion.trim()) payload.ubicacion = form.ubicacion.trim();
    if (form.descripcionManual.trim()) {
      payload.descripcionManual = form.descripcionManual.trim();
    }
    if (form.edadEstimada !== '') payload.edadEstimada = Number(form.edadEstimada);
    if (form.peso !== '') payload.peso = Number(form.peso);

    // Limpiamos claves undefined dentro de caracteristicas
    payload.caracteristicas = Object.fromEntries(
      Object.entries(payload.caracteristicas).filter(([, v]) => v !== undefined)
    );

    mutation.mutate(payload);
  }

  if (esEdicion && cargando) {
    return <p className="text-center text-gray-500 py-12">Cargando…</p>;
  }

  const inputClass =
    'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-refugio-500';
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-gray-800">
          {esEdicion ? `Editar a ${animal?.nombre ?? ''}` : 'Nuevo animal'}
        </h2>
        <div className="flex gap-3 shrink-0">
          {esEdicion && (
            <Link
              to={`/admin/animales/${id}/expedientes`}
              className="text-sm text-refugio-600 hover:underline"
            >
              Historial médico
            </Link>
          )}
          <Link to="/admin/animales" className="text-sm text-refugio-600 hover:underline">
            ← Volver al listado
          </Link>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-papel shadow rounded-xl p-6 space-y-5">
        {/* Datos básicos */}
        <fieldset className="space-y-4">
          <legend className="text-sm font-semibold text-gray-800 mb-2">
            Datos básicos
          </legend>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="nombre" className={labelClass}>Nombre *</label>
              <input
                id="nombre"
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                required
                maxLength={50}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="especie" className={labelClass}>Especie *</label>
              <select
                id="especie"
                name="especie"
                value={form.especie}
                onChange={handleChange}
                className={inputClass}
              >
                {Object.entries(ESPECIES).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="raza" className={labelClass}>Raza</label>
              <input
                id="raza"
                name="raza"
                value={form.raza}
                onChange={handleChange}
                maxLength={50}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="sexo" className={labelClass}>Sexo *</label>
              <select
                id="sexo"
                name="sexo"
                value={form.sexo}
                onChange={handleChange}
                className={inputClass}
              >
                {Object.entries(SEXOS).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="edadEstimada" className={labelClass}>Edad estimada (años)</label>
              <input
                id="edadEstimada"
                name="edadEstimada"
                type="number"
                min="0"
                max="40"
                value={form.edadEstimada}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="peso" className={labelClass}>Peso (kg)</label>
              <input
                id="peso"
                name="peso"
                type="number"
                min="0"
                step="0.1"
                value={form.peso}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="color" className={labelClass}>Color</label>
              <input
                id="color"
                name="color"
                value={form.color}
                onChange={handleChange}
                maxLength={50}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="chip" className={labelClass}>Nº de chip</label>
              <input
                id="chip"
                name="chip"
                value={form.chip}
                onChange={handleChange}
                maxLength={30}
                className={inputClass}
              />
              <p className="text-xs text-gray-500 mt-1">Debe ser único.</p>
            </div>

            <div>
              <label htmlFor="estado" className={labelClass}>Estado *</label>
              <select
                id="estado"
                name="estado"
                value={form.estado}
                onChange={handleChange}
                className={inputClass}
              >
                {Object.entries(ESTADOS_ANIMAL).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="ubicacion" className={labelClass}>Ubicación</label>
              <input
                id="ubicacion"
                name="ubicacion"
                value={form.ubicacion}
                onChange={handleChange}
                maxLength={50}
                placeholder="Zona A - Jaula 3"
                className={inputClass}
              />
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label htmlFor="descripcionManual" className={labelClass}>Descripción</label>
              <textarea
                id="descripcionManual"
                name="descripcionManual"
                rows={5}
                value={form.descripcionManual}
                onChange={handleChange}
                maxLength={2000}
                className={inputClass}
              />
              <p className="text-xs text-gray-500 mt-1">
                {form.descripcionManual.length} / 2000 caracteres
              </p>
            </div>

            {/* La generación requiere un animal ya creado, porque el modelo
                necesita sus datos persistidos para construir el prompt */}
            {esEdicion && (
              <GenerarDescripcionIA
                animalId={id}
                onAceptar={(texto) =>
                  setForm((actual) => ({ ...actual, descripcionManual: texto }))
                }
              />
            )}
          </div>
        </fieldset>

        {/* Características para matchmaking */}
        <fieldset className="space-y-4 pt-2 border-t border-gray-100">
          <legend className="text-sm font-semibold text-gray-800 mb-2 pt-4">
            Carácter y convivencia
          </legend>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="energia" className={labelClass}>Nivel de energía</label>
              <select
                id="energia"
                name="energia"
                value={form.energia}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">Sin especificar</option>
                <option value="baja">Baja</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
              </select>
            </div>

            <div>
              <label htmlFor="temperamento" className={labelClass}>Temperamento</label>
              <select
                id="temperamento"
                name="temperamento"
                value={form.temperamento}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">Sin especificar</option>
                <option value="sociable">Sociable</option>
                <option value="calmado">Calmado</option>
                <option value="juguetón">Juguetón</option>
                <option value="independiente">Independiente</option>
                <option value="tímido">Tímido</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-6">
            <Checkbox
              name="aptoNinos"
              checked={form.aptoNinos}
              onChange={handleChange}
              label="Apto con niños"
            />
            <Checkbox
              name="aptoOtrosPerros"
              checked={form.aptoOtrosPerros}
              onChange={handleChange}
              label="Apto con perros"
            />
            <Checkbox
              name="aptoGatos"
              checked={form.aptoGatos}
              onChange={handleChange}
              label="Apto con gatos"
            />
          </div>
        </fieldset>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="bg-refugio-600 hover:bg-refugio-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg px-5 py-2.5 transition"
          >
            {mutation.isPending
              ? 'Guardando…'
              : esEdicion
                ? 'Guardar cambios'
                : 'Crear animal'}
          </button>
          <Link
            to="/admin/animales"
            className="text-sm text-gray-600 hover:bg-gray-100 rounded-lg px-5 py-2.5 transition"
          >
            Cancelar
          </Link>
        </div>
      </form>

      {/* Las fotos solo se gestionan sobre un animal ya creado */}
      {esEdicion && animal && (
        <GestionFotos animalId={animal.id} fotos={animal.fotos ?? []} />
      )}
    </div>
  );
}

function Checkbox({ name, checked, onChange, label }) {
  return (
    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
        className="w-4 h-4 rounded border-gray-300 text-refugio-600 focus:ring-refugio-500"
      />
      {label}
    </label>
  );
}
