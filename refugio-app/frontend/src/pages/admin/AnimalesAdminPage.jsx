import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { fetchAnimales, deleteAnimal } from '../../api/animales.js';
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

  const inputClass = 'field-input';

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-stone-800 tracking-tight">Gestión de animales</h2>
        <Link to="/admin/animales/nuevo" className="btn-primary text-sm px-4 py-2">
          + Nuevo animal
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      {/* Filtros */}
      <div className="card p-4 flex flex-wrap gap-3">
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

      {isPending && <p className="text-center text-stone-500 py-12">Cargando…</p>}

      {isError && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
          No se pudieron cargar los animales: {queryError.message}
        </div>
      )}

      {data && (
        <div className="card overflow-hidden">
          {data.data.length === 0 ? (
            <p className="text-center text-stone-500 py-12">
              No hay animales que coincidan con la búsqueda.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-stone-50 text-left text-xs uppercase tracking-wide text-stone-500 border-b border-stone-200">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Animal</th>
                    <th className="px-4 py-3 font-semibold">Especie</th>
                    <th className="px-4 py-3 font-semibold">Estado</th>
                    <th className="px-4 py-3 font-semibold hidden md:table-cell">Ubicación</th>
                    <th className="px-4 py-3 font-semibold hidden lg:table-cell">Ingreso</th>
                    <th className="px-4 py-3 font-semibold text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {data.data.map((animal) => (
                    <tr key={animal.id} className="hover:bg-refugio-50/40 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Miniatura animal={animal} />
                          <div className="min-w-0">
                            <p className="font-medium text-stone-900">{animal.nombre}</p>
                            <p className="text-xs text-stone-500">
                              {SEXOS[animal.sexo]}
                              {animal.raza ? ` · ${animal.raza}` : ''}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-stone-600">{ESPECIES[animal.especie]}</td>
                      <td className="px-4 py-3">
                        <EstadoBadge
                          estado={animal.estado}
                          etiquetas={ESTADOS_ANIMAL}
                          colores={ESTADO_ANIMAL_COLORES}
                        />
                      </td>
                      <td className="px-4 py-3 text-stone-600 hidden md:table-cell">
                        {animal.ubicacion || '—'}
                      </td>
                      <td className="px-4 py-3 text-stone-600 hidden lg:table-cell">
                        {formatFecha(animal.fechaIngreso)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <Link
                            to={`/animales/${animal.id}`}
                            className="text-xs px-2 py-1 rounded text-stone-600 hover:bg-stone-100 transition-colors"
                          >
                            Ver
                          </Link>
                          <Link
                            to={`/admin/animales/${animal.id}/editar`}
                            className="text-xs px-2 py-1 rounded text-refugio-700 hover:bg-refugio-50 transition-colors font-medium"
                          >
                            Editar
                          </Link>
                          <Link
                            to={`/admin/animales/${animal.id}/expedientes`}
                            className="text-xs px-2 py-1 rounded text-refugio-700 hover:bg-refugio-50 transition-colors font-medium"
                          >
                            Historial
                          </Link>
                          <button
                            onClick={() => setABorrar(animal)}
                            className="text-xs px-2 py-1 rounded text-red-600 hover:bg-red-50 transition-colors font-medium"
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {data.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-stone-100 bg-stone-50/50">
              <span className="text-xs text-stone-500">
                {data.pagination.total} animales · página {data.pagination.page} de{' '}
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
    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-refugio-100 to-refugio-50 shrink-0 overflow-hidden flex items-center justify-center ring-1 ring-stone-200/60">
      {foto ? (
        <img src={foto} alt="" className="w-full h-full object-cover" />
      ) : (
        <span aria-hidden="true">{emoji}</span>
      )}
    </div>
  );
}
