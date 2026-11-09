import { useState, useEffect } from 'react';
import { TIPOS_EXPEDIENTE } from '../utils/constants.js';

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
    // En edición se envía null para poder vaciar un campo; al crear se omite
    const vacio = esEdicion ? null : undefined;
    payload.veterinario = form.veterinario.trim() || vacio;
    payload.proximaRevision = form.proximaRevision || vacio;

    onGuardar(payload);
  }

  const inputClass = 'field-input';
  const labelClass = 'field-label';

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-refugio-50 border border-refugio-200 rounded-xl p-4 space-y-4 shadow-soft"
    >
      <h3 className="text-sm font-semibold text-refugio-700 uppercase tracking-wide">
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
        <button type="submit" disabled={cargando} className="btn-primary text-sm px-4 py-2">
          {cargando ? 'Guardando…' : esEdicion ? 'Guardar cambios' : 'Añadir expediente'}
        </button>
        <button type="button" onClick={onCancelar} className="btn-ghost text-sm px-4 py-2">
          Cancelar
        </button>
      </div>
    </form>
  );
}

function hoy() {
  return new Date().toISOString().slice(0, 10);
}

function aInputDate(valor) {
  if (!valor) return '';
  const d = new Date(valor);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}
