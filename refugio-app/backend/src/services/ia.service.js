import prisma from '../config/prisma.js';
import { generarTexto } from '../config/ia/index.js';
import { ESPECIE_ETIQUETAS, SEXO_ETIQUETAS } from '../utils/etiquetas.js';
import { evaluarAnimal } from './matchmaking.service.js';
import { perfilAdoptanteSchema } from '../utils/validation.js';

/* ================================================================== */
/* Generación de descripciones                                         */
/* ================================================================== */

/**
 * Construye el prompt para generar la descripción de un animal.
 *
 * Se incluyen únicamente los campos que existen realmente, y se dan
 * instrucciones explícitas de no inventar información, para minimizar
 * alucinaciones en un contenido que se publicará de cara al público.
 */
function construirPromptDescripcion(animal) {
  const datos = [];

  datos.push(`Nombre: ${animal.nombre}`);
  datos.push(`Especie: ${ESPECIE_ETIQUETAS[animal.especie] ?? animal.especie}`);
  datos.push(`Sexo: ${SEXO_ETIQUETAS[animal.sexo] ?? animal.sexo}`);
  if (animal.raza) datos.push(`Raza: ${animal.raza}`);
  if (animal.edadEstimada != null) datos.push(`Edad: ${animal.edadEstimada} años`);
  if (animal.color) datos.push(`Color: ${animal.color}`);
  if (animal.peso != null) datos.push(`Peso: ${animal.peso} kg`);

  const c = animal.caracteristicas ?? {};
  if (c.energia) datos.push(`Nivel de energía: ${c.energia}`);
  if (c.temperamento) datos.push(`Temperamento: ${c.temperamento}`);
  if (c.aptoNinos === true) datos.push('Convive bien con niños');
  if (c.aptoNinos === false) datos.push('No recomendado para hogares con niños pequeños');
  if (c.aptoOtrosPerros === true) datos.push('Convive bien con otros perros');
  if (c.aptoGatos === true) datos.push('Convive bien con gatos');

  if (animal.descripcionManual) {
    datos.push(`Notas del personal del refugio: ${animal.descripcionManual}`);
  }

  return `Eres el responsable de comunicación de un refugio de animales en España.

Escribe una descripción para la ficha de adopción del siguiente animal:

${datos.join('\n')}

Instrucciones estrictas:
- Escribe en español de España.
- Extensión: entre 50 y 80 palabras.
- Tono cálido y cercano, orientado a que una familia se anime a conocerlo.
- Usa ÚNICAMENTE la información proporcionada arriba. No inventes historias, procedencias, rescates ni datos médicos.
- No incluyas títulos, encabezados ni comillas: devuelve solo el texto de la descripción.
- No encadenes preguntas retóricas.

Descripción:`;
}

/**
 * Genera una descripción para un animal y, opcionalmente, la guarda.
 */
export async function generarDescripcionAnimal(animalId, { guardar = false } = {}) {
  const animal = await prisma.animal.findUnique({ where: { id: animalId } });
  if (!animal) {
    const error = new Error('Animal no encontrado');
    error.statusCode = 404;
    throw error;
  }

  const prompt = construirPromptDescripcion(animal);
  const texto = await generarTexto(prompt, { temperature: 0.7, numPredict: 220 });
  const descripcion = limpiarSalida(texto);

  if (!descripcion) {
    const error = new Error('El modelo no devolvió una descripción utilizable');
    error.statusCode = 502;
    throw error;
  }

  if (guardar) {
    await prisma.animal.update({
      where: { id: animalId },
      data: { descripcion }
    });
  }

  return { descripcion, guardada: guardar };
}

/* ================================================================== */
/* Interpretación de preferencias en texto libre                       */
/* ================================================================== */

/**
 * Construye el prompt que traduce una descripción en lenguaje natural
 * al perfil estructurado que consume el algoritmo de compatibilidad.
 *
 * DISEÑO: igual que en el resto del módulo, el modelo no decide nada sobre
 * qué animal encaja mejor. Su única tarea es traducir texto libre a los
 * campos estructurados del perfil; la puntuación la sigue calculando
 * `calcularCompatibilidad`, de forma determinista y explicable.
 */
function construirPromptPreferencias(texto) {
  return `Eres un asistente que traduce lo que cuenta un futuro adoptante a un formulario estructurado, para un refugio de animales en España.

Lee el siguiente texto de la persona interesada y devuelve ÚNICAMENTE un objeto JSON (sin explicaciones, sin markdown, sin comillas envolventes) con estas claves exactas:

{
  "tipoVivienda": "piso" o "casa",
  "metrosCuadrados": número entero (metros cuadrados aproximados) u omite la clave si no se menciona,
  "jardin": true o false (si tiene jardín, patio o terraza amplia),
  "ninos": true o false (si hay niños en casa),
  "otrosPerros": true o false (si ya tiene perro),
  "otrosGatos": true o false (si ya tiene gato),
  "experiencia": una de "ninguna", "baja", "media", "alta" (experiencia previa con animales),
  "tiempoDiario": una de "poco", "medio", "mucho" (tiempo diario disponible: poco = menos de 1 hora, medio = entre 1 y 3 horas, mucho = más de 3 horas),
  "preferenciaEspecie": "PERRO", "GATO" o "indiferente" (especie que busca; "indiferente" si no lo especifica o le da igual)
}

Texto de la persona:
"""
${texto}
"""

Instrucciones estrictas:
- Si un dato no se menciona o no se puede deducir con razonable seguridad, usa un valor neutro por defecto en lugar de inventar (jardin/ninos/otrosPerros/otrosGatos: false; experiencia: "ninguna"; tiempoDiario: "medio"; tipoVivienda: "piso"; preferenciaEspecie: "indiferente").
- No inventes datos que el texto no sugiere.
- Devuelve solo el objeto JSON, nada más.

JSON:`;
}

/**
 * Aplica valores por defecto a los campos ausentes o inválidos del objeto
 * devuelto por el modelo, para garantizar que siempre cumple el esquema
 * que espera el algoritmo de compatibilidad.
 */
function sanearPerfilExtraido(bruto) {
  const candidato = {
    tipoVivienda: bruto.tipoVivienda === 'casa' ? 'casa' : 'piso',
    jardin: bruto.jardin === true,
    ninos: bruto.ninos === true,
    otrosPerros: bruto.otrosPerros === true,
    otrosGatos: bruto.otrosGatos === true,
    experiencia: ['ninguna', 'baja', 'media', 'alta'].includes(bruto.experiencia)
      ? bruto.experiencia
      : 'ninguna',
    tiempoDiario: ['poco', 'medio', 'mucho'].includes(bruto.tiempoDiario)
      ? bruto.tiempoDiario
      : 'medio',
    preferenciaEspecie: ['PERRO', 'GATO', 'indiferente'].includes(bruto.preferenciaEspecie)
      ? bruto.preferenciaEspecie
      : 'indiferente'
  };

  const metros = Number(bruto.metrosCuadrados);
  if (Number.isInteger(metros) && metros >= 10 && metros <= 2000) {
    candidato.metrosCuadrados = metros;
  }

  // El saneado ya garantiza que cumple el esquema; parse() no debería fallar
  // nunca aquí, pero lo mantenemos como red de seguridad explícita.
  return perfilAdoptanteSchema.parse(candidato);
}

/**
 * Extrae el primer objeto JSON de un texto, tolerando que el modelo lo
 * envuelva en explicaciones o bloques de código markdown pese a las
 * instrucciones.
 *
 * También tolera que el modelo corte la respuesta justo antes de la llave
 * de cierre (algo que llama3.2:3b hace de forma consistente con este
 * prompt, con done_reason "stop" pese a no haber cerrado el objeto):
 * si no hay un '}' que produzca JSON válido, se reintenta añadiéndolo.
 */
function extraerJson(texto) {
  const inicio = texto.indexOf('{');
  if (inicio === -1) return null;

  const bruto = texto.slice(inicio);

  const fin = bruto.lastIndexOf('}');
  if (fin !== -1) {
    try {
      return JSON.parse(bruto.slice(0, fin + 1));
    } catch {
      // Seguimos abajo con el intento de cierre automático.
    }
  }

  try {
    return JSON.parse(`${bruto.replace(/,\s*$/, '').trimEnd()}\n}`);
  } catch {
    return null;
  }
}

/**
 * Traduce una descripción en lenguaje natural de las preferencias de un
 * adoptante al perfil estructurado del algoritmo de compatibilidad.
 *
 * @param {string} texto - Descripción libre escrita por la persona.
 * @returns {Promise<object>} Perfil validado, listo para persistir.
 */
export async function interpretarPreferencias(texto) {
  const prompt = construirPromptPreferencias(texto);
  const respuesta = await generarTexto(prompt, { temperature: 0.2, numPredict: 300, json: true });

  const bruto = extraerJson(respuesta);
  if (!bruto) {
    const error = new Error(
      'No se pudo interpretar el texto. Prueba a describir tu situación con otras palabras.'
    );
    error.statusCode = 502;
    throw error;
  }

  return sanearPerfilExtraido(bruto);
}

/* ================================================================== */
/* Explicación de compatibilidad                                       */
/* ================================================================== */

/**
 * Construye el prompt para explicar un resultado de compatibilidad.
 *
 * IMPORTANTE: el modelo NO calcula ni cuestiona la puntuación. Recibe el
 * resultado ya computado por el algoritmo determinista y su única tarea es
 * redactarlo en lenguaje natural. Esto mantiene la decisión fuera del LLM.
 */
function construirPromptExplicacion(animal, resultado, perfil) {
  const evaluacion = resultado.criterios
    .map((c) => `- ${c.etiqueta}: ${c.detalle}`)
    .join('\n');

  const hogar = [];
  hogar.push(`Vivienda: ${perfil.tipoVivienda}${perfil.jardin ? ' con jardín' : ' sin jardín'}`);
  hogar.push(`Niños en casa: ${perfil.ninos ? 'sí' : 'no'}`);
  hogar.push(`Otros animales: ${perfil.otrosPerros || perfil.otrosGatos ? 'sí' : 'no'}`);
  hogar.push(`Experiencia previa: ${perfil.experiencia}`);
  hogar.push(`Tiempo diario disponible: ${perfil.tiempoDiario}`);

  return `Eres un asesor de adopciones de un refugio de animales en España.

Un sistema ha evaluado la compatibilidad entre una persona interesada en adoptar y un animal concreto. Tu tarea es explicar ese resultado en lenguaje natural, dirigiéndote a la persona interesada.

ANIMAL: ${animal.nombre} (${ESPECIE_ETIQUETAS[animal.especie] ?? animal.especie}${animal.raza ? `, ${animal.raza}` : ''})

SITUACIÓN DE LA PERSONA:
${hogar.join('\n')}

RESULTADO DE LA EVALUACIÓN (compatibilidad: ${resultado.puntuacion} sobre 100):
${evaluacion}

Instrucciones estrictas:
- Escribe en español de España, tuteando a la persona.
- Extensión: entre 60 y 90 palabras, en un solo párrafo.
- Explica los puntos fuertes de la compatibilidad y, si los hay, los aspectos a tener en cuenta.
- Basa tu explicación ÚNICAMENTE en la evaluación proporcionada. No inventes datos del animal ni de la persona, ni cuestiones la puntuación.
- Sé honesto: si hay aspectos poco favorables, menciónalos con naturalidad en lugar de ocultarlos.
- No repitas la cifra de compatibilidad ni enumeres los criterios como lista: redacta un texto fluido.
- Devuelve solo el texto, sin títulos ni comillas.

Explicación:`;
}

/**
 * Genera una explicación en lenguaje natural de la compatibilidad entre
 * un usuario y un animal.
 *
 * La evaluación la hace el servicio de matchmaking; el modelo solo redacta.
 *
 * @param {string} usuarioId
 * @param {string} animalId
 * @returns {Promise<{ puntuacion: number, criterios: object[], explicacion: string }>}
 */
export async function explicarCompatibilidad(usuarioId, animalId) {
  const [usuario, animal] = await Promise.all([
    prisma.user.findUnique({ where: { id: usuarioId } }),
    prisma.animal.findUnique({ where: { id: animalId } })
  ]);

  if (!usuario) {
    const error = new Error('Usuario no encontrado');
    error.statusCode = 404;
    throw error;
  }
  if (!animal) {
    const error = new Error('Animal no encontrado');
    error.statusCode = 404;
    throw error;
  }

  const perfil = usuario.preferencias;
  if (!perfil || Object.keys(perfil).length === 0) {
    const error = new Error(
      'Necesitas completar tu perfil de adopción para obtener recomendaciones personalizadas'
    );
    error.statusCode = 400;
    throw error;
  }

  // 1. Evaluación (algoritmo determinista, o Gemini si MATCHMAKING_MODE=llm)
  const resultado = await evaluarAnimal(perfil, animal);

  if (resultado.descartado) {
    // No llamamos al modelo: el motivo del descarte ya es claro por sí mismo
    return {
      puntuacion: 0,
      criterios: [],
      descartado: true,
      motivoDescarte: resultado.motivoDescarte,
      explicacion: `${animal.nombre} no encaja con tu situación: ${resultado.motivoDescarte.toLowerCase()}.`,
      generadaPorIA: false
    };
  }

  // 2. Redacción con el modelo
  const prompt = construirPromptExplicacion(animal, resultado, perfil);
  const texto = await generarTexto(prompt, { temperature: 0.6, numPredict: 240 });
  const explicacion = limpiarSalida(texto);

  if (!explicacion) {
    const error = new Error('El modelo no devolvió una explicación utilizable');
    error.statusCode = 502;
    throw error;
  }

  return {
    puntuacion: resultado.puntuacion,
    criterios: resultado.criterios,
    descartado: false,
    origen: resultado.origen,
    explicacion,
    generadaPorIA: true
  };
}

/* ================================================================== */
/* Utilidades                                                          */
/* ================================================================== */

/**
 * Normaliza la salida del modelo: elimina prefijos residuales y comillas
 * envolventes que los modelos tienden a añadir pese a las instrucciones.
 */
function limpiarSalida(texto) {
  let limpio = texto.trim();

  limpio = limpio.replace(/^(descripci[oó]n|explicaci[oó]n|respuesta)\s*:\s*/i, '');

  if (
    (limpio.startsWith('"') && limpio.endsWith('"')) ||
    (limpio.startsWith('«') && limpio.endsWith('»'))
  ) {
    limpio = limpio.slice(1, -1).trim();
  }

  return limpio;
}
