import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { fetchAnimales, deleteAnimal } from '../../api/animales.js';
import { useAuth } from '../../context/AuthContext.jsx';
import EstadoBadge from '../../components/EstadoBadge.jsx';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';
import {
  ESPECIES,
  SEXOS,
  ESTADOS_ANIMAL,
  ESTADO_ANIMAL_COLORES,
  fotoUrl
} from '../../utils/constants.js';
import { formatFecha } from '../../utils/format.js';

const PAGE_SIZE = 15;

export default function AnimalesAdminPage() {
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();

  const [filtros, setFiltros] = useState({ especie: '', estado: '', search: '' });
  const [page, setPage] = useState(1);
  const [aBorrar, setABorrar] = useState(null);
  const [error, setError] = useState(null);

  const { data, isPending, isError, error: queryError } = useQuery({
    queryKey: ['animales', 'admin', filtros, page],
    queryFn: () => fetchAnimales({ ...filtros, page, pageSize: PAGE_SIZE }),
    placeholderData: keepPreviousData
  });

  const borrarMutation = useMutation({
    mutationFn: deleteAnimal,
    onSuccess: () => {
      setABorrar(null);
      setError(null);
      queryClient.invalidateQueries({ queryKey: ['animales'] });
      queryClient.invalidateQueries({ queryKey: ['estadisticas'] });
    },
    onError: (err) => {
      setError(err.response?.data?.error || 'No se pudo eliminar el animal');
      setABorrar(null);
    }
  });

  function handleFiltroChange(e) {
    setFiltros({ ...filtros, [e.target.name]: e.target.value });
    setPage(1);
  }

  const inputClass =
    'border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-refugio-500 bg-white';

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-gray-800">Gestión de animales</h2>
        <Link
          to="/admin/animales/nuevo"
          className="bg-refugio-600 hover:bg-refugio-700 text-white text-sm font-medium rounded-lg px-4 py-2 transition"
        >
          + Nuevo animal
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white shadow rounded-xl p-4 flex flex-wrap gap-3">
        <input
          name="search"
          value={filtros.search}
          onChange={handleFiltroChange}
          placeholder="Buscar por nombre o raza…"
          className={`${inputClass} flex-1 min-w-[180px]`}
        />
        <select
          name="especie"
          value={filtros.especie}
          onChange={handleFiltroChange}
          className={inputClass}
        >
          <option value="">Todas las especies</option>
          {Object.entries(ESPECIES).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
        <select
          name="estado"
          value={filtros.estado}
          onChange={handleFiltroChange}
          className={inputClass}
        >
          <option value="">Todos los estados</option>
          {Object.entries(ESTADOS_ANIMAL).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
      </div>

      {isPending && <p className="text-center text-gray-500 py-12">Cargando…</p>}

      {isError && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
          No se pudieron cargar los animales: {queryError.message}
        </div>
      )}

      {data && (
        <div className="bg-white shadow rounded-xl overflow-hidden">
          {data.data.length === 0 ? (
            <p className="text-center text-gray-500 py-12">
              No hay animales que coincidan con la búsqueda.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Animal</th>
                    <th className="px-4 py-3 font-medium">Especie</th>
                    <th className="px-4 py-3 font-medium">Estado</th>
                    <th className="px-4 py-3 font-medium hidden md:table-cell">Ubicación</th>
                    <th className="px-4 py-3 font-medium hidden lg:table-cell">Ingreso</th>
                    <th className="px-4 py-3 font-medium text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.data.map((animal) => (
                    <tr key={animal.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Miniatura animal={animal} />
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900">{animal.nombre}</p>
                            <p className="text-xs text-gray-500">
                              {SEXOS[animal.sexo]}
                              {animal.raza ? ` · ${animal.raza}` : ''}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-700">{ESPECIES[animal.especie]}</td>
                      <td className="px-4 py-3">
                        <EstadoBadge
                          estado={animal.estado}
                          etiquetas={ESTADOS_ANIMAL}
                          colores={ESTADO_ANIMAL_COLORES}
                        />
                      </td>
                      <td className="px-4 py-3 text-gray-600 hidden md:table-cell">
                        {animal.ubicacion || '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-600 hidden lg:table-cell">
                        {formatFecha(animal.fechaIngreso)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <Link
                            to={`/animales/${animal.id}`}
                            className="text-xs px-2 py-1 rounded text-gray-600 hover:bg-gray-100 transition"
                          >
                            Ver
                          </Link>
                          <Link
                            to={`/admin/animales/${animal.id}/editar`}
                            className="text-xs px-2 py-1 rounded text-refugio-700 hover:bg-refugio-50 transition"
                          >
                            Editar
                          </Link>
                          {isAdmin && (
                            <button
                              onClick={() => setABorrar(animal)}
                              className="text-xs px-2 py-1 rounded text-red-600 hover:bg-red-50 transition"
                            >
                              Eliminar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {data.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
              <span className="text-xs text-gray-500">
                {data.pagination.total} animales · página {data.pagination.page} de{' '}
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
        </div>
      )}

      <ConfirmDialog
        abierto={aBorrar !== null}
        titulo={`Eliminar a ${aBorrar?.nombre}`}
        mensaje="Esta acción es permanente. Se eliminarán también sus expedientes médicos. Las adopciones asociadas impedirán el borrado."
        textoConfirmar="Eliminar"
        peligroso
        cargando={borrarMutation.isPending}
        onConfirmar={() => borrarMutation.mutate(aBorrar.id)}
        onCancelar={() => setABorrar(null)}
      />
    </div>
  );
}

function Miniatura({ animal }) {
  const foto = animal.fotos?.[0] ? fotoUrl(animal.fotos[0]) : null;
  const emoji = animal.especie === 'GATO' ? '🐱' : animal.especie === 'PERRO' ? '🐶' : '🐾';

  return (
    <div className="w-10 h-10 rounded-lg bg-refugio-100 shrink-0 overflow-hidden flex items-center justify-center">
      {foto ? (
        <img src={foto} alt="" className="w-full h-full object-cover" />
      ) : (
        <span aria-hidden="true">{emoji}</span>
      )}
    </div>
  );
}
