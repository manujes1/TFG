/**
 * Componentes de presentación para el dashboard de estadísticas.
 * Puramente visuales: reciben datos ya calculados y los pintan.
 */

/**
 * Tarjeta con una métrica destacada.
 */
export function MetricaCard({ titulo, valor, subtitulo, icono, acento = false }) {
  return (
    <div
      className={`rounded-lg p-5 shadow-card border ${
        acento
          ? 'bg-refugio-700 text-white border-refugio-900'
          : 'bg-papel border-refugio-100'
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <p
          className={`text-xs font-mono uppercase tracking-wide ${
            acento ? 'text-refugio-50/70' : 'text-refugio-900/50'
          }`}
        >
          {titulo}
        </p>
        {icono && (
          <span className="text-xl shrink-0" aria-hidden="true">
            {icono}
          </span>
        )}
      </div>
      <p
        className={`font-display text-3xl font-semibold ${
          acento ? 'text-white' : 'text-refugio-900'
        }`}
      >
        {valor}
      </p>
      {subtitulo && (
        <p className={`text-xs mt-1 ${acento ? 'text-refugio-100' : 'text-refugio-900/50'}`}>
          {subtitulo}
        </p>
      )}
    </div>
  );
}

/**
 * Gráfico de barras horizontales sencillo, hecho con divs.
 * Evitamos una librería de gráficos: para esta escala no aporta.
 *
 * @param {{ etiqueta: string, valor: number, color: string }[]} datos
 */
export function BarrasHorizontales({ datos, vacio = 'Sin datos' }) {
  const total = datos.reduce((suma, d) => suma + d.valor, 0);

  if (total === 0) {
    return <p className="text-sm text-gray-500 py-4">{vacio}</p>;
  }

  const maximo = Math.max(...datos.map((d) => d.valor));

  return (
    <ul className="space-y-3">
      {datos.map((dato) => {
        const porcentaje = maximo > 0 ? (dato.valor / maximo) * 100 : 0;
        return (
          <li key={dato.etiqueta}>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-700">{dato.etiqueta}</span>
              <span className="font-medium text-gray-900">{dato.valor}</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${dato.color}`}
                style={{ width: `${porcentaje}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * Contenedor de sección con título.
 */
export function SeccionCard({ titulo, children, accion }) {
  return (
    <section className="bg-papel shadow-card rounded-lg p-5 border border-refugio-100">
      <div className="flex items-center justify-between gap-2 mb-4">
        <h2 className="font-display font-semibold text-refugio-900">{titulo}</h2>
        {accion}
      </div>
      {children}
    </section>
  );
}
