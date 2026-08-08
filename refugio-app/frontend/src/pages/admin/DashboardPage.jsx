import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { fetchEstadisticas } from '../../api/estadisticas.js';
import { MetricaCard, BarrasHorizontales, SeccionCard } from '../../components/dashboard.jsx';
import { ESPECIES, ESTADOS_ANIMAL, ESTADOS_ADOPCION } from '../../utils/constants.js';
import { formatEuros, formatFecha } from '../../utils/format.js';

const COLOR_ESTADO_ANIMAL = {
  DISPONIBLE: 'bg-green-500',
  EN_ACOGIDA: 'bg-blue-500',
  ADOPTADO: 'bg-gray-400',
  EN_TRATAMIENTO: 'bg-amber-500',
  NO_DISPONIBLE: 'bg-red-500'
};

const COLOR_ESPECIE = {
  PERRO: 'bg-refugio-500',
  GATO: 'bg-indigo-500',
  OTRO: 'bg-gray-400'
};

const COLOR_ESTADO_ADOPCION = {
  SOLICITADA: 'bg-blue-500',
  EN_REVISION: 'bg-amber-500',
  APROBADA: 'bg-green-500',
  RECHAZADA: 'bg-red-500',
  COMPLETADA: 'bg-refugio-600',
  CANCELADA: 'bg-gray-400'
};

export default function DashboardPage() {
  const { data, isPending, isError, error } = useQuery({
    queryKey: ['estadisticas'],
    queryFn: fetchEstadisticas
  });

  if (isPending) {
    return <p className="text-center text-gray-500 py-12">Cargando estadísticas…</p>;
  }

  if (isError) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
        No se pudieron cargar las estadísticas: {error.message}
      </div>
    );
  }

  const disponibles = data.animales.porEstado.DISPONIBLE ?? 0;
  const pendientes =
    (data.adopciones.porEstado.SOLICITADA ?? 0) +
    (data.adopciones.porEstado.EN_REVISION ?? 0);

  const datosEstadoAnimal = Object.entries(ESTADOS_ANIMAL)
    .map(([clave, etiqueta]) => ({
      etiqueta,
      valor: data.animales.porEstado[clave] ?? 0,
      color: COLOR_ESTADO_ANIMAL[clave]
    }))
    .filter((d) => d.valor > 0);

  const datosEspecie = Object.entries(ESPECIES)
    .map(([clave, etiqueta]) => ({
      etiqueta,
      valor: data.animales.porEspecie[clave] ?? 0,
      color: COLOR_ESPECIE[clave]
    }))
    .filter((d) => d.valor > 0);

  const datosEstadoAdopcion = Object.entries(ESTADOS_ADOPCION)
    .map(([clave, etiqueta]) => ({
      etiqueta,
      valor: data.adopciones.porEstado[clave] ?? 0,
      color: COLOR_ESTADO_ADOPCION[clave]
    }))
    .filter((d) => d.valor > 0);

  return (
    <div className="space-y-6">
      {/* Métricas principales */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricaCard
          titulo="Animales en el refugio"
          valor={data.animales.total}
          subtitulo={`${disponibles} disponibles para adopción`}
          icono="🐾"
        />
        <MetricaCard
          titulo="Solicitudes pendientes"
          valor={pendientes}
          subtitulo="Requieren revisión"
          icono="📋"
          acento={pendientes > 0}
        />
        <MetricaCard
          titulo="Adopciones este año"
          valor={data.adopciones.completadasEsteAnio}
          subtitulo={`${data.adopciones.completadasEsteMes} este mes`}
          icono="🏡"
        />
        <MetricaCard
          titulo="Usuarios registrados"
          valor={data.usuarios.total}
          icono="👥"
        />
      </div>

      {/* Métricas económicas */}
      <div className="grid gap-4 sm:grid-cols-3">
        <MetricaCard
          titulo="Ingreso recurrente"
          valor={formatEuros(data.apadrinamientos.ingresoMensualEstimado)}
          subtitulo={`${data.apadrinamientos.activosMensuales} apadrinamientos activos`}
          icono="💚"
        />
        <MetricaCard
          titulo="Donado este mes"
          valor={formatEuros(data.donaciones.totalEsteMes)}
          icono="💶"
        />
        <MetricaCard
          titulo="Donado en total"
          valor={formatEuros(data.donaciones.totalHistorico)}
          subtitulo="Histórico acumulado"
          icono="📈"
        />
      </div>

      {/* Distribuciones */}
      <div className="grid gap-4 lg:grid-cols-2">
        <SeccionCard
          titulo="Animales por estado"
          accion={
            <Link to="/admin/animales" className="text-sm text-refugio-600 hover:underline">
              Gestionar
            </Link>
          }
        >
          <BarrasHorizontales datos={datosEstadoAnimal} vacio="No hay animales registrados." />
        </SeccionCard>

        <SeccionCard titulo="Animales por especie">
          <BarrasHorizontales datos={datosEspecie} vacio="No hay animales registrados." />
        </SeccionCard>
      </div>

      <SeccionCard
        titulo="Adopciones por estado"
        accion={
          <Link to="/admin/adopciones" className="text-sm text-refugio-600 hover:underline">
            Ver solicitudes
          </Link>
        }
      >
        <BarrasHorizontales
          datos={datosEstadoAdopcion}
          vacio="Todavía no hay solicitudes de adopción."
        />
      </SeccionCard>

      <p className="text-xs text-gray-400 text-center">
        Datos actualizados a {formatFecha(data.generadoEn, true)}
      </p>
    </div>
  );
}
