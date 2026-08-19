import { useState, useEffect } from 'react';
import { TIPOS_EXPEDIENTE } from '../utils/constants.js';

/**
 * Formulario de alta y edición de expedientes médicos.
 * Se usa en modo inline dentro de la página de gestión.
 *
 * @param {object|null} expediente - Si viene, el formulario edita; si no, crea.
 * @param {(data: object) => void} onGuardar
 * @param {() => void} onCancelar
 * @param {boolean} cargando
 */
export default function ExpedienteForm({ expediente, onGuardar, onCancelar, cargando }) {
  const esEdicion = Boolean(expediente);

  const [form, setForm] = useState({
    tipo: 'REVISION',
    descripcion: '',
    veterinario: '',
    fecha: hoy(),
    proximaRevision: ''
  });

  useEffect(() => {
    if (!expediente) return;
    setForm({
      tipo: expediente.tipo,
      descripcion: expediente.descripcion ?? '',
      veterinario: expediente.veterinario ?? '',
      fecha: aInputDate(expediente.fecha),
      proximaRevision: aInputDate(expediente.proximaRevision)
    });
  }, [expediente]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();

    const payload = {
      tipo: form.tipo,
      descripcion: form.descripcion.trim(),
      fecha: form.fecha
    };
    if (form.veterinario.trim()) payload.veterinario = form.veterinario.trim();
    if (form.proximaRevision) payload.proximaRevision = form.proximaRevision;

    onGuardar(payload);
  }

  const inputClass =
    'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-refugio-500';
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1';

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-refugio-50 border border-refugio-100 rounded-xl p-4 space-y-4"
    >
      <h3 className="text-sm font-semibold text-refugio-700">
        {esEdicion ? 'Editar expediente' : 'Nuevo expediente médico'}
      </h3>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="tipo" className={labelClass}>Tipo *</label>
          <select
            id="tipo"
            name="tipo"
            value={form.tipo}
            onChange={handleChange}
            className={inputClass}
          >
            {Object.entries(TIPOS_EXPEDIENTE).map(([valor, { etiqueta }]) => (
              <option key={valor} value={valor}>{etiqueta}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="veterinario" className={labelClass}>Veterinario</label>
          <input
            id="veterinario"
            name="veterinario"
            value={form.veterinario}
            onChange={handleChange}
            maxLength={100}
            placeholder="Dra. López"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="fecha" className={labelClass}>Fecha *</label>
          <input
            id="fecha"
            name="fecha"
            type="date"
            value={form.fecha}
            onChange={handleChange}
            required
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="proximaRevision" className={labelClass}>
            Próxima revisión
          </label>
          <input
            id="proximaRevision"
            name="proximaRevision"
            type="date"
            value={form.proximaRevision}
            onChange={handleChange}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor="descripcion" className={labelClass}>Descripción *</label>
        <textarea
          id="descripcion"
          name="descripcion"
          rows={3}
          value={form.descripcion}
          onChange={handleChange}
          required
          maxLength={2000}
          placeholder="Vacuna polivalente anual. Sin reacción adversa."
          className={inputClass}
        />
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={cargando}
          className="text-sm bg-refugio-600 hover:bg-refugio-700 disabled:opacity-50 text-white font-medium rounded-lg px-4 py-2 transition"
        >
          {cargando ? 'Guardando…' : esEdicion ? 'Guardar cambios' : 'Añadir expediente'}
        </button>
        <button
          type="button"
          onClick={onCancelar}
          className="text-sm text-gray-600 hover:bg-papel rounded-lg px-4 py-2 transition"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

/* Utilidades de fecha para los inputs type="date" (formato YYYY-MM-DD) */

function hoy() {
  return new Date().toISOString().slice(0, 10);
}

function aInputDate(valor) {
  if (!valor) return '';
  const d = new Date(valor);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}
