/**
 * Etiqueta de color para representar un estado.
 * Genérico: sirve para estados de animal y de adopción pasándole
 * el diccionario de etiquetas y el de colores.
 */
export default function EstadoBadge({ estado, etiquetas, colores }) {
  const texto = etiquetas[estado] ?? estado;
  const color = colores[estado] ?? 'bg-gray-100 text-gray-700';

  return (
    <span className={`inline-block text-xs font-medium px-2 py-1 rounded-full ${color}`}>
      {texto}
    </span>
  );
}
