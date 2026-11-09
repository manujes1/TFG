import prisma from '../../shared/prisma.js';

export async function getEstadisticasGenerales() {
  // Inicio del mes y del año para las métricas
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
    prisma.animal.groupBy({
      by: ['estado'],
      _count: { _all: true }
    }),

    prisma.animal.groupBy({
      by: ['especie'],
      _count: { _all: true }
    }),

    prisma.animal.count(),

    prisma.adopcion.groupBy({
      by: ['estado'],
      _count: { _all: true }
    }),

    prisma.adopcion.count({
      where: {
        estado: 'COMPLETADA',
        fechaCompletada: { gte: inicioMes }
      }
    }),

    prisma.adopcion.count({
      where: {
        estado: 'COMPLETADA',
        fechaCompletada: { gte: inicioAnio }
      }
    }),

    prisma.apadrinamiento.count({
      where: { estado: 'ACTIVO', tipo: 'MENSUAL' }
    }),

    prisma.apadrinamiento.aggregate({
      where: { estado: 'ACTIVO', tipo: 'MENSUAL' },
      _sum: { cantidad: true }
    }),

    prisma.donacion.aggregate({
      _sum: { cantidad: true }
    }),

    prisma.donacion.aggregate({
      where: { fecha: { gte: inicioMes } },
      _sum: { cantidad: true }
    }),

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

// [{ estado: 'DISPONIBLE', _count: { _all: 5 } }] -> { DISPONIBLE: 5 }
function normalizarGroupBy(rows, campo) {
  return rows.reduce((acc, row) => {
    acc[row[campo]] = row._count._all;
    return acc;
  }, {});
}
