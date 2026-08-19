/**
 * Diálogo modal de confirmación para acciones destructivas.
 * Se renderiza solo cuando `abierto` es true.
 */
export default function ConfirmDialog({
  abierto,
  titulo,
  mensaje,
  textoConfirmar = 'Confirmar',
  textoCancelar = 'Cancelar',
  peligroso = false,
  cargando = false,
  onConfirmar,
  onCancelar
}) {
  if (!abierto) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
      role="dialog"
      aria-modal="true"
      onClick={onCancelar}
    >
      <div
        className="bg-papel rounded-xl shadow-xl max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-2">{titulo}</h2>
        <p className="text-sm text-gray-600 mb-6">{mensaje}</p>

        <div className="flex justify-end gap-2">
          <button
            onClick={onCancelar}
            disabled={cargando}
            className="px-4 py-2 text-sm rounded-lg text-gray-700 hover:bg-gray-100 transition"
          >
            {textoCancelar}
          </button>
          <button
            onClick={onConfirmar}
            disabled={cargando}
            className={`px-4 py-2 text-sm font-medium rounded-lg text-white disabled:opacity-50 transition ${
              peligroso
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-refugio-600 hover:bg-refugio-700'
            }`}
          >
            {cargando ? 'Procesando…' : textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  );
}
