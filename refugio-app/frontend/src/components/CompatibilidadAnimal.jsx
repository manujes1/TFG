import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { fetchCompatibilidad, explicarMatch } from '../api/recomendaciones.js';
import { CompatibilidadBarra, CriteriosDesglose } from './Compatibilidad.jsx';

/**
 * Bloque de compatibilidad personalizada dentro de la ficha del animal.
 *
 * La puntuación se obtiene del cálculo determinista (instantáneo).
 * La explicación en lenguaje natural se genera bajo demanda, porque
 * requiere inferencia del modelo local y puede tardar varios segundos.
 */
export default function CompatibilidadAnimal({ animalId, nombreAnimal }) {
  const [explicacion, setExplicacion] = useState(null);

  const { data, isPending, isError } = useQuery({
    queryKey: ['compatibilidad', animalId],
    queryFn: () => fetchCompatibilidad(animalId)
  });

  const explicarMutation = useMutation({
    mutationFn: () => explicarMatch(animalId),
    onSuccess: (res) => setExplicacion(res.explicacion),
    onError: (err) =>
      setExplicacion(
        err.response?.status === 503 || err.response?.status === 504
          ? 'El servicio de explicación no está disponible en este momento. El desglose de arriba sigue siendo válido.'
          : err.response?.data?.error || 'No se pudo generar la explicación.'
      )
  });

  if (isPending || isError) return null;

  // Sin perfil: invitamos a completarlo
  if (!data.perfilCompleto) {
    return (
      <section className="bg-refugio-50 border border-refugio-100 rounded-xl p-5">
        <h2 className="font-semibold text-refugio-700 mb-1 text-sm">
          ¿Encajaría {nombreAnimal} contigo?
        </h2>
        <p className="text-sm text-gray-600 mb-3">
          Completa tu perfil de adopción y te diremos qué tal encajáis.
        </p>
        <Link
          to="/perfil"
          className="inline-block text-sm bg-refugio-600 hover:bg-refugio-700 text-white font-medium rounded-lg px-4 py-2 transition"
        >
          Completar mi perfil
        </Link>
      </section>
    );
  }

  // Descartado por filtro duro
  if (data.descartado) {
    return (
      <section className="bg-amber-50 border border-amber-200 rounded-xl p-5">
        <h2 className="font-semibold text-amber-800 mb-1 text-sm">
          Compatibilidad contigo
        </h2>
        <p className="text-sm text-amber-800">
          Según tu perfil, {nombreAnimal} no sería la mejor opción:{' '}
          {data.motivoDescarte.toLowerCase()}.
        </p>
        <Link
          to="/recomendaciones"
          className="inline-block text-sm text-amber-900 underline mt-2"
        >
          Ver animales que sí encajan contigo
        </Link>
      </section>
    );
  }

  return (
    <section className="bg-papel shadow rounded-xl p-5 space-y-4">
      <h2 className="font-semibold text-gray-800 text-sm">
        Compatibilidad contigo
      </h2>

      <CompatibilidadBarra puntuacion={data.puntuacion} />

      <CriteriosDesglose criterios={data.criterios} />

      <div className="pt-2 border-t border-gray-100">
        {explicacion ? (
          <div className="space-y-2">
            <p className="text-sm text-gray-700 leading-relaxed">{explicacion}</p>
            <p className="text-xs text-gray-400">
              Texto generado automáticamente a partir de la evaluación anterior.
            </p>
          </div>
        ) : (
          <div>
            <button
              onClick={() => explicarMutation.mutate()}
              disabled={explicarMutation.isPending}
              className="text-sm border border-refugio-600 text-refugio-700 hover:bg-refugio-50 disabled:opacity-50 font-medium rounded-lg px-4 py-2 transition"
            >
              {explicarMutation.isPending
                ? 'Generando explicación…'
                : '✨ Explicar con más detalle'}
            </button>
            {explicarMutation.isPending && (
              <p className="text-xs text-gray-500 mt-2">
                Esto puede tardar unos segundos: el texto se genera en el propio
                servidor del refugio.
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
