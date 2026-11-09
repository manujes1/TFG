// Compatibilidad por reglas: filtros que descartan y cinco criterios ponderados (0-100)

// Pesos de cada criterio (suman 1)
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

export function calcularCompatibilidad(perfil, animal) {
  const caracteristicas = animal.caracteristicas ?? {};

  // Filtros que descartan directamente
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

  // Criterios ponderados
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

function evaluarConvivenciaNinos(perfil, c) {
  let valor;
  let detalle;

  if (!perfil.ninos) {
    valor = 1;
    detalle = 'No hay niños en el hogar';
  } else if (c.aptoNinos === true) {
    valor = 1;
    detalle = 'Convive bien con niños';
  } else {
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

  // Espacio en escala de 1 a 3, para compararlo con la energía
  let espacio = perfil.tipoVivienda === 'casa' ? 2 : 1;
  if (perfil.jardin) espacio += 1;
  // 120 m² o más cuentan como un nivel más de espacio
  if (perfil.metrosCuadrados >= 120) espacio = Math.min(3, espacio + 1);

  let valor;
  let detalle;

  // 1: encaja, 0.55: algo justo, 0.2: no encaja
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

  // Exigencia del animal según temperamento, tamaño y energía
  let exigencia = 1;
  if (c.temperamento === 'tímido') exigencia = 3;
  else if (c.temperamento === 'independiente') exigencia = 2;
  // Un animal de 25 kg o más exige al menos experiencia media
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
