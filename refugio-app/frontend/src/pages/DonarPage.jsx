import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createDonacion } from '../api/donaciones.js';
import { formatEuros } from '../utils/format.js';

const IMPORTES = [5, 10, 25, 50];
const METODOS = ['Tarjeta', 'Bizum', 'Transferencia'];

export default function DonarPage() {
  const queryClient = useQueryClient();
  const [cantidad, setCantidad] = useState('10');
  const [concepto, setConcepto] = useState('');
  const [metodoPago, setMetodoPago] = useState(METODOS[0]);
  const [error, setError] = useState(null);
  const [donada, setDonada] = useState(null);

  const mutation = useMutation({
    mutationFn: createDonacion,
    onSuccess: (data) => {
      setError(null);
      setDonada(data);
      queryClient.invalidateQueries({ queryKey: ['misDonaciones'] });
    },
    onError: (err) => {
      const detalles = err.response?.data?.details;
      setError(
        detalles?.length
          ? detalles.map((d) => `${d.field}: ${d.message}`).join('. ')
          : err.response?.data?.error || 'No se pudo registrar la donación'
      );
    }
  });

  function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    const payload = { cantidad: Number(cantidad), metodoPago };
    if (concepto.trim()) payload.concepto = concepto.trim();
    mutation.mutate(payload);
  }

  if (donada) {
    return (
      <div className="max-w-xl mx-auto card p-6 text-center space-y-4">
        <h1 className="page-title">¡Gracias por tu donación!</h1>
        <p className="text-stone-600">
          Hemos registrado tu aportación de{' '}
          <span className="font-bold">{formatEuros(donada.cantidad)}</span>.
        </p>
        <div className="flex justify-center gap-2">
          <Link to="/mis-solicitudes" className="btn-primary">
            Ver mis donaciones
          </Link>
          <button className="btn-ghost" onClick={() => setDonada(null)}>
            Donar de nuevo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-4">
      <div>
        <h1 className="page-title">Donar al refugio</h1>
        <p className="page-subtitle">
          Tu aportación ayuda a cubrir alimentación, cuidados veterinarios y
          mantenimiento de los animales.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-5">
        <div>
          <span className="field-label">Importe</span>
          <div className="flex flex-wrap gap-2 mb-3">
            {IMPORTES.map((i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCantidad(String(i))}
                className={Number(cantidad) === i ? 'btn-primary' : 'btn-ghost'}
              >
                {i} €
              </button>
            ))}
          </div>
          <input
            type="number"
            min="1"
            max="100000"
            step="0.01"
            required
            value={cantidad}
            onChange={(e) => setCantidad(e.target.value)}
            className="field-input"
            aria-label="Importe en euros"
          />
        </div>

        <div>
          <label htmlFor="metodoPago" className="field-label">
            Método de pago
          </label>
          <select
            id="metodoPago"
            value={metodoPago}
            onChange={(e) => setMetodoPago(e.target.value)}
            className="field-input"
          >
            {METODOS.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="concepto" className="field-label">
            Mensaje (opcional)
          </label>
          <input
            id="concepto"
            type="text"
            maxLength={200}
            value={concepto}
            onChange={(e) => setConcepto(e.target.value)}
            className="field-input"
            placeholder="Para la comida de los gatos…"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={mutation.isPending || !(Number(cantidad) > 0)}
          className="btn-primary w-full"
        >
          {mutation.isPending ? 'Procesando…' : 'Donar'}
        </button>
      </form>
    </div>
  );
}
