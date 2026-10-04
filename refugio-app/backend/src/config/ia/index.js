import * as ollama from './ollama.provider.js';
import * as gemini from './gemini.provider.js';

/**
 * Selector del proveedor de IA, con fallback opcional.
 *
 * Todos los proveedores exponen la misma interfaz:
 *   - generarTexto(prompt, { temperature, numPredict, json })
 *   - comprobar()
 *
 * Configuración:
 *   - IA_PROVIDER: proveedor principal (ollama | gemini). Por defecto, Ollama,
 *     que no requiere clave ni sale de la máquina.
 *   - IA_FALLBACK_PROVIDER: proveedor de respaldo (opcional). Si el principal
 *     falla por indisponibilidad, timeout o respuesta vacía, se reintenta con
 *     este. Vacío o igual al principal = sin fallback.
 */
const PROVIDERS = { ollama, gemini };

// Errores que justifican probar con el proveedor de respaldo: el servicio no
// está disponible (503), tardó demasiado (504) o no devolvió contenido (502).
const ERRORES_CON_FALLBACK = [502, 503, 504];

function proveedor(nombre, porDefecto) {
  return PROVIDERS[(nombre || porDefecto || '').toLowerCase()];
}

function proveedorPrincipal() {
  return proveedor(process.env.IA_PROVIDER, 'ollama') ?? ollama;
}

function proveedorRespaldo() {
  const respaldo = proveedor(process.env.IA_FALLBACK_PROVIDER);
  return respaldo && respaldo !== proveedorPrincipal() ? respaldo : null;
}

export async function generarTexto(prompt, opciones) {
  const principal = proveedorPrincipal();
  const respaldo = proveedorRespaldo();

  try {
    return await principal.generarTexto(prompt, opciones);
  } catch (err) {
    if (!respaldo || !ERRORES_CON_FALLBACK.includes(err.statusCode)) throw err;

    console.warn(
      `[IA] ${principal.nombre} falló (${err.statusCode}: ${err.message}); usando ${respaldo.nombre}`
    );
    return respaldo.generarTexto(prompt, opciones);
  }
}

export async function comprobarIA() {
  const respaldo = proveedorRespaldo();
  const [principal, estadoRespaldo] = await Promise.all([
    proveedorPrincipal().comprobar(),
    respaldo?.comprobar()
  ]);
  return respaldo ? { ...principal, respaldo: estadoRespaldo } : principal;
}
