import { useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { fetchAnimales } from '../api/animales.js';
import AnimalCard from '../components/AnimalCard.jsx';
import { ESPECIES, SEXOS, ESTADOS_ANIMAL } from '../utils/constants.js';

const PAGE_SIZE = 12;

export default function AnimalesPage() {
  const [filtros, setFiltros] = useState({
    especie: '',
    sexo: '',
    estado: '',
    search: ''
  });
  const [page, setPage] = useState(1);

  const { data, isPending, isError, error, isFetching } = useQuery({
    queryKey: ['animales', filtros, page],
    queryFn: () => fetchAnimales({ ...filtros, page, pageSize: PAGE_SIZE }),
    placeholderData: keepPreviousData
  });

  function handleFiltroChange(e) {
    setFiltros({ ...filtros, [e.target.name]: e.target.value });
    setPage(1); // al cambiar filtros volvemos a la primera página
  }

  function limpiarFiltros() {
    setFiltros({ especie: '', sexo: '', estado: '', search: '' });
    setPage(1);
  }

  const hayFiltrosActivos = Object.values(filtros).some((v) => v !== '');
  const selectClass =
    'border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-refugio-500 bg-white';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-refugio-700 mb-1">Animales</h1>
        <p className="text-gray-600 text-sm">
          Conoce a los animales del refugio que buscan un hogar.
        </p>
      </div>

      {/* Filtros */}
      <div className="bg-white shadow rounded-xl p-4">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <label htmlFor="search" className="block text-xs font-medium text-gray-600 mb-1">
              Buscar
            </label>
            <input
              id="search"
              name="search"
              value={filtros.search}
              onChange={handleFiltroChange}
              placeholder="Nombre o raza..."
              className={`${selectClass} w-full`}
            />
          </div>

          <div>
            <label htmlFor="especie" className="block text-xs font-medium text-gray-600 mb-1">
              Especie
            </label>
            <select
              id="especie"
              name="especie"
              value={filtros.especie}
              onChange={handleFiltroChange}
              className={selectClass}
            >
              <option value="">Todas</option>
              {Object.entries(ESPECIES).map(([valor, etiqueta]) => (
                <option key={valor} value={valor}>{etiqueta}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="sexo" className="block text-xs font-medium text-gray-600 mb-1">
              Sexo
            </label>
            <select
              id="sexo"
              name="sexo"
              value={filtros.sexo}
              onChange={handleFiltroChange}
              className={selectClass}
            >
              <option value="">Todos</option>
              {Object.entries(SEXOS).map(([valor, etiqueta]) => (
                <option key={valor} value={valor}>{etiqueta}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="estado" className="block text-xs font-medium text-gray-600 mb-1">
              Estado
            </label>
            <select
              id="estado"
              name="estado"
              value={filtros.estado}
              onChange={handleFiltroChange}
              className={selectClass}
            >
              <option value="">Todos</option>
              {Object.entries(ESTADOS_ANIMAL).map(([valor, etiqueta]) => (
                <option key={valor} value={valor}>{etiqueta}</option>
              ))}
            </select>
          </div>

          {hayFiltrosActivos && (
            <button
              onClick={limpiarFiltros}
              className="text-sm text-refugio-600 hover:underline px-2 py-2"
            >
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Resultados */}
      {isPending && (
        <p className="text-center text-gray-500 py-12">Cargando animales…</p>
      )}

      {isError && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
          No se pudieron cargar los animales: {error.message}
        </div>
      )}

      {data && (
        <>
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              {data.pagination.total}{' '}
              {data.pagination.total === 1 ? 'animal' : 'animales'}
            </span>
            {isFetching && <span className="text-gray-400">Actualizando…</span>}
          </div>

          {data.data.length === 0 ? (
            <div className="bg-white shadow rounded-xl p-12 text-center">
              <p className="text-gray-500">
                No hay animales que coincidan con la búsqueda.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {data.data.map((animal) => (
                <AnimalCard key={animal.id} animal={animal} />
              ))}
            </div>
          )}

          {/* Paginación */}
          {data.pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 text-sm rounded-lg border border-gray-300 bg-white disabled:opacity-40 hover:bg-gray-50 transition"
              >
                Anterior
              </button>
              <span className="text-sm text-gray-600">
                Página {data.pagination.page} de {data.pagination.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= data.pagination.totalPages}
                className="px-4 py-2 text-sm rounded-lg border border-gray-300 bg-white disabled:opacity-40 hover:bg-gray-50 transition"
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
