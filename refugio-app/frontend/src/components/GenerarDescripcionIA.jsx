import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { generarDescripcionIA } from '../api/recomendaciones.js';

/**
 * Genera una descripción con el modelo local y la propone al voluntario.
 *
 * DISEÑO: el texto nunca se publica automáticamente. Se muestra como
 * propuesta y es la persona quien decide aceptarla, editarla o descartarla.
 * Esta supervisión humana es deliberada: el contenido generado se publica
 * de cara al público y una alucinación del modelo sería visible para
 * cualquier visitante.
 *
 * @param {string} animalId
 * @param {(texto: string) => void} onAceptar - Vuelca el texto en el formulario.
 */
export default function GenerarDescripcionIA({ animalId, onAceptar }) {
  const [propuesta, setPropuesta] = useState(null);
  const [error, setError] = useState(null);

  const mutation = useMutation({
    // guardar=false: solo queremos la propuesta, no persistirla todavía
    mutationFn: () => generarDescripcionIA(animalId, false),
    onSuccess: (res) => {
      setError(null);
      setPropuesta(res.descripcion);
    },
    onError: (err) => {
      setPropuesta(null);
      const status = err.response?.status;
      if (status === 503 || status === 504) {
        setError(
          'El servicio de IA no está disponible. Comprueba que Ollama está en marcha.'
        );
      } else {
        setError(err.response?.data?.error || 'No se pudo generar la descripción');
      }
    }
  });

  function aceptar() {
    onAceptar(propuesta);
    setPropuesta(null);
  }

  return (
    <div className="bg-refugio-50 border border-refugio-100 rounded-xl p-4 space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-refugio-700">
            ✨ Generar descripción con IA
          </h3>
          <p className="text-xs text-gray-600 mt-0.5">
            Redacta una propuesta a partir de los datos del animal. Revísala antes
            de guardarla.
          </p>
        </div>

        <button
          type="button"
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
          className="text-sm bg-refugio-600 hover:bg-refugio-700 disabled:opacity-50 text-white font-medium rounded-lg px-4 py-2 transition shrink-0"
        >
          {mutation.isPending ? 'Generando…' : propuesta ? 'Generar otra' : 'Generar'}
        </button>
      </div>

      {mutation.isPending && (
        <p className="text-xs text-gray-500">
          El texto se genera en el propio servidor del refugio; puede tardar unos
          segundos.
        </p>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      {propuesta && (
        <div className="space-y-2">
          <div className="bg-papel border border-gray-200 rounded-lg p-3">
            <p className="text-sm text-gray-800 leading-relaxed">{propuesta}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={aceptar}
              className="text-xs font-medium bg-refugio-600 hover:bg-refugio-700 text-white rounded-lg px-3 py-1.5 transition"
            >
              Usar este texto
            </button>
            <button
              type="button"
              onClick={() => setPropuesta(null)}
              className="text-xs text-gray-600 hover:bg-gray-100 rounded-lg px-3 py-1.5 transition"
            >
              Descartar
            </button>
          </div>

          <p className="text-xs text-gray-500">
            Al usarlo se copiará al campo de descripción, donde podrás editarlo
            antes de guardar el animal.
          </p>
        </div>
      )}
    </div>
  );
}
