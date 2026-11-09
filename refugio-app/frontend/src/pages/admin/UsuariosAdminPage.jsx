import { useState } from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { fetchUsuarios, updateUsuario } from '../../api/usuarios.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { ROLES } from '../../utils/constants.js';
import { formatFecha } from '../../utils/format.js';

const PAGE_SIZE = 15;

export default function UsuariosAdminPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [rolFiltro, setRolFiltro] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [page, setPage] = useState(1);
  const [feedback, setFeedback] = useState(null);
  const [enProceso, setEnProceso] = useState(null);

  const { data, isPending, isError, error } = useQuery({
    queryKey: ['usuarios', rolFiltro, busqueda, page],
    queryFn: () =>
      fetchUsuarios({ rol: rolFiltro, search: busqueda.trim(), page, pageSize: PAGE_SIZE }),
    placeholderData: keepPreviousData
  });

  const mutation = useMutation({
    mutationFn: ({ id, cambios }) => updateUsuario(id, cambios),
    onSuccess: (usuario, { cambios }) => {
      setEnProceso(null);
      setFeedback({
        tipo: 'ok',
        texto:
          cambios.rol !== undefined
            ? `${usuario.nombre} ahora es ${ROLES[usuario.rol].toLowerCase()}.`
            : `La cuenta de ${usuario.nombre} está ${usuario.activo ? 'activa' : 'desactivada'}.`
      });
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
    },
    onError: (err) => {
      setEnProceso(null);
      setFeedback({
        tipo: 'error',
        texto: err.response?.data?.error || 'No se pudo actualizar el usuario'
      });
    }
  });

  function cambiar(id, cambios) {
    setFeedback(null);
    setEnProceso(id);
    mutation.mutate({ id, cambios });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-stone-800 tracking-tight">Usuarios</h2>
        <div className="flex flex-wrap gap-2">
          <input
            type="search"
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
              setPage(1);
            }}
            placeholder="Buscar por nombre o email"
            className="field-input w-56"
          />
          <select
            value={rolFiltro}
            onChange={(e) => {
              setRolFiltro(e.target.value);
              setPage(1);
            }}
            className="field-input w-auto"
          >
            <option value="">Todos los roles</option>
            {Object.entries(ROLES).map(([valor, etiqueta]) => (
              <option key={valor} value={valor}>{etiqueta}</option>
            ))}
          </select>
        </div>
      </div>

      {feedback && (
        <div
          className={`text-sm rounded-lg px-3 py-2 border animate-fadeIn ${
            feedback.tipo === 'ok'
              ? 'bg-refugio-50 border-refugio-200 text-refugio-700'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}
        >
          {feedback.texto}
        </div>
      )}

      {isPending && <p className="text-center text-stone-500 py-12">Cargando…</p>}

      {isError && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
          No se pudieron cargar los usuarios: {error.message}
        </div>
      )}

      {data && (
        <>
          {data.data.length === 0 ? (
            <div className="card p-12 text-center">
              <p className="text-stone-500">No hay usuarios que coincidan con la búsqueda.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {data.data.map((u) => {
                // Nadie puede cambiar su propio rol ni desactivarse
                const esYo = u.id === user.id;
                const cargando = enProceso === u.id;
                return (
                  <li
                    key={u.id}
                    className={`card p-4 flex flex-wrap items-center justify-between gap-4 ${
                      u.activo ? '' : 'opacity-60'
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-stone-900">
                        {u.nombre} {u.apellidos ?? ''}
                        {esYo && <span className="ml-2 text-xs font-normal text-stone-400">(tú)</span>}
                      </p>
                      <p className="text-sm text-stone-600">{u.email}</p>
                      <p className="text-xs text-stone-400">
                        Alta el {formatFecha(u.createdAt)}
                        {!u.activo && <span className="ml-2 font-medium text-red-600">· Cuenta desactivada</span>}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        value={u.rol}
                        disabled={esYo || cargando}
                        onChange={(e) => cambiar(u.id, { rol: e.target.value })}
                        className="field-input w-auto"
                        aria-label={`Rol de ${u.nombre}`}
                        title={esYo ? 'No puedes cambiar tu propio rol' : undefined}
                      >
                        {Object.entries(ROLES).map(([valor, etiqueta]) => (
                          <option key={valor} value={valor}>{etiqueta}</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        disabled={esYo || cargando}
                        onClick={() => cambiar(u.id, { activo: !u.activo })}
                        className={`btn text-sm px-3 py-2 border ${
                          u.activo
                            ? 'border-red-200 text-red-600 hover:bg-red-50'
                            : 'border-refugio-200 text-refugio-700 hover:bg-refugio-50'
                        }`}
                        title={esYo ? 'No puedes desactivar tu propia cuenta' : undefined}
                      >
                        {u.activo ? 'Desactivar' : 'Activar'}
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {data.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between card px-4 py-3">
              <span className="text-xs text-stone-500">
                {data.pagination.total} usuarios · página {data.pagination.page} de{' '}
                {data.pagination.totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="btn-ghost border border-stone-300 text-sm px-3 py-1"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= data.pagination.totalPages}
                  className="btn-ghost border border-stone-300 text-sm px-3 py-1"
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
