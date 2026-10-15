/**
 * Evaluación offline del emparejamiento adoptante-animal.
 *
 * Compara la puntuación del algoritmo determinista (`calcularCompatibilidad`)
 * con la que asigna un LLM (Gemini u Ollama) a los mismos pares, para
 * justificar con datos la decisión de diseño de la memoria.
 *
 * No toca la base de datos ni la aplicación.
 *
 * Uso:
 *   node scripts/evaluar-matchmaking.js --provider gemini --repeticiones 3 --pares 30
 *
 * Opciones:
 *   --provider      gemini | ollama            (por defecto: IA_PROVIDER o ollama)
 *   --repeticiones  llamadas por par           (por defecto 3)
 *   --pares         nº de pares a evaluar      (por defecto 30, selección reproducible)
 *   --pausa         ms entre llamadas          (por defecto 1000, para respetar cuotas)
 *   --salida        carpeta de resultados      (por defecto scripts/resultados)
 */
import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, arr) => {
    if (a.startsWith('--')) acc.push([a.slice(2), arr[i + 1]]);
    return acc;
  }, [])
);

if (args.provider) process.env.IA_PROVIDER = args.provider;
// La evaluación mide un único proveedor: el fallback falsearía los resultados
process.env.IA_FALLBACK_PROVIDER = '';
const PROVEEDOR = process.env.IA_PROVIDER || 'ollama';
const REPETICIONES = Number(args.repeticiones) || 3;
const N_PARES = Number(args.pares) || 30;
const PAUSA_MS = args.pausa !== undefined ? Number(args.pausa) : 1000;

const aqui = path.dirname(fileURLToPath(import.meta.url));
const SALIDA = path.resolve(args.salida || path.join(aqui, 'resultados'));

// Import dinámico: el proveedor se lee de process.env al cargar el módulo.
const { generarTexto } = await import('../shared/ia/index.js');
const { calcularCompatibilidad } = await import('../src/utils/compatibilidad.js');

const animales = JSON.parse(fs.readFileSync(path.join(aqui, 'datos/animales.json'), 'utf8'));
const perfiles = JSON.parse(fs.readFileSync(path.join(aqui, 'datos/perfiles.json'), 'utf8'));

/* ------------------------------------------------------------------ */
/* Utilidades estadísticas                                             */
/* ------------------------------------------------------------------ */

const media = (xs) => xs.reduce((a, b) => a + b, 0) / xs.length;
const desviacion = (xs) =>
  xs.length < 2 ? 0 : Math.sqrt(media(xs.map((x) => (x - media(xs)) ** 2)));

function rangos(xs) {
  const orden = xs.map((v, i) => [v, i]).sort((a, b) => a[0] - b[0]);
  const r = new Array(xs.length);
  for (let i = 0; i < orden.length; ) {
    let j = i;
    while (j + 1 < orden.length && orden[j + 1][0] === orden[i][0]) j++;
    const rango = (i + j) / 2 + 1; // rango medio para empates
    for (let k = i; k <= j; k++) r[orden[k][1]] = rango;
    i = j + 1;
  }
  return r;
}

function pearson(x, y) {
  const mx = media(x);
  const my = media(y);
  let num = 0, dx = 0, dy = 0;
  for (let i = 0; i < x.length; i++) {
    num += (x[i] - mx) * (y[i] - my);
    dx += (x[i] - mx) ** 2;
    dy += (y[i] - my) ** 2;
  }
  return dx && dy ? num / Math.sqrt(dx * dy) : NaN;
}

const spearman = (x, y) => pearson(rangos(x), rangos(y));

/* ------------------------------------------------------------------ */
/* Selección reproducible de pares                                     */
/* ------------------------------------------------------------------ */

// Generador pseudoaleatorio con semilla fija: mismos pares en cada ejecución.
function mulberry32(seed) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seleccionarPares(n) {
  const todos = perfiles.flatMap((p) => animales.map((a) => ({ perfil: p, animal: a })));
  const rnd = mulberry32(42);
  return todos
    .map((par) => ({ par, k: rnd() }))
    .sort((a, b) => a.k - b.k)
    .slice(0, Math.min(n, todos.length))
    .map((x) => x.par);
}

/* ------------------------------------------------------------------ */
/* Puntuación con LLM                                                  */
/* ------------------------------------------------------------------ */

function promptPuntuacion(perfil, animal) {
  const { id: _p, ...p } = perfil;
  const { id: _a, ...a } = animal;
  return `Eres un asesor de adopciones de un refugio de animales.

Valora de 0 a 100 la compatibilidad entre esta persona interesada y este animal.
0 significa incompatible y 100 encaja perfectamente.

PERSONA:
${JSON.stringify(p, null, 2)}

ANIMAL:
${JSON.stringify(a, null, 2)}

Responde ÚNICAMENTE con un objeto JSON con esta forma exacta:
{"puntuacion": <entero de 0 a 100>, "motivo": "<una frase>"}`;
}

function extraerPuntuacion(texto) {
  const inicio = texto.indexOf('{');
  if (inicio === -1) return null;
  const fin = texto.lastIndexOf('}');
  try {
    const obj = JSON.parse(fin > inicio ? texto.slice(inicio, fin + 1) : `${texto.slice(inicio)}}`);
    const n = Number(obj.puntuacion);
    return Number.isFinite(n) && n >= 0 && n <= 100 ? n : null;
  } catch {
    return null;
  }
}

const dormir = (ms) => new Promise((r) => setTimeout(r, ms));

async function llamarConReintento(prompt) {
  for (let intento = 0; intento < 4; intento++) {
    try {
      return await generarTexto(prompt, { temperature: 0.2, numPredict: 150, json: true });
    } catch (err) {
      // 503 incluye la cuota agotada (429): esperamos y reintentamos
      if (err.statusCode === 503 && intento < 3) {
        await dormir(5000 * (intento + 1));
        continue;
      }
      throw err;
    }
  }
}

/* ------------------------------------------------------------------ */
/* Ejecución                                                           */
/* ------------------------------------------------------------------ */

const pares = seleccionarPares(N_PARES);
console.log(
  `Proveedor: ${PROVEEDOR} | pares: ${pares.length} | repeticiones: ${REPETICIONES}`
);

const filas = [];
let invalidas = 0;
let llamadas = 0;

for (const [i, { perfil, animal }] of pares.entries()) {
  const det = calcularCompatibilidad(perfil, animal);
  const muestras = [];
  const latencias = [];

  for (let r = 0; r < REPETICIONES; r++) {
    const t0 = performance.now();
    llamadas++;
    try {
      const texto = await llamarConReintento(promptPuntuacion(perfil, animal));
      latencias.push(performance.now() - t0);
      const n = extraerPuntuacion(texto);
      if (n === null) invalidas++;
      else muestras.push(n);
    } catch (err) {
      invalidas++;
      console.warn(`  [${i + 1}] ${perfil.id}/${animal.id}: ${err.message}`);
    }
    if (PAUSA_MS) await dormir(PAUSA_MS);
  }

  filas.push({
    perfil: perfil.id,
    animal: animal.id,
    descartado: det.descartado,
    determinista: det.puntuacion,
    llm_media: muestras.length ? media(muestras) : null,
    llm_desv: muestras.length ? desviacion(muestras) : null,
    llm_validas: muestras.length,
    latencia_ms: latencias.length ? Math.round(media(latencias)) : null
  });
  console.log(
    `[${i + 1}/${pares.length}] ${perfil.id}/${animal.id} det=${det.puntuacion}${
      det.descartado ? ' (descartado)' : ''
    } llm=${filas.at(-1).llm_media?.toFixed(1) ?? 'n/d'}`
  );
}

/* ------------------------------------------------------------------ */
/* Métricas y resultados                                               */
/* ------------------------------------------------------------------ */

const validas = filas.filter((f) => f.llm_media !== null);
const noDescartadas = validas.filter((f) => !f.descartado);
const descartadas = validas.filter((f) => f.descartado);

const rho = noDescartadas.length >= 3
  ? spearman(noDescartadas.map((f) => f.determinista), noDescartadas.map((f) => f.llm_media))
  : NaN;
const mae = noDescartadas.length
  ? media(noDescartadas.map((f) => Math.abs(f.determinista - f.llm_media)))
  : NaN;
// Un descarte duro del algoritmo debería recibir una puntuación baja del LLM
const acuerdoDescartes = descartadas.length
  ? descartadas.filter((f) => f.llm_media <= 30).length / descartadas.length
  : NaN;
const consistencia = media(validas.map((f) => f.llm_desv));
const latencia = media(filas.filter((f) => f.latencia_ms !== null).map((f) => f.latencia_ms));
const fmt = (x, d = 2) => (Number.isFinite(x) ? x.toFixed(d) : 'n/d');

fs.mkdirSync(SALIDA, { recursive: true });
const base = `${PROVEEDOR}-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}`;

const cabecera = Object.keys(filas[0]).join(',');
const csv = [cabecera, ...filas.map((f) => Object.values(f).map((v) => v ?? '').join(','))].join('\n');
fs.writeFileSync(path.join(SALIDA, `${base}.csv`), csv);

const resumen = `# Evaluación del emparejamiento: algoritmo determinista vs ${PROVEEDOR}

- Pares evaluados: ${pares.length} (${descartadas.length + filas.filter((f) => f.descartado && f.llm_media === null).length} con descarte duro)
- Repeticiones por par: ${REPETICIONES}
- Llamadas totales: ${llamadas} (inválidas o fallidas: ${invalidas}, ${fmt((invalidas / llamadas) * 100, 1)} %)

| Métrica | Valor |
|---|---|
| Correlación de Spearman (determinista vs LLM, pares sin descarte) | ${fmt(rho)} |
| Error absoluto medio (puntos sobre 100) | ${fmt(mae, 1)} |
| Acuerdo en descartes (LLM ≤ 30 donde el algoritmo descarta) | ${Number.isFinite(acuerdoDescartes) ? fmt(acuerdoDescartes * 100, 0) + ' %' : 'n/d'} |
| Desviación típica media entre repeticiones (consistencia) | ${fmt(consistencia, 1)} |
| Latencia media por llamada | ${fmt(latencia, 0)} ms |

El algoritmo determinista devuelve siempre la misma puntuación (desviación 0) y no requiere llamadas externas.
`;
fs.writeFileSync(path.join(SALIDA, `${base}.md`), resumen);

console.log(`\n${resumen}\nResultados en ${SALIDA}`);
