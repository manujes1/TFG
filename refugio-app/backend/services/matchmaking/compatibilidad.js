/**
 * Algoritmo de compatibilidad entre un adoptante y un animal.
 *
 * DISEÑO: el cálculo es determinista y basado en reglas ponderadas sobre
 * datos estructurados. No interviene ningún modelo de lenguaje en la
 * puntuación. Esto garantiza que:
 *   - El resultado es reproducible (misma entrada, misma salida).
 *   - Es explicable: cada punto tiene un criterio identificable.
 *   - Es rápido: no requiere inferencia, se calcula en microsegundos.
 *
 * El modelo de lenguaje se emplea únicamente, y de forma opcional, para
 * redactar una explicación en lenguaje natural del resultado ya calculado.
 *
 * Cada criterio devuelve una puntuación de 0 a 1 y tiene un peso asociado.
 * La puntuación final es la media ponderada, expresada de 0 a 100.
 */

/**
 * Pesos de cada criterio. Suman 1.
 *
 * Justificación de la ponderación:
 *  - La convivencia con niños tiene el peso mayor porque un desajuste aquí
 *    puede derivar en un incidente o en una devolución.
 *  - La convivencia con otros animales, la energía frente al espacio y la
 *    experiencia pesan lo mismo: un fallo en cualquiera de ellas complica
 *    la adaptación del animal al hogar.
 *  - La energía frente al tiempo disponible pesa algo menos porque la rutina
 *    del hogar suele poder ajustarse más que el espacio o la convivencia.
 */
const PESOS = {
  convivenciaNinos: 0.25,
  convivenciaAnimales: 0.20,
  energiaEspacio: 0.20,
  energiaTiempo: 0.15,
  experiencia: 0.20
};

const NIVEL_ENERGIA = { baja: 1, media: 2, alta: 3 };
const NIVEL_TIEMPO = { poco: 1, medio: 2, mucho: 3 };
const NIVEL_EXPERIENCIA = { ninguna: 0, baja: 1, media: 2, alta: 3 };

/**
 * Calcula la compatibilidad entre un perfil de adoptante y un animal.
 *
 * @param {object} perfil - Preferencias del adoptante.
 * @param {object} animal - Registro del animal.
 * @returns {{ puntuacion: number, criterios: object[], descartado: boolean, motivoDescarte?: string }}
 */
export function calcularCompatibilidad(perfil, animal) {
  const caracteristicas = animal.caracteristicas ?? {};

  // --- Filtros duros: descartan al animal por completo ---
  if (
    perfil.preferenciaEspecie !== 'indiferente' &&
    animal.especie !== perfil.preferenciaEspecie
  ) {
    return {
      puntuacion: 0,
      criterios: [],
      descartado: true,
      motivoDescarte: 'No coincide con la especie preferida'
    };
  }

  if (perfil.ninos && caracteristicas.aptoNinos === false) {
    return {
      puntuacion: 0,
      criterios: [],
      descartado: true,
      motivoDescarte: 'No recomendado para hogares con niños'
    };
  }

  // --- Criterios ponderados ---
  const criterios = [];

  criterios.push(evaluarConvivenciaNinos(perfil, caracteristicas));
  criterios.push(evaluarConvivenciaAnimales(perfil, caracteristicas, animal));
  criterios.push(evaluarEnergiaEspacio(perfil, caracteristicas));
  criterios.push(evaluarEnergiaTiempo(perfil, caracteristicas));
  criterios.push(evaluarExperiencia(perfil, caracteristicas, animal));

  const puntuacion = criterios.reduce(
    (suma, c) => suma + c.valor * PESOS[c.id],
    0
  );

  return {
    puntuacion: Math.round(puntuacion * 100),
    criterios,
    descartado: false
  };
}

/* ------------------------------------------------------------------ */
/* Criterios individuales                                              */
/* ------------------------------------------------------------------ */

function evaluarConvivenciaNinos(perfil, c) {
  let valor;
  let detalle;

  if (!perfil.ninos) {
    // Sin niños en casa, el criterio no penaliza
    valor = 1;
    detalle = 'No hay niños en el hogar';
  } else if (c.aptoNinos === true) {
    valor = 1;
    detalle = 'Convive bien con niños';
  } else {
    // aptoNinos indefinido: incertidumbre, ni premio ni castigo fuerte
    valor = 0.5;
    detalle = 'No hay información sobre su convivencia con niños';
  }

  return { id: 'convivenciaNinos', etiqueta: 'Convivencia con niños', valor, detalle };
}

function evaluarConvivenciaAnimales(perfil, c, animal) {
  const tieneOtros = perfil.otrosPerros || perfil.otrosGatos;

  if (!tieneOtros) {
    return {
      id: 'convivenciaAnimales',
      etiqueta: 'Convivencia con otros animales',
      valor: 1,
      detalle: 'No hay otros animales en el hogar'
    };
  }

  const comprobaciones = [];
  if (perfil.otrosPerros) comprobaciones.push(c.aptoOtrosPerros);
  if (perfil.otrosGatos) comprobaciones.push(c.aptoGatos);

  const positivas = comprobaciones.filter((v) => v === true).length;
  const negativas = comprobaciones.filter((v) => v === false).length;
  const total = comprobaciones.length;

  let valor;
  let detalle;

  if (negativas > 0) {
    valor = 0.1;
    detalle = `${animal.nombre} no convive bien con alguno de tus animales`;
  } else if (positivas === total) {
    valor = 1;
    detalle = 'Convive bien con los animales que tienes';
  } else {
    valor = 0.5;
    detalle = 'Falta información sobre su convivencia con otros animales';
  }

  return { id: 'convivenciaAnimales', etiqueta: 'Convivencia con otros animales', valor, detalle };
}

function evaluarEnergiaEspacio(perfil, c) {
  const energia = NIVEL_ENERGIA[c.energia];

  if (!energia) {
    return {
      id: 'energiaEspacio',
      etiqueta: 'Energía y espacio disponible',
      valor: 0.5,
      detalle: 'No hay información sobre su nivel de energía'
    };
  }

  // Espacio disponible en una escala de 1 a 3
  let espacio = perfil.tipoVivienda === 'casa' ? 2 : 1;
  if (perfil.jardin) espacio += 1;
  if (perfil.metrosCuadrados >= 120) espacio = Math.min(3, espacio + 1);

  let valor;
  let detalle;

  if (espacio >= energia) {
    valor = 1;
    detalle = 'El espacio disponible es adecuado para su nivel de energía';
  } else if (espacio === energia - 1) {
    valor = 0.55;
    detalle = 'El espacio es algo justo para su nivel de energía';
  } else {
    valor = 0.2;
    detalle = 'Su nivel de energía requiere más espacio del disponible';
  }

  return { id: 'energiaEspacio', etiqueta: 'Energía y espacio disponible', valor, detalle };
}

function evaluarEnergiaTiempo(perfil, c) {
  const energia = NIVEL_ENERGIA[c.energia];
  const tiempo = NIVEL_TIEMPO[perfil.tiempoDiario];

  if (!energia) {
    return {
      id: 'energiaTiempo',
      etiqueta: 'Energía y tiempo disponible',
      valor: 0.5,
      detalle: 'No hay información sobre su nivel de energía'
    };
  }

  let valor;
  let detalle;

  if (tiempo >= energia) {
    valor = 1;
    detalle = 'Tu disponibilidad diaria cubre sus necesidades';
  } else if (tiempo === energia - 1) {
    valor = 0.55;
    detalle = 'Necesitaría algo más de dedicación diaria';
  } else {
    valor = 0.2;
    detalle = 'Requiere bastante más tiempo diario del que indicas';
  }

  return { id: 'energiaTiempo', etiqueta: 'Energía y tiempo disponible', valor, detalle };
}

function evaluarExperiencia(perfil, c, animal) {
  const experiencia = NIVEL_EXPERIENCIA[perfil.experiencia] ?? 0;

  // Exigencia estimada del animal según temperamento y tamaño
  let exigencia = 1;
  if (c.temperamento === 'tímido') exigencia = 3;
  else if (c.temperamento === 'independiente') exigencia = 2;
  if (animal.peso != null && Number(animal.peso) >= 25) {
    exigencia = Math.max(exigencia, 2);
  }
  if (c.energia === 'alta') exigencia = Math.max(exigencia, 2);

  let valor;
  let detalle;

  if (experiencia >= exigencia) {
    valor = 1;
    detalle = 'Tu experiencia previa es adecuada para este animal';
  } else if (experiencia === exigencia - 1) {
    valor = 0.6;
    detalle = 'Podría requerir algo más de experiencia, con acompañamiento del refugio';
  } else {
    valor = 0.3;
    detalle = 'Este animal requiere experiencia previa considerable';
  }

  return { id: 'experiencia', etiqueta: 'Experiencia previa', valor, detalle };
}
