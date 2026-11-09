import * as ollama from './ollama.provider.js';
import * as gemini from './gemini.provider.js';

// Proveedor principal: IA_PROVIDER (ollama por defecto). Si se define
// IA_FALLBACK_PROVIDER, se reintenta con él cuando el principal falla.
const PROVIDERS = { ollama, gemini };

// 502: respuesta vacía, 503: no disponible, 504: timeout
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
