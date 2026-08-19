import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchRecomendaciones } from '../api/recomendaciones.js';
import { CompatibilidadBarra, CriteriosDesglose } from '../components/Compatibilidad.jsx';
import { ESPECIES, SEXOS, fotoUrl } from '../utils/constants.js';

export default function RecomendacionesPage() {
  const { data, isPending, isError, error } = useQuery({
    queryKey: ['recomendaciones'],
    queryFn: () => fetchRecomendaciones({ limite: 10 })
  });

  if (isPending) {
    return <p className="text-center text-gray-500 py-12">Calculando recomendaciones…</p>;
  }

  if (isError) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
        No se pudieron cargar las recomendaciones: {error.message}
      </div>
    );
  }

  // Sin perfil: invitamos a completarlo
  if (!data.perfilCompleto) {
    return (
      <div className="max-w-lg mx-auto bg-papel shadow rounded-xl p-8 text-center">
        <span className="text-4xl block mb-3" aria-hidden="true">🧭</span>
        <h1 className="text-xl font-bold text-refugio-700 mb-2">
          Completa tu perfil para empezar
        </h1>
        <p className="text-sm text-gray-600 mb-6">
          Necesitamos conocer un poco tu hogar y tu disponibilidad para sugerirte
          los animales que mejor encajan contigo.
        </p>
        <Link
          to="/perfil"
          className="inline-block bg-refugio-600 hover:bg-refugio-700 text-white text-sm font-medium rounded-lg px-6 py-3 transition"
        >
          Completar mi perfil
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-refugio-700 mb-1">
            Animales recomendados para ti
          </h1>
          <p className="text-sm text-gray-600">
            Ordenados según tu perfil. Puedes ver por qué encaja cada uno.
          </p>
        </div>
        <Link
          to="/perfil"
          className="text-sm text-refugio-600 hover:underline shrink-0"
        >
          Editar mi perfil
        </Link>
      </div>

      {data.recomendaciones.length === 0 ? (
        <div className="bg-papel shadow rounded-xl p-10 text-center">
          <p className="text-gray-600 mb-4">
            Ahora mismo no hay animales disponibles que encajen con tu perfil.
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            <Link
              to="/perfil"
              className="border border-refugio-600 text-refugio-700 hover:bg-refugio-50 text-sm font-medium rounded-lg px-4 py-2 transition"
            >
              Revisar mi perfil
            </Link>
            <Link
              to="/animales"
              className="bg-refugio-600 hover:bg-refugio-700 text-white text-sm font-medium rounded-lg px-4 py-2 transition"
            >
              Ver todos los animales
            </Link>
          </div>
        </div>
      ) : (
        <ul className="space-y-4">
          {data.recomendaciones.map(({ animal, puntuacion, criterios }) => (
            <li key={animal.id} className="bg-papel shadow rounded-xl overflow-hidden">
              <div className="grid sm:grid-cols-[180px_1fr] gap-0">
                <Link
                  to={`/animales/${animal.id}`}
                  className="aspect-[4/3] sm:aspect-auto bg-refugio-100 flex items-center justify-center overflow-hidden"
                >
                  {animal.fotos?.[0] ? (
                    <img
                      src={fotoUrl(animal.fotos[0])}
                      alt={animal.nombre}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <span className="text-5xl" aria-hidden="true">
                      {animal.especie === 'GATO' ? '🐱' : animal.especie === 'PERRO' ? '🐶' : '🐾'}
                    </span>
                  )}
                </Link>

                <div className="p-5 space-y-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <Link
                        to={`/animales/${animal.id}`}
                        className="text-lg font-semibold text-gray-900 hover:text-refugio-700"
                      >
                        {animal.nombre}
                      </Link>
                      <p className="text-sm text-gray-600">
                        {ESPECIES[animal.especie]}
                        {animal.raza ? ` · ${animal.raza}` : ''}
                        {' · '}
                        {SEXOS[animal.sexo]}
                        {animal.edadEstimada != null ? ` · ${animal.edadEstimada} años` : ''}
                      </p>
                    </div>
                  </div>

                  <CompatibilidadBarra puntuacion={puntuacion} />

                  <details className="group">
                    <summary className="text-sm text-refugio-600 hover:underline cursor-pointer list-none">
                      <span className="group-open:hidden">Ver por qué encaja contigo</span>
                      <span className="hidden group-open:inline">Ocultar detalles</span>
                    </summary>
                    <div className="pt-3">
                      <CriteriosDesglose criterios={criterios} />
                    </div>
                  </details>

                  <Link
                    to={`/animales/${animal.id}`}
                    className="inline-block text-sm bg-refugio-600 hover:bg-refugio-700 text-white font-medium rounded-lg px-4 py-2 transition"
                  >
                    Conocer a {animal.nombre}
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <p className="text-xs text-gray-500 text-center max-w-2xl mx-auto">
        Las recomendaciones se calculan mediante un algoritmo que compara tu perfil
        con las características de cada animal. El equipo del refugio valorará
        siempre cada solicitud de forma individual.
      </p>
    </div>
  );
}
