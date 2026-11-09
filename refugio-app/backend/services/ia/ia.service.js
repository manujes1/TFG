import prisma from '../../shared/prisma.js';
import { generarTexto } from '../../shared/ia/index.js';
import { ESPECIE_ETIQUETAS, SEXO_ETIQUETAS } from './etiquetas.js';
import { evaluarAnimal } from '../../shared/matchmaking.js';

// Solo se pasan al modelo los datos que existen, para que no invente
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

export async function generarDescripcionAnimal(animalId, { guardar = false } = {}) {
  const animal = await prisma.animal.findUnique({ where: { id: animalId } });
  if (!animal) {
    const error = new Error('Animal no encontrado');
    error.statusCode = 404;
    throw error;
  }

  const prompt = construirPromptDescripcion(animal);
  // Temperatura algo más alta para que el texto suene natural
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

// El modelo solo redacta el resultado; la puntuación no la cambia
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

  const resultado = await evaluarAnimal(perfil, animal);

  // Si el animal está descartado no hace falta llamar al modelo
  if (resultado.descartado) {
    return {
      puntuacion: 0,
      criterios: [],
      descartado: true,
      motivoDescarte: resultado.motivoDescarte,
      explicacion: `${animal.nombre} no encaja con tu situación: ${resultado.motivoDescarte.toLowerCase()}.`,
      generadaPorIA: false
    };
  }

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

// Quita prefijos y comillas que a veces añade el modelo
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
