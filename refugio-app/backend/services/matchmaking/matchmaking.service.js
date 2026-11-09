import crypto from 'node:crypto';
import { z } from 'zod';
import { calcularCompatibilidad } from './compatibilidad.js';
import { generarTexto } from '../../shared/ia/gemini.provider.js';

// Evaluación de compatibilidad: reglas por defecto, o Gemini si MATCHMAKING_MODE=llm

const ETIQUETAS_CRITERIOS = {
  convivenciaNinos: 'Convivencia con niños',
  convivenciaAnimales: 'Convivencia con otros animales',
  energiaEspacio: 'Energía y espacio disponible',
  energiaTiempo: 'Energía y tiempo disponible',
  experiencia: 'Experiencia previa'
};

const TAMANO_LOTE = 15;
const CACHE_TTL_MS = 60 * 60 * 1000;
const CACHE_MAX = 500;

// La clave cambia si cambia el perfil o el animal (updatedAt).
const cache = new Map();

function usaLLM() {
  return (
    (process.env.MATCHMAKING_MODE || '').toLowerCase() === 'llm' &&
    (process.env.IA_PROVIDER || '').toLowerCase() === 'gemini'
  );
}

function conOrigen(resultado, origen) {
  return { ...resultado, origen };
}

function claveCache(perfil, animal) {
  const huella = crypto.createHash('sha1').update(JSON.stringify(perfil)).digest('hex');
  return `${huella}:${animal.id}:${new Date(animal.updatedAt).getTime()}`;
}

const respuestaSchema = z.array(
  z.object({
    animalId: z.string(),
    puntuacion: z.number().min(0).max(100),
    criterios: z
      .array(
        z.object({
          id: z.enum(Object.keys(ETIQUETAS_CRITERIOS)),
          valor: z.number().min(0).max(1),
          detalle: z.string()
        })
      )
      .optional()
      .default([])
  })
);

function construirPrompt(perfil, animales) {
  const datos = animales.map((a) => ({
    animalId: a.id,
    nombre: a.nombre,
    especie: a.especie,
    raza: a.raza,
    peso: a.peso != null ? Number(a.peso) : null,
    edadEstimada: a.edadEstimada,
    caracteristicas: a.caracteristicas ?? {}
  }));

  return `Eres un asesor de adopciones de un refugio de animales en España.

Valora de 0 a 100 la compatibilidad entre la persona interesada y cada animal de la lista. 0 es incompatible y 100 encaja perfectamente.

Todos los animales de la lista ya han pasado los filtros básicos (especie y convivencia con niños): no descartes ninguno, puntúalos todos. Si un dato no aparece, puntúa ese criterio con un valor intermedio y menciónalo en el detalle.

Para cada animal, desglosa la valoración en estos criterios, cada uno con un valor de 0 a 1 y una frase breve de detalle en español, dirigida a la persona:
${Object.entries(ETIQUETAS_CRITERIOS).map(([id, e]) => `- ${id}: ${e}`).join('\n')}

Basa tu valoración ÚNICAMENTE en los datos proporcionados; si falta información, dilo en el detalle en lugar de inventarla.

PERSONA:
${JSON.stringify(perfil)}

ANIMALES:
${JSON.stringify(datos)}

Responde ÚNICAMENTE con un array JSON, con un objeto por animal y este formato exacto:
[{"animalId": "<id>", "puntuacion": <0-100>, "criterios": [{"id": "<id del criterio>", "valor": <0-1>, "detalle": "<frase>"}]}]`;
}

function extraerArray(texto) {
  const inicio = texto.indexOf('[');
  const fin = texto.lastIndexOf(']');
  if (inicio === -1 || fin <= inicio) return null;
  try {
    return JSON.parse(texto.slice(inicio, fin + 1));
  } catch {
    return null;
  }
}

// También la usa scripts/evaluar-matchmaking.js.
export async function puntuarLote(perfil, animales) {
  const texto = await generarTexto(construirPrompt(perfil, animales), {
    temperature: 0.2,
    numPredict: 600 + 300 * animales.length,
    json: true
  });

  const bruto = extraerArray(texto);
  const analizado = bruto && respuestaSchema.safeParse(bruto);
  if (!analizado?.success) {
    const error = new Error('Gemini no devolvió una valoración con el formato esperado');
    error.statusCode = 502;
    throw error;
  }

  const idsValidos = new Set(animales.map((a) => a.id));
  const resultados = new Map();
  for (const r of analizado.data) {
    if (!idsValidos.has(r.animalId)) continue;
    resultados.set(r.animalId, {
      puntuacion: Math.round(r.puntuacion),
      criterios: r.criterios.map((c) => ({
        id: c.id,
        etiqueta: ETIQUETAS_CRITERIOS[c.id],
        valor: c.valor,
        detalle: c.detalle
      })),
      descartado: false
    });
  }
  return resultados;
}

export async function evaluarAnimales(perfil, animales) {
  // Los descartes los deciden siempre las reglas; en modo llm, Gemini solo puntúa el resto
  // y, si falla, se usa la puntuación de las reglas.
  const reglas = new Map(animales.map((a) => [a.id, calcularCompatibilidad(perfil, a)]));
  const candidatos = animales.filter((a) => !reglas.get(a.id).descartado);
  const porId = new Map();

  if (usaLLM() && candidatos.length > 0) {
    const ahora = Date.now();
    const pendientes = [];

    for (const animal of candidatos) {
      const guardado = cache.get(claveCache(perfil, animal));
      if (guardado && guardado.expira > ahora) porId.set(animal.id, guardado.resultado);
      else pendientes.push(animal);
    }

    for (let i = 0; i < pendientes.length; i += TAMANO_LOTE) {
      const lote = pendientes.slice(i, i + TAMANO_LOTE);
      try {
        const resultados = await puntuarLote(perfil, lote);
        for (const animal of lote) {
          const resultado = resultados.get(animal.id);
          if (!resultado) continue;
          const conMarca = conOrigen(resultado, 'llm');
          porId.set(animal.id, conMarca);
          if (cache.size >= CACHE_MAX) cache.delete(cache.keys().next().value);
          cache.set(claveCache(perfil, animal), { resultado: conMarca, expira: ahora + CACHE_TTL_MS });
        }
      } catch (err) {
        console.warn(`[matchmaking] Gemini no disponible (${err.message}); se usa el algoritmo determinista`);
        break;
      }
    }
  }

  return animales.map((animal) => ({
    animal,
    ...(porId.get(animal.id) ?? conOrigen(reglas.get(animal.id), 'determinista'))
  }));
}
