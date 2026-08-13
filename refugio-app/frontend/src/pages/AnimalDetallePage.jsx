import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAnimalById } from '../api/animales.js';
import { createAdopcion } from '../api/adopciones.js';
import { createApadrinamiento } from '../api/apadrinamientos.js';
import { useAuth } from '../context/AuthContext.jsx';
import EstadoBadge from '../components/EstadoBadge.jsx';
import HistorialMedico from '../components/HistorialMedico.jsx';
import CompatibilidadAnimal from '../components/CompatibilidadAnimal.jsx';
import {
  ESPECIES,
  SEXOS,
  ESTADOS_ANIMAL,
  ESTADO_ANIMAL_COLORES,
  fotoUrl
} from '../utils/constants.js';
import { formatFecha, formatPeso } from '../utils/format.js';

export default function AnimalDetallePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isStaff } = useAuth();
  const queryClient = useQueryClient();

  const [fotoActiva, setFotoActiva] = useState(0);
  const [notasAdopcion, setNotasAdopcion] = useState('');
  const [mostrarFormAdopcion, setMostrarFormAdopcion] = useState(false);
  const [cantidadApadrinamiento, setCantidadApadrinamiento] = useState(15);
  const [mostrarFormApadrinar, setMostrarFormApadrinar] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const { data: animal, isPending, isError, error } = useQuery({
    queryKey: ['animal', id],
    queryFn: () => fetchAnimalById(id)
  });

  const adopcionMutation = useMutation({
    mutationFn: createAdopcion,
    onSuccess: () => {
      setMostrarFormAdopcion(false);
      setNotasAdopcion('');
      setFeedback({ tipo: 'ok', texto: 'Solicitud enviada. El refugio la revisará pronto.' });
      queryClient.invalidateQueries({ queryKey: ['misAdopciones'] });
    },
    onError: (err) => {
      setFeedback({
        tipo: 'error',
        texto: err.response?.data?.error || 'No se pudo enviar la solicitud'
      });
    }
  });

  const apadrinamientoMutation = useMutation({
    mutationFn: createApadrinamiento,
    onSuccess: () => {
      setMostrarFormApadrinar(false);
      setFeedback({ tipo: 'ok', texto: '¡Gracias! Tu apadrinamiento se ha registrado.' });
      queryClient.invalidateQueries({ queryKey: ['misApadrinamientos'] });
    },
    onError: (err) => {
      setFeedback({
        tipo: 'error',
        texto: err.response?.data?.error || 'No se pudo registrar el apadrinamiento'
      });
    }
  });

  if (isPending) {
    return <p className="text-center text-gray-500 py-12">Cargando…</p>;
  }

  if (isError) {
    return (
      <div className="bg-white shadow rounded-xl p-8 text-center">
        <p className="text-gray-700 mb-4">
          {error.response?.status === 404
            ? 'Este animal no existe o ha sido eliminado.'
            : `No se pudo cargar el animal: ${error.message}`}
        </p>
        <Link to="/animales" className="text-refugio-600 hover:underline">
          ← Volver al listado
        </Link>
      </div>
    );
  }

  const fotos = animal.fotos ?? [];
  const descripcion = animal.descripcion || animal.descripcionManual;
  const caracteristicas = animal.caracteristicas ?? {};
  const puedeAdoptar = animal.estado === 'DISPONIBLE';

  function handleSolicitarAdopcion() {
    if (!user) {
      navigate('/login', { state: { from: { pathname: `/animales/${id}` } } });
      return;
    }
    setFeedback(null);
    setMostrarFormAdopcion(true);
  }

  function handleApadrinar() {
    if (!user) {
      navigate('/login', { state: { from: { pathname: `/animales/${id}` } } });
      return;
    }
    setFeedback(null);
    setMostrarFormApadrinar(true);
  }

  return (
    <div className="space-y-6">
      <Link to="/animales" className="inline-block text-sm text-refugio-600 hover:underline">
        ← Volver al listado
      </Link>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Galería */}
        <div className="space-y-3">
          <div className="aspect-[4/3] bg-refugio-100 rounded-xl overflow-hidden flex items-center justify-center">
            {fotos.length > 0 ? (
              <img
                src={fotoUrl(fotos[fotoActiva])}
                alt={animal.nombre}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-8xl" aria-hidden="true">
                {animal.especie === 'GATO' ? '🐱' : animal.especie === 'PERRO' ? '🐶' : '🐾'}
              </span>
            )}
          </div>

          {fotos.length > 1 && (
            <div className="flex gap-2 flex-wrap">
              {fotos.map((foto, i) => (
                <button
                  key={foto}
                  onClick={() => setFotoActiva(i)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition ${
                    i === fotoActiva ? 'border-refugio-600' : 'border-transparent opacity-70'
                  }`}
                >
                  <img src={fotoUrl(foto)} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Datos principales */}
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-3xl font-bold text-refugio-700">{animal.nombre}</h1>
            <EstadoBadge
              estado={animal.estado}
              etiquetas={ESTADOS_ANIMAL}
              colores={ESTADO_ANIMAL_COLORES}
            />
          </div>

          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            <div>
              <dt className="text-gray-500">Especie</dt>
              <dd className="font-medium text-gray-900">{ESPECIES[animal.especie]}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Sexo</dt>
              <dd className="font-medium text-gray-900">{SEXOS[animal.sexo]}</dd>
            </div>
            {animal.raza && (
              <div>
                <dt className="text-gray-500">Raza</dt>
                <dd className="font-medium text-gray-900">{animal.raza}</dd>
              </div>
            )}
            {animal.edadEstimada != null && (
              <div>
                <dt className="text-gray-500">Edad</dt>
                <dd className="font-medium text-gray-900">{animal.edadEstimada} años</dd>
              </div>
            )}
            {formatPeso(animal.peso) && (
              <div>
                <dt className="text-gray-500">Peso</dt>
                <dd className="font-medium text-gray-900">{formatPeso(animal.peso)}</dd>
              </div>
            )}
            {animal.color && (
              <div>
                <dt className="text-gray-500">Color</dt>
                <dd className="font-medium text-gray-900">{animal.color}</dd>
              </div>
            )}
            <div>
              <dt className="text-gray-500">En el refugio desde</dt>
              <dd className="font-medium text-gray-900">{formatFecha(animal.fechaIngreso)}</dd>
            </div>
            {isStaff && animal.ubicacion && (
              <div>
                <dt className="text-gray-500">Ubicación</dt>
                <dd className="font-medium text-gray-900">{animal.ubicacion}</dd>
              </div>
            )}
          </dl>

          {descripcion && (
            <div>
              <h2 className="text-sm font-semibold text-gray-800 mb-1">Sobre {animal.nombre}</h2>
              <p className="text-sm text-gray-700 leading-relaxed">{descripcion}</p>
            </div>
          )}

          {Object.keys(caracteristicas).length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-800 mb-2">Características</h2>
              <div className="flex flex-wrap gap-2">
                {Object.entries(caracteristicas).map(([clave, valor]) => (
                  <span
                    key={clave}
                    className="text-xs bg-refugio-50 text-refugio-700 px-2 py-1 rounded-full border border-refugio-100"
                  >
                    {etiquetaCaracteristica(clave, valor)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Feedback de acciones */}
          {feedback && (
            <div
              className={`text-sm rounded-lg px-3 py-2 border ${
                feedback.tipo === 'ok'
                  ? 'bg-refugio-50 border-refugio-100 text-refugio-700'
                  : 'bg-red-50 border-red-200 text-red-700'
              }`}
            >
              {feedback.texto}
            </div>
          )}

          {/* Acciones */}
          <div className="flex flex-wrap gap-3 pt-2">
            {puedeAdoptar && !mostrarFormAdopcion && (
              <button
                onClick={handleSolicitarAdopcion}
                className="bg-refugio-600 hover:bg-refugio-700 text-white font-medium rounded-lg px-5 py-2.5 transition"
              >
                Solicitar adopción
              </button>
            )}
            {!mostrarFormApadrinar && (
              <button
                onClick={handleApadrinar}
                className="border border-refugio-600 text-refugio-700 hover:bg-refugio-50 font-medium rounded-lg px-5 py-2.5 transition"
              >
                Apadrinar
              </button>
            )}
          </div>

          {/* Formulario de adopción */}
          {mostrarFormAdopcion && (
            <div className="bg-white shadow rounded-xl p-4 space-y-3">
              <h3 className="font-semibold text-gray-800">Solicitar la adopción de {animal.nombre}</h3>
              <label htmlFor="notas" className="block text-sm text-gray-600">
                Cuéntanos sobre tu situación (tipo de vivienda, experiencia previa, otros animales…)
              </label>
              <textarea
                id="notas"
                rows={4}
                value={notasAdopcion}
                onChange={(e) => setNotasAdopcion(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-refugio-500"
              />
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    adopcionMutation.mutate({ animalId: animal.id, notas: notasAdopcion || undefined })
                  }
                  disabled={adopcionMutation.isPending}
                  className="bg-refugio-600 hover:bg-refugio-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg px-4 py-2 transition"
                >
                  {adopcionMutation.isPending ? 'Enviando…' : 'Enviar solicitud'}
                </button>
                <button
                  onClick={() => setMostrarFormAdopcion(false)}
                  className="text-sm text-gray-600 hover:bg-gray-100 rounded-lg px-4 py-2 transition"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* Formulario de apadrinamiento */}
          {mostrarFormApadrinar && (
            <div className="bg-white shadow rounded-xl p-4 space-y-3">
              <h3 className="font-semibold text-gray-800">Apadrinar a {animal.nombre}</h3>
              <p className="text-sm text-gray-600">
                Tu aportación cubre alimentación, cuidados veterinarios y mantenimiento.
              </p>
              <div>
                <label htmlFor="cantidad" className="block text-sm text-gray-600 mb-1">
                  Cantidad mensual (€)
                </label>
                <input
                  id="cantidad"
                  type="number"
                  min="1"
                  step="1"
                  value={cantidadApadrinamiento}
                  onChange={(e) => setCantidadApadrinamiento(Number(e.target.value))}
                  className="w-32 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-refugio-500"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    apadrinamientoMutation.mutate({
                      animalId: animal.id,
                      tipo: 'MENSUAL',
                      cantidad: cantidadApadrinamiento
                    })
                  }
                  disabled={apadrinamientoMutation.isPending || cantidadApadrinamiento < 1}
                  className="bg-refugio-600 hover:bg-refugio-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg px-4 py-2 transition"
                >
                  {apadrinamientoMutation.isPending ? 'Registrando…' : 'Confirmar apadrinamiento'}
                </button>
                <button
                  onClick={() => setMostrarFormApadrinar(false)}
                  className="text-sm text-gray-600 hover:bg-gray-100 rounded-lg px-4 py-2 transition"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Compatibilidad personalizada: solo para adoptantes logueados */}
      {user && !isStaff && (
        <CompatibilidadAnimal animalId={animal.id} nombreAnimal={animal.nombre} />
      )}

      {/* Historial médico: solo staff */}
      {isStaff && (
        <section className="bg-white shadow rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Historial médico</h2>
          <HistorialMedico expedientes={animal.expedientes} />
        </section>
      )}
    </div>
  );
}

/**
 * Traduce una clave/valor de características a una etiqueta legible.
 */
function etiquetaCaracteristica(clave, valor) {
  const etiquetas = {
    energia: 'Energía',
    temperamento: 'Temperamento',
    aptoNinos: 'Apto con niños',
    aptoOtrosPerros: 'Apto con perros',
    aptoGatos: 'Apto con gatos'
  };
  const nombre = etiquetas[clave] ?? clave;

  if (typeof valor === 'boolean') {
    return `${nombre}: ${valor ? 'sí' : 'no'}`;
  }
  return `${nombre}: ${valor}`;
}
