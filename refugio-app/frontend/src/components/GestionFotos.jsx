import { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { uploadFotoAnimal, deleteFotoAnimal } from '../api/animales.js';
import { fotoUrl } from '../utils/constants.js';

const MAX_MB = 5;
const TIPOS_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp'];

export default function GestionFotos({ animalId, fotos }) {
  const queryClient = useQueryClient();
  const inputRef = useRef(null);
  const [error, setError] = useState(null);

  function invalidar() {
    queryClient.invalidateQueries({ queryKey: ['animal', animalId] });
    queryClient.invalidateQueries({ queryKey: ['animales'] });
  }

  const subirMutation = useMutation({
    mutationFn: (file) => uploadFotoAnimal(animalId, file),
    onSuccess: () => {
      setError(null);
      invalidar();
      if (inputRef.current) inputRef.current.value = '';
    },
    onError: (err) => {
      setError(err.response?.data?.error || 'No se pudo subir la foto');
      if (inputRef.current) inputRef.current.value = '';
    }
  });

  const borrarMutation = useMutation({
    mutationFn: (url) => deleteFotoAnimal(animalId, url),
    onSuccess: () => {
      setError(null);
      invalidar();
    },
    onError: (err) => {
      setError(err.response?.data?.error || 'No se pudo eliminar la foto');
    }
  });

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validación en cliente antes de gastar ancho de banda.
    // La validación real la hace el backend; esta es solo para UX.
    if (!TIPOS_PERMITIDOS.includes(file.type)) {
      setError('Formato no permitido. Usa JPEG, PNG o WEBP.');
      e.target.value = '';
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      setError(`La imagen supera los ${MAX_MB} MB.`);
      e.target.value = '';
      return;
    }

    setError(null);
    subirMutation.mutate(file);
  }

  return (
    <section className="card p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-stone-100">
        <h3 className="font-semibold text-stone-800">Fotos</h3>
        <label className="btn-primary text-sm px-4 py-2 cursor-pointer">
          {subirMutation.isPending ? 'Subiendo…' : '+ Añadir foto'}
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            disabled={subirMutation.isPending}
            className="hidden"
          />
        </label>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      {fotos.length === 0 ? (
        <p className="text-sm text-stone-500 py-4">
          Todavía no hay fotos. La primera será la imagen principal en el listado.
        </p>
      ) : (
        <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {fotos.map((foto, i) => (
            <li key={foto} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden bg-stone-100 ring-1 ring-stone-200">
                <img
                  src={fotoUrl(foto)}
                  alt={`Foto ${i + 1}`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              {i === 0 && (
                <span className="absolute top-1.5 left-1.5 text-[10px] font-semibold bg-refugio-600 text-white px-1.5 py-0.5 rounded shadow-sm">
                  Principal
                </span>
              )}

              <button
                onClick={() => borrarMutation.mutate(foto)}
                disabled={borrarMutation.isPending}
                aria-label={`Eliminar foto ${i + 1}`}
                className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 hover:bg-red-600 text-white text-xs flex items-center justify-center transition-all duration-150 opacity-0 group-hover:opacity-100 focus:opacity-100 hover:scale-110"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
