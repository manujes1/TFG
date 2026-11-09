
export function MetricaCard({ titulo, valor, subtitulo, icono, acento = false }) {
  return (
    <div
      className={`rounded-xl p-5 transition-all duration-200 hover:-translate-y-0.5 ${
        acento
          ? 'bg-gradient-to-br from-teal-500 to-teal-600 text-white shadow-card hover:shadow-card-hover'
          : 'card card-hover'
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className={`text-sm font-medium ${acento ? 'text-teal-50' : 'text-stone-500'}`}>
          {titulo}
        </p>
        {icono && (
          <span className="text-xl shrink-0" aria-hidden="true">
            {icono}
          </span>
        )}
      </div>
      <p className={`text-3xl font-bold tracking-tight ${acento ? 'text-white' : 'text-stone-900'}`}>
        {valor}
      </p>
      {subtitulo && (
        <p className={`text-xs mt-1 ${acento ? 'text-teal-100' : 'text-stone-500'}`}>
          {subtitulo}
        </p>
      )}
    </div>
  );
}

// Barras hechas con divs, sin librería de gráficos
export function BarrasHorizontales({ datos, vacio = 'Sin datos' }) {
  const total = datos.reduce((suma, d) => suma + d.valor, 0);

  if (total === 0) {
    return <p className="text-sm text-stone-500 py-4">{vacio}</p>;
  }

  const maximo = Math.max(...datos.map((d) => d.valor));

  return (
    <ul className="space-y-3">
      {datos.map((dato) => {
        const porcentaje = maximo > 0 ? (dato.valor / maximo) * 100 : 0;
        return (
          <li key={dato.etiqueta}>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-stone-600">{dato.etiqueta}</span>
              <span className="font-semibold text-stone-900">{dato.valor}</span>
            </div>
            <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${dato.color}`}
                style={{ width: `${porcentaje}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export function SeccionCard({ titulo, children, accion }) {
  return (
    <section className="card p-5">
      <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-stone-100">
        <h2 className="font-semibold text-stone-800">{titulo}</h2>
        {accion}
      </div>
      {children}
    </section>
  );
}
