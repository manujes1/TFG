/**
 * Componentes de presentación del resultado de compatibilidad.
 */

/**
 * Devuelve el color y la etiqueta según el tramo de puntuación.
 */
function tramo(puntuacion) {
  if (puntuacion >= 80) {
    return { etiqueta: 'Muy compatible', barra: 'bg-refugio-600', texto: 'text-refugio-700', fondo: 'bg-refugio-50' };
  }
  if (puntuacion >= 60) {
    return { etiqueta: 'Buena compatibilidad', barra: 'bg-green-500', texto: 'text-green-700', fondo: 'bg-green-50' };
  }
  if (puntuacion >= 40) {
    return { etiqueta: 'Compatibilidad media', barra: 'bg-amber-500', texto: 'text-amber-700', fondo: 'bg-amber-50' };
  }
  return { etiqueta: 'Poca compatibilidad', barra: 'bg-red-500', texto: 'text-red-700', fondo: 'bg-red-50' };
}

/**
 * Indicador circular compacto de compatibilidad.
 */
export function CompatibilidadBadge({ puntuacion }) {
  const t = tramo(puntuacion);
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${t.fondo} ${t.texto}`}
    >
      <span className={`w-2 h-2 rounded-full ${t.barra}`} />
      {puntuacion}% compatible
    </span>
  );
}

/**
 * Barra de progreso con la puntuación y su etiqueta.
 */
export function CompatibilidadBarra({ puntuacion, origen }) {
  const t = tramo(puntuacion);
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <span className={`text-sm font-semibold ${t.texto}`}>{t.etiqueta}</span>
        <span className="text-2xl font-bold text-stone-900 tracking-tight">{puntuacion}%</span>
      </div>
      <div className="h-2.5 bg-stone-100 rounded-full overflow-hidden shadow-inner">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${t.barra}`}
          style={{ width: `${puntuacion}%` }}
        />
      </div>
      {origen && (
        <p className="text-xs text-stone-400 mt-1.5">
          {origen === 'llm' ? '✨ Calculado por IA' : 'Calculado por reglas'}
        </p>
      )}
    </div>
  );
}

/**
 * Desglose de los criterios que componen la puntuación.
 * Es lo que hace explicable la recomendación.
 */
export function CriteriosDesglose({ criterios }) {
  if (!criterios || criterios.length === 0) return null;

  return (
    <ul className="space-y-2.5">
      {criterios.map((c) => {
        const icono = c.valor >= 0.8 ? '✓' : c.valor >= 0.5 ? '~' : '!';
        const color =
          c.valor >= 0.8
            ? 'text-refugio-600 bg-refugio-50'
            : c.valor >= 0.5
              ? 'text-amber-600 bg-amber-50'
              : 'text-red-600 bg-red-50';

        return (
          <li key={c.id} className="flex gap-3 text-sm">
            <span
              className={`font-bold shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs ${color}`}
              aria-hidden="true"
            >
              {icono}
            </span>
            <div className="min-w-0">
              <p className="text-stone-800 font-medium">{c.etiqueta}</p>
              <p className="text-stone-500 text-xs">{c.detalle}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
