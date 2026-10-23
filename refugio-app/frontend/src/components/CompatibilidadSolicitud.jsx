import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchCompatibilidadSolicitante } from '../api/recomendaciones.js';
import { CompatibilidadBarra, CriteriosDesglose } from './Compatibilidad.jsx';
import { formatFecha } from '../utils/format.js';

/**
 * Compatibilidad entre quien solicita una adopción y el animal, para el
 * personal que revisa la solicitud.
 *
 * Se muestra la foto guardada al enviar la solicitud, que es lo mismo que vio
 * la persona. Las solicitudes anteriores a ese cambio no la tienen: para
 * ellas se calcula con los datos actuales y se indica así.
 */
export default function CompatibilidadSolicitud({ adopcion }) {
  const foto = adopcion.compatibilidad;

  const { data, isPending, isError } = useQuery({
    queryKey: ['compatibilidad', 'solicitante', adopcion.usuario.id, adopcion.animal.id],
    queryFn: () => fetchCompatibilidadSolicitante(adopcion.usuario.id, adopcion.animal.id),
    enabled: !foto
  });

  if (foto) {
    return (
      <ResultadoCompatibilidad
        resultado={foto}
        nota={`Calculada al enviar la solicitud, el ${formatFecha(foto.calculadaEn, true)}.`}
      />
    );
  }

  if (isPending) {
    return <p className="text-xs text-stone-400 mb-3">Calculando compatibilidad…</p>;
  }

  if (isError) {
    return (
      <p className="text-xs text-stone-500 mb-3">
        No se pudo calcular la compatibilidad en este momento.
      </p>
    );
  }

  return (
    <ResultadoCompatibilidad
      resultado={data}
      nota="Solicitud anterior al registro de la compatibilidad: calculada con los datos actuales."
    />
  );
}

function ResultadoCompatibilidad({ resultado, nota }) {
  const [verDesglose, setVerDesglose] = useState(false);

  // Sin perfil de hogar no hay con qué comparar
  if (!resultado.perfilCompleto) {
    return (
      <div className="bg-stone-50 border border-stone-100 rounded-lg px-3 py-2 mb-3">
        <p className="text-xs text-stone-500 mb-0.5 font-medium">Compatibilidad</p>
        <p className="text-sm text-stone-600">
          El solicitante no había completado su perfil de hogar, así que no se pudo calcular.
        </p>
      </div>
    );
  }

  // Descartado por un filtro duro
  if (resultado.descartado) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-3">
        <p className="text-xs text-amber-700 mb-0.5 font-medium">Compatibilidad</p>
        <p className="text-sm text-amber-800">
          No compatible: {resultado.motivoDescarte.replace(/\.?$/, '.')}
        </p>
        <p className="text-xs text-amber-700/80 mt-1">{nota}</p>
      </div>
    );
  }

  return (
    <div className="bg-stone-50 border border-stone-100 rounded-lg px-3 py-3 mb-3 space-y-3">
      <CompatibilidadBarra puntuacion={resultado.puntuacion} origen={resultado.origen} />

      <button
        type="button"
        onClick={() => setVerDesglose((v) => !v)}
        className="text-xs text-refugio-700 font-medium hover:underline"
      >
        {verDesglose ? 'Ocultar el desglose' : 'Ver en qué aspectos son compatibles'}
      </button>

      {verDesglose && <CriteriosDesglose criterios={resultado.criterios} />}

      <p className="text-xs text-stone-400">{nota}</p>
    </div>
  );
}
