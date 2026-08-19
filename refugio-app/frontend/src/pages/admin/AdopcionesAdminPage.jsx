import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { fetchAdopciones, updateEstadoAdopcion } from '../../api/adopciones.js';
import EstadoBadge from '../../components/EstadoBadge.jsx';
import AccionesAdopcion from '../../components/AccionesAdopcion.jsx';
import {
  ESPECIES,
  ESTADOS_ADOPCION,
  ESTADO_ADOPCION_COLORES
} from '../../utils/constants.js';
import { formatFecha } from '../../utils/format.js';

const PAGE_SIZE = 15;

export default function AdopcionesAdminPage() {
  const queryClient = useQueryClient();

  const [estadoFiltro, setEstadoFiltro] = useState('');
  const [page, setPage] = useState(1);
  const [feedback, setFeedback] = useState(null);
  const [enProceso, setEnProceso] = useState(null);

  const { data, isPending, isError, error } = useQuery({
    queryKey: ['adopciones', 'admin', estadoFiltro, page],
    queryFn: () =>
      fetchAdopciones({ estado: estadoFiltro, page, pageSize: PAGE_SIZE }),
    placeholderData: keepPreviousData
  });

  const cambiarEstadoMutation = useMutation({
    mutationFn: ({ id, payload }) => updateEstadoAdopcion(id, payload),
    onSuccess: (adopcion) => {
      setEnProceso(null);
      setFeedback({
        tipo: 'ok',
        texto: `Solicitud actualizada a "${ESTADOS_ADOPCION[adopcion.estado]}".`
      });
      // La adopción cambia; el animal puede cambiar de estado; las métricas también
      queryClient.invalidateQueries({ queryKey: ['adopciones'] });
      queryClient.invalidateQueries({ queryKey: ['animales'] });
      queryClient.invalidateQueries({ queryKey: ['estadisticas'] });
    },
    onError: (err) => {
      setEnProceso(null);
      setFeedback({
        tipo: 'error',
        texto: err.response?.data?.error || 'No se pudo actualizar la solicitud'
      });
    }
  });

  function handleCambiarEstado(adopcionId, payload) {
    setFeedback(null);
    setEnProceso(adopcionId);
    cambiarEstadoMutation.mutate({ id: adopcionId, payload });
  }

  function handleFiltro(e) {
    setEstadoFiltro(e.target.value);
    setPage(1);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-gray-800">Solicitudes de adopción</h2>
        <select
          value={estadoFiltro}
          onChange={handleFiltro}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-papel focus:outline-none focus:ring-2 focus:ring-refugio-500"
        >
          <option value="">Todos los estados</option>
          {Object.entries(ESTADOS_ADOPCION).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
      </div>

      {feedback && (
        <div
          className={`text-sm rounded-lg px-3 py-2 border ${
            feedback.tipo === 'ok'
              ? 'bg-refugio-50 border-refugio-100 text-refugio-700'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}
        >
          {feedback.texto}
        </div>
      )}

      {isPending && <p className="text-center text-gray-500 py-12">Cargando…</p>}

      {isError && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
          No se pudieron cargar las solicitudes: {error.message}
        </div>
      )}

      {data && (
        <>
          {data.data.length === 0 ? (
            <div className="bg-papel shadow rounded-xl p-12 text-center">
              <p className="text-gray-500">
                {estadoFiltro
                  ? 'No hay solicitudes en ese estado.'
                  : 'Todavía no hay solicitudes de adopción.'}
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {data.data.map((adopcion) => (
                <li key={adopcion.id} className="bg-papel shadow rounded-xl p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <Link
                          to={`/animales/${adopcion.animal.id}`}
                          className="font-semibold text-gray-900 hover:text-refugio-700"
                        >
                          {adopcion.animal.nombre}
                        </Link>
                        <span className="text-xs text-gray-400">
                          ({ESPECIES[adopcion.animal.especie]})
                        </span>
                        <EstadoBadge
                          estado={adopcion.estado}
                          etiquetas={ESTADOS_ADOPCION}
                          colores={ESTADO_ADOPCION_COLORES}
                        />
                      </div>
                      <p className="text-sm text-gray-700">
                        {adopcion.usuario.nombre} {adopcion.usuario.apellidos ?? ''}
                      </p>
                      <p className="text-xs text-gray-500">{adopcion.usuario.email}</p>
                    </div>

                    <div className="text-right text-xs text-gray-500 shrink-0">
                      <p>Solicitada el {formatFecha(adopcion.fechaSolicitud)}</p>
                      {adopcion.fechaAprobacion && (
                        <p>Aprobada el {formatFecha(adopcion.fechaAprobacion)}</p>
                      )}
                      {adopcion.fechaCompletada && (
                        <p>Completada el {formatFecha(adopcion.fechaCompletada)}</p>
                      )}
                    </div>
                  </div>

                  {adopcion.notas && (
                    <div className="bg-gray-50 rounded-lg px-3 py-2 mb-3">
                      <p className="text-xs text-gray-500 mb-0.5">Notas del solicitante</p>
                      <p className="text-sm text-gray-700">{adopcion.notas}</p>
                    </div>
                  )}

                  {adopcion.motivoRechazo && (
                    <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-3">
                      <p className="text-xs text-red-600 mb-0.5">Motivo del rechazo</p>
                      <p className="text-sm text-red-700">{adopcion.motivoRechazo}</p>
                    </div>
                  )}

                  {/* Aviso cuando el animal no está disponible */}
                  {adopcion.animal.estado !== 'DISPONIBLE' &&
                    !['COMPLETADA', 'RECHAZADA', 'CANCELADA'].includes(adopcion.estado) && (
                      <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-lg px-3 py-2 mb-3">
                        Atención: {adopcion.animal.nombre} ya no está disponible
                        (estado actual: {adopcion.animal.estado}).
                      </div>
                    )}

                  <div className="pt-3 border-t border-gray-100">
                    <AccionesAdopcion
                      adopcion={adopcion}
                      cargando={enProceso === adopcion.id}
                      onCambiarEstado={(payload) => handleCambiarEstado(adopcion.id, payload)}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}

          {data.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between bg-papel shadow rounded-xl px-4 py-3">
              <span className="text-xs text-gray-500">
                {data.pagination.total} solicitudes · página {data.pagination.page} de{' '}
                {data.pagination.totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 text-sm rounded-lg border border-gray-300 disabled:opacity-40 hover:bg-gray-50 transition"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= data.pagination.totalPages}
                  className="px-3 py-1 text-sm rounded-lg border border-gray-300 disabled:opacity-40 hover:bg-gray-50 transition"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
