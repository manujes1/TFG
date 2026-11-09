import prisma from '../../shared/prisma.js';
import { generarTexto } from '../../shared/ia/index.js';
import { evaluarAnimales, evaluarAnimal } from '../../shared/matchmaking.js';
import { perfilAdoptanteSchema } from '../../shared/validation.js';

// Recomendaciones y traducción del texto libre a un perfil de hogar

export async function recomendarAnimales(usuarioId, { limite = 10, minimo = 0 } = {}) {
  const usuario = await prisma.user.findUnique({ where: { id: usuarioId } });
  if (!usuario) {
    const error = new Error('Usuario no encontrado');
    error.statusCode = 404;
    throw error;
  }

  const perfil = usuario.preferencias;

  if (!perfil || Object.keys(perfil).length === 0) {
    return { recomendaciones: [], perfilCompleto: false };
  }

  const animales = await prisma.animal.findMany({
    where: { estado: 'DISPONIBLE' }
  });

  const evaluados = (await evaluarAnimales(perfil, animales))
    .filter((r) => !r.descartado && r.puntuacion >= minimo)
    .sort((a, b) => b.puntuacion - a.puntuacion)
    .slice(0, limite);

  return { recomendaciones: evaluados, perfilCompleto: true };
}

// El perfil interpretado sustituye al que tuviera guardado
export async function recomendarDesdeTexto(usuarioId, texto, opciones = {}) {
  const perfilInterpretado = await interpretarPreferencias(texto);
  await prisma.user.update({
    where: { id: usuarioId },
    data: { preferencias: perfilInterpretado }
  });

  const resultado = await recomendarAnimales(usuarioId, opciones);
  return { perfilInterpretado, ...resultado };
}

export async function compatibilidadConAnimal(usuarioId, animalId) {
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
    return { perfilCompleto: false };
  }

  const resultado = await evaluarAnimal(perfil, animal);
  return { perfilCompleto: true, ...resultado };
}

// Pide al modelo el perfil de hogar en JSON a partir del texto libre
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

// Valores por defecto para lo que el modelo no haya rellenado bien
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

  return perfilAdoptanteSchema.parse(candidato);
}

// llama3.2:3b a veces corta la respuesta antes de la llave de cierre; si pasa, se añade.
function extraerJson(texto) {
  const inicio = texto.indexOf('{');
  if (inicio === -1) return null;

  const bruto = texto.slice(inicio);

  const fin = bruto.lastIndexOf('}');
  if (fin !== -1) {
    try {
      return JSON.parse(bruto.slice(0, fin + 1));
    } catch {
    }
  }

  try {
    return JSON.parse(`${bruto.replace(/,\s*$/, '').trimEnd()}\n}`);
  } catch {
    return null;
  }
}

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
