import { fotoUrl } from '../utils/constants.js';

/**
 * Foto pequeña y cuadrada de un animal (o un emoji si no tiene foto).
 */
export default function MiniaturaAnimal({ animal }) {
  const foto = animal?.fotos?.[0] ? fotoUrl(animal.fotos[0]) : null;
  const emoji = animal?.especie === 'GATO' ? '🐱' : animal?.especie === 'PERRO' ? '🐶' : '🐾';

  return (
    <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-refugio-100 to-refugio-50 shrink-0 overflow-hidden flex items-center justify-center ring-1 ring-stone-200/60">
      {foto ? (
        <img src={foto} alt="" className="w-full h-full object-cover" />
      ) : (
        <span className="text-2xl" aria-hidden="true">{emoji}</span>
      )}
    </div>
  );
}
