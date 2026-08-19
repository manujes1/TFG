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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
      onClick={onCancelar}
    >
      <div
        className="card shadow-elevated max-w-md w-full p-6 animate-popIn"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-stone-900 mb-2">{titulo}</h2>
        <p className="text-sm text-stone-600 mb-6">{mensaje}</p>

        <div className="flex justify-end gap-2">
          <button onClick={onCancelar} disabled={cargando} className="btn-ghost text-sm px-4 py-2">
            {textoCancelar}
          </button>
          <button
            onClick={onConfirmar}
            disabled={cargando}
            className={`text-sm px-4 py-2 ${peligroso ? 'btn-danger' : 'btn-primary'}`}
          >
            {cargando ? 'Procesando…' : textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  );
}
