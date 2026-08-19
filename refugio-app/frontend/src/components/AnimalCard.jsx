import { Link } from 'react-router-dom';
import EstadoBadge from './EstadoBadge.jsx';
import {
  ESPECIES,
  SEXOS,
  ESTADOS_ANIMAL,
  ESTADO_ANIMAL_COLORES,
  fotoUrl
} from '../utils/constants.js';

export default function AnimalCard({ animal }) {
  const foto = animal.fotos?.[0] ? fotoUrl(animal.fotos[0]) : null;

  return (
    <Link
      to={`/animales/${animal.id}`}
      className="card card-hover group overflow-hidden flex flex-col"
    >
      <div className="aspect-[4/3] bg-gradient-to-br from-refugio-100 to-refugio-50 flex items-center justify-center overflow-hidden">
        {foto ? (
          <img
            src={foto}
            alt={animal.nombre}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <span className="text-5xl" aria-hidden="true">
            {animal.especie === 'GATO' ? '🐱' : animal.especie === 'PERRO' ? '🐶' : '🐾'}
          </span>
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-stone-900 group-hover:text-refugio-700 transition-colors">
            {animal.nombre}
          </h3>
          <EstadoBadge
            estado={animal.estado}
            etiquetas={ESTADOS_ANIMAL}
            colores={ESTADO_ANIMAL_COLORES}
          />
        </div>

        <p className="text-sm text-stone-500">
          {ESPECIES[animal.especie]}
          {animal.raza ? ` · ${animal.raza}` : ''}
          {' · '}
          {SEXOS[animal.sexo]}
          {animal.edadEstimada != null ? ` · ${animal.edadEstimada} años` : ''}
        </p>

        {(animal.descripcion || animal.descripcionManual) && (
          <p className="text-sm text-stone-500 line-clamp-2">
            {animal.descripcion || animal.descripcionManual}
          </p>
        )}
      </div>
    </Link>
  );
}
