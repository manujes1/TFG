/**
 * Etiqueta de color para representar un estado.
 * Genérico: sirve para estados de animal y de adopción pasándole
 * el diccionario de etiquetas y el de colores.
 */
export default function EstadoBadge({ estado, etiquetas, colores }) {
  const texto = etiquetas[estado] ?? estado;
  const color = colores[estado] ?? 'bg-stone-100 text-stone-700';

  return (
    <span
      className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ring-1 ring-inset ring-black/5 ${color}`}
    >
      {texto}
    </span>
  );
}
