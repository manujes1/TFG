import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { recomendarDesdeTexto } from '../api/recomendaciones.js';
import { useAuth } from '../context/AuthContext.jsx';

/**
 * Cuadro de texto libre para describir las preferencias de adopción.
 *
 * DISEÑO: el texto se interpreta con IA y se traduce a los mismos campos
 * estructurados que rellena el formulario de /perfil (ver backend,
 * ia.service.js). La compatibilidad con cada animal la sigue calculando
 * el algoritmo determinista: la IA solo traduce texto libre a datos, nunca
 * decide qué animal encaja mejor. Por eso el resultado sustituye al perfil
 * guardado, igual que si la persona hubiera rellenado el formulario.
 */
export default function PreferenciasTexto() {
  const [texto, setTexto] = useState('');
  const [error, setError] = useState(null);
  const queryClient = useQueryClient();
  const { refrescarUsuario } = useAuth();

  const mutation = useMutation({
    mutationFn: recomendarDesdeTexto,
    onSuccess: async (res) => {
      setError(null);
      // Actualizamos directamente la caché de recomendaciones: es la misma
      // forma que devuelve /api/recomendaciones, así la página se actualiza
      // sin pedir los datos otra vez.
      queryClient.setQueryData(['recomendaciones'], res);
      queryClient.invalidateQueries({ queryKey: ['compatibilidad'] });
      await refrescarUsuario();
    },
    onError: (err) => {
      const status = err.response?.status;
      if (status === 503 || status === 504) {
        setError(
          'El servicio de IA no está disponible en este momento. Puedes usar el formulario detallado.'
        );
      } else {
        setError(err.response?.data?.error || 'No se pudo interpretar tu descripción.');
      }
    }
  });

  function handleSubmit(e) {
    e.preventDefault();
    if (texto.trim().length < 10) {
      setError('Cuéntanos un poco más sobre lo que buscas (mínimo 10 caracteres).');
      return;
    }
    setError(null);
    mutation.mutate(texto.trim());
  }

  return (
    <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 sm:p-5 space-y-3 shadow-soft">
      <div>
        <h2 className="text-sm font-semibold text-teal-700">✨ Cuéntanos qué buscas</h2>
        <p className="text-xs text-stone-600 mt-0.5">
          Describe con tus palabras tu hogar y tu situación, y te sugerimos los animales
          más compatibles.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-2">
        <textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          rows={3}
          maxLength={1000}
          placeholder="Ej: Vivo en un piso de 70 m² sin jardín, no tengo niños ni otras mascotas. Nunca he tenido perro, pero podría dedicarle un par de horas al día…"
          className="field-input resize-none bg-white"
        />

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <button type="submit" disabled={mutation.isPending} className="btn-accent text-sm px-4 py-2">
            {mutation.isPending ? 'Buscando…' : 'Buscar animales compatibles'}
          </button>
          {mutation.isPending && (
            <span className="text-xs text-stone-500">
              El texto se interpreta en el propio servidor del refugio; puede tardar unos
              segundos.
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
