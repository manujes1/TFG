import * as ollama from './ollama.provider.js';
import * as gemini from './gemini.provider.js';

/**
 * Selector del proveedor de IA.
 *
 * Todos los proveedores exponen la misma interfaz:
 *   - generarTexto(prompt, { temperature, numPredict, json })
 *   - comprobar()
 *
 * El activo se elige con IA_PROVIDER (ollama | gemini). Por defecto, Ollama,
 * que no requiere clave ni sale de la máquina.
 */
const PROVIDERS = { ollama, gemini };

function proveedorActivo() {
  const elegido = (process.env.IA_PROVIDER || 'ollama').toLowerCase();
  return PROVIDERS[elegido] ?? ollama;
}

export function generarTexto(prompt, opciones) {
  return proveedorActivo().generarTexto(prompt, opciones);
}

export function comprobarIA() {
  return proveedorActivo().comprobar();
}
