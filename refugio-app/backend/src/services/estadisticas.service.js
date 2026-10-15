import prisma from '../../shared/prisma.js';

/**
 * Devuelve un snapshot con las métricas clave del refugio.
 * Todas las queries se ejecutan en paralelo con Promise.all para
 * minimizar el tiempo total de respuesta.
 */
export async function getEstadisticasGenerales() {
  // Fecha de inicio del mes actual (para métricas mensuales)
  const now = new Date();
  const inicioMes = new Date(now.getFullYear(), now.getMonth(), 1);
  const inicioAnio = new Date(now.getFullYear(), 0, 1);

  const [
    animalesPorEstado,
    animalesPorEspecie,
    totalAnimales,
    adopcionesPorEstado,
    adopcionesEsteMes,
    adopcionesEsteAnio,
    apadrinamientosActivos,
    ingresoMensualApadrinamientos,
    donacionesTotalHistorico,
    donacionesEsteMes,
    usuariosTotal
  ] = await Promise.all([
    // Animales agrupados por estado
    prisma.animal.groupBy({
      by: ['estado'],
      _count: { _all: true }
    }),

    // Animales agrupados por especie
    prisma.animal.groupBy({
      by: ['especie'],
      _count: { _all: true }
    }),

    // Total de animales
    prisma.animal.count(),

    // Adopciones agrupadas por estado
    prisma.adopcion.groupBy({
      by: ['estado'],
      _count: { _all: true }
    }),

    // Adopciones completadas este mes
    prisma.adopcion.count({
      where: {
        estado: 'COMPLETADA',
        fechaCompletada: { gte: inicioMes }
      }
    }),

    // Adopciones completadas este año
    prisma.adopcion.count({
      where: {
        estado: 'COMPLETADA',
        fechaCompletada: { gte: inicioAnio }
      }
    }),

    // Apadrinamientos mensuales activos
    prisma.apadrinamiento.count({
      where: { estado: 'ACTIVO', tipo: 'MENSUAL' }
    }),

    // Ingreso recurrente mensual (suma de cantidades de los mensuales activos)
    prisma.apadrinamiento.aggregate({
      where: { estado: 'ACTIVO', tipo: 'MENSUAL' },
      _sum: { cantidad: true }
    }),

    // Donado en total (histórico)
    prisma.donacion.aggregate({
      _sum: { cantidad: true }
    }),

    // Donado este mes
    prisma.donacion.aggregate({
      where: { fecha: { gte: inicioMes } },
      _sum: { cantidad: true }
    }),

    // Total de usuarios registrados y activos
    prisma.user.count({ where: { activo: true } })
  ]);

  return {
    animales: {
      total: totalAnimales,
      porEstado: normalizarGroupBy(animalesPorEstado, 'estado'),
      porEspecie: normalizarGroupBy(animalesPorEspecie, 'especie')
    },
    adopciones: {
      porEstado: normalizarGroupBy(adopcionesPorEstado, 'estado'),
      completadasEsteMes: adopcionesEsteMes,
      completadasEsteAnio: adopcionesEsteAnio
    },
    apadrinamientos: {
      activosMensuales: apadrinamientosActivos,
      ingresoMensualEstimado: ingresoMensualApadrinamientos._sum.cantidad ?? 0
    },
    donaciones: {
      totalHistorico: donacionesTotalHistorico._sum.cantidad ?? 0,
      totalEsteMes: donacionesEsteMes._sum.cantidad ?? 0
    },
    usuarios: {
      total: usuariosTotal
    },
    generadoEn: now
  };
}

/**
 * Convierte el resultado de un groupBy de Prisma en un objeto plano.
 * De [{ estado: 'DISPONIBLE', _count: { _all: 5 } }, ...]
 * a   { DISPONIBLE: 5, ... }
 */
function normalizarGroupBy(rows, campo) {
  return rows.reduce((acc, row) => {
    acc[row[campo]] = row._count._all;
    return acc;
  }, {});
}
