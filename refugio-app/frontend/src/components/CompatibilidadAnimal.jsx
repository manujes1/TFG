import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { fetchCompatibilidad, explicarMatch } from '../api/recomendaciones.js';
import { CompatibilidadBarra, CriteriosDesglose } from './Compatibilidad.jsx';

export default function CompatibilidadAnimal({ animalId, nombreAnimal }) {
  const [explicacion, setExplicacion] = useState(null);

  const { data, isPending, isError } = useQuery({
    queryKey: ['compatibilidad', animalId],
    queryFn: () => fetchCompatibilidad(animalId)
  });

  // La explicación se pide al pulsar el botón, porque tarda unos segundos
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

  // Sin perfil, se invita a completarlo
  if (!data.perfilCompleto) {
    return (
      <section className="bg-refugio-50 border border-refugio-200 rounded-xl p-5">
        <h2 className="font-semibold text-refugio-700 mb-1 text-sm">
          ¿Encajaría {nombreAnimal} contigo?
        </h2>
        <p className="text-sm text-stone-600 mb-3">
          Completa tu perfil de adopción y te diremos qué tal encajáis.
        </p>
        <Link to="/perfil" className="btn-primary inline-flex text-sm px-4 py-2">
          Completar mi perfil
        </Link>
      </section>
    );
  }

  // Descartado por las reglas
  if (data.descartado) {
    return (
      <section className="bg-amber-50 border border-amber-200 rounded-xl p-5">
        <h2 className="font-semibold text-amber-800 mb-1 text-sm">
          Compatibilidad contigo
        </h2>
        <p className="text-sm text-amber-800">
          Según tu perfil, {nombreAnimal} no sería la mejor opción.{' '}
          {data.motivoDescarte.replace(/\.?$/, '.')}
        </p>
        <Link
          to="/recomendaciones"
          className="inline-block text-sm text-amber-900 font-medium underline decoration-amber-400 underline-offset-2 mt-2"
        >
          Ver animales que sí encajan contigo
        </Link>
      </section>
    );
  }

  return (
    <section className="card p-5 space-y-4">
      <h2 className="font-semibold text-stone-800 text-sm uppercase tracking-wide">
        Compatibilidad contigo
      </h2>

      <CompatibilidadBarra puntuacion={data.puntuacion} origen={data.origen} />

      <CriteriosDesglose criterios={data.criterios} />

      <div className="pt-3 border-t border-stone-100">
        {explicacion ? (
          <div className="space-y-2 bg-teal-50 border border-teal-100 rounded-lg p-3">
            <p className="text-sm text-stone-700 leading-relaxed">{explicacion}</p>
            <p className="text-xs text-teal-700 font-medium">
              ✨ Texto generado automáticamente a partir de la evaluación anterior.
            </p>
          </div>
        ) : (
          <div>
            <button
              onClick={() => explicarMutation.mutate()}
              disabled={explicarMutation.isPending}
              className="btn-accent-outline text-sm px-4 py-2"
            >
              {explicarMutation.isPending
                ? 'Generando explicación…'
                : '✨ Explicar con más detalle'}
            </button>
            {explicarMutation.isPending && (
              <p className="text-xs text-stone-500 mt-2">
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
