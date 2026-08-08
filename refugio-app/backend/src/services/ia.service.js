import prisma from '../config/prisma.js';
import { generarTexto } from '../config/ollama.js';
import { ESPECIE_ETIQUETAS, SEXO_ETIQUETAS } from '../utils/etiquetas.js';

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
 * Genera una descripción para un animal y, opcionalmente, la persiste.
 *
 * @param {string} animalId
 * @param {{ guardar?: boolean }} [opciones]
 * @returns {Promise<{ descripcion: string, guardada: boolean }>}
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

/**
 * Normaliza la salida del modelo: elimina prefijos residuales y comillas
 * envolventes que los modelos tienden a añadir pese a las instrucciones.
 */
function limpiarSalida(texto) {
  let limpio = texto.trim();

  limpio = limpio.replace(/^(descripci[oó]n|respuesta)\s*:\s*/i, '');

  if (
    (limpio.startsWith('"') && limpio.endsWith('"')) ||
    (limpio.startsWith('«') && limpio.endsWith('»'))
  ) {
    limpio = limpio.slice(1, -1).trim();
  }

  return limpio;
}
