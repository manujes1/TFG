import { useState } from 'react';
import { siguientesEstados, ACCIONES } from '../utils/adopcionEstados.js';

const ESTILOS = {
  primario: 'bg-refugio-600 hover:bg-refugio-700 text-white',
  peligro: 'bg-papel border border-red-300 text-red-700 hover:bg-red-50',
  neutro: 'bg-papel border border-gray-300 text-gray-700 hover:bg-gray-50'
};

/**
 * Botonera de transiciones válidas para una adopción.
 * Cuando la acción requiere motivo (rechazo), muestra un campo de texto
 * antes de confirmar.
 */
export default function AccionesAdopcion({ adopcion, onCambiarEstado, cargando }) {
  const [motivoAbierto, setMotivoAbierto] = useState(null);
  const [motivo, setMotivo] = useState('');

  const posibles = siguientesEstados(adopcion.estado);

  if (posibles.length === 0) {
    return (
      <p className="text-xs text-gray-400 italic">
        Esta solicitud está cerrada y no admite más cambios.
      </p>
    );
  }

  function handleClick(estado) {
    const accion = ACCIONES[estado];
    if (accion.requiereMotivo) {
      setMotivoAbierto(estado);
      setMotivo('');
    } else {
      onCambiarEstado({ estado });
    }
  }

  function confirmarConMotivo() {
    onCambiarEstado({
      estado: motivoAbierto,
      motivoRechazo: motivo.trim() || undefined
    });
    setMotivoAbierto(null);
    setMotivo('');
  }

  if (motivoAbierto) {
    return (
      <div className="space-y-2 w-full">
        <label htmlFor={`motivo-${adopcion.id}`} className="block text-xs text-gray-600">
          Motivo del rechazo (se mostrará al solicitante)
        </label>
        <textarea
          id={`motivo-${adopcion.id}`}
          rows={3}
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          maxLength={1000}
          placeholder="Explica brevemente por qué no se aprueba la solicitud…"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-refugio-500"
        />
        <div className="flex gap-2">
          <button
            onClick={confirmarConMotivo}
            disabled={cargando}
            className="text-xs font-medium px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white transition"
          >
            {cargando ? 'Procesando…' : 'Confirmar rechazo'}
          </button>
          <button
            onClick={() => setMotivoAbierto(null)}
            className="text-xs px-3 py-1.5 rounded-lg text-gray-600 hover:bg-gray-100 transition"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {posibles.map((estado) => {
        const accion = ACCIONES[estado];
        return (
          <button
            key={estado}
            onClick={() => handleClick(estado)}
            disabled={cargando}
            className={`text-xs font-medium px-3 py-1.5 rounded-lg disabled:opacity-50 transition ${ESTILOS[accion.estilo]}`}
          >
            {accion.label}
          </button>
        );
      })}
    </div>
  );
}
