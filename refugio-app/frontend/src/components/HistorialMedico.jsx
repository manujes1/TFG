import { formatFecha } from '../utils/format.js';

const TIPOS_EXPEDIENTE = {
  VACUNA: { etiqueta: 'Vacuna', icono: '💉', color: 'bg-blue-100 text-blue-800' },
  DESPARASITACION: { etiqueta: 'Desparasitación', icono: '🧴', color: 'bg-teal-100 text-teal-800' },
  CIRUGIA: { etiqueta: 'Cirugía', icono: '🩹', color: 'bg-red-100 text-red-800' },
  REVISION: { etiqueta: 'Revisión', icono: '🔍', color: 'bg-gray-100 text-gray-700' },
  TRATAMIENTO: { etiqueta: 'Tratamiento', icono: '💊', color: 'bg-amber-100 text-amber-800' }
};

export default function HistorialMedico({ expedientes }) {
  if (!expedientes || expedientes.length === 0) {
    return (
      <p className="text-sm text-gray-500 py-4">
        No hay expedientes médicos registrados.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-gray-100">
      {expedientes.map((exp) => {
        const tipo = TIPOS_EXPEDIENTE[exp.tipo] ?? {
          etiqueta: exp.tipo,
          icono: '📋',
          color: 'bg-gray-100 text-gray-700'
        };

        return (
          <li key={exp.id} className="py-4 first:pt-0 last:pb-0">
            <div className="flex items-start gap-3">
              <span className="text-xl shrink-0" aria-hidden="true">
                {tipo.icono}
              </span>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${tipo.color}`}
                  >
                    {tipo.etiqueta}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatFecha(exp.fecha)}
                  </span>
                  {exp.veterinario && (
                    <span className="text-xs text-gray-500">· {exp.veterinario}</span>
                  )}
                </div>

                <p className="text-sm text-gray-700">{exp.descripcion}</p>

                {exp.proximaRevision && (
                  <p className="text-xs text-gray-500 mt-1">
                    Próxima revisión: {formatFecha(exp.proximaRevision)}
                  </p>
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
