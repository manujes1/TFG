import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchMisAdopciones } from '../api/adopciones.js';
import { fetchMisApadrinamientos } from '../api/apadrinamientos.js';
import { fetchMisDonaciones } from '../api/donaciones.js';
import { fetchRecomendaciones } from '../api/recomendaciones.js';
import { useAuth } from '../context/AuthContext.jsx';
import EstadoBadge from './EstadoBadge.jsx';
import MiniaturaAnimal from './MiniaturaAnimal.jsx';
import { CompatibilidadBadge } from './Compatibilidad.jsx';
import {
  ESPECIES,
  ESTADOS_ADOPCION,
  ESTADO_ADOPCION_COLORES,
  fotoUrl
} from '../utils/constants.js';
import { formatFecha, formatEuros } from '../utils/format.js';

const ESTADOS_EN_CURSO = ['SOLICITADA', 'EN_REVISION', 'APROBADA'];

// Qué le espera al adoptante en cada estado de su solicitud
const SIGUIENTE_PASO = {
  SOLICITADA: 'El refugio revisará tu solicitud pronto.',
  EN_REVISION: 'El equipo está valorando tu solicitud.',
  APROBADA: '¡Aprobada! El refugio se pondrá en contacto contigo para la entrega.'
};

export default function ResumenUsuario() {
  const { user, tienePerfil } = useAuth();

  const adopciones = useQuery({ queryKey: ['misAdopciones'], queryFn: fetchMisAdopciones });
  const apadrinamientos = useQuery({
    queryKey: ['misApadrinamientos'],
    queryFn: fetchMisApadrinamientos
  });
  const donaciones = useQuery({ queryKey: ['misDonaciones'], queryFn: fetchMisDonaciones });

  const enCurso = (adopciones.data ?? []).filter((a) => ESTADOS_EN_CURSO.includes(a.estado));
  const completadas = (adopciones.data ?? []).filter((a) => a.estado === 'COMPLETADA');
  const apadrinamientosActivos = (apadrinamientos.data ?? []).filter((a) => a.estado === 'ACTIVO');
  const aporteMensual = apadrinamientosActivos
    .filter((a) => a.tipo === 'MENSUAL')
    .reduce((suma, a) => suma + Number(a.cantidad), 0);
  const totalDonado = (donaciones.data ?? []).reduce((suma, d) => suma + Number(d.cantidad), 0);

  return (
    <div className="space-y-8">
      <section className="rounded-2xl bg-gradient-to-br from-refugio-600 via-refugio-700 to-refugio-800 p-6 sm:p-8 shadow-elevated">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Hola, {user.nombre} 👋
        </h1>
        <p className="text-refugio-50 mt-1">{fraseBienvenida(enCurso, completadas, apadrinamientosActivos, tienePerfil)}</p>
      </section>

      {/* Resumen en cifras */}
      <section className="grid gap-4 sm:grid-cols-3">
        <TarjetaResumen
          icono="🏡"
          titulo="Adopciones"
          cargando={adopciones.isPending}
          valor={enCurso.length}
          detalle={
            enCurso.length === 1 ? 'solicitud en curso' : 'solicitudes en curso'
          }
          extra={completadas.length > 0 ? `${completadas.length} completada${completadas.length > 1 ? 's' : ''}` : null}
        />
        <TarjetaResumen
          icono="💛"
          titulo="Apadrinamientos"
          cargando={apadrinamientos.isPending}
          valor={apadrinamientosActivos.length}
          detalle={apadrinamientosActivos.length === 1 ? 'animal apadrinado' : 'animales apadrinados'}
          extra={aporteMensual > 0 ? `${formatEuros(aporteMensual)} al mes` : null}
        />
        <TarjetaResumen
          icono="🎁"
          titulo="Donaciones"
          cargando={donaciones.isPending}
          valor={formatEuros(totalDonado)}
          detalle="donados en total"
          extra={
            donaciones.data?.length
              ? `${donaciones.data.length} donación${donaciones.data.length > 1 ? 'es' : ''}`
              : null
          }
        />
      </section>

      {/* Solicitudes en curso */}
      <section className="card p-6 space-y-4">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="font-semibold text-stone-800">Tus solicitudes en curso</h2>
          <Link to="/mis-solicitudes" className="text-sm text-refugio-600 hover:underline font-medium">
            Ver todo
          </Link>
        </div>

        {adopciones.isPending ? (
          <p className="text-sm text-stone-500">Cargando…</p>
        ) : enCurso.length === 0 ? (
          <p className="text-sm text-stone-600">
            No tienes ninguna solicitud de adopción abierta.{' '}
            <Link to="/animales" className="text-refugio-600 hover:underline font-medium">
              Conoce a los animales que buscan hogar
            </Link>
            .
          </p>
        ) : (
          <ul className="space-y-3">
            {enCurso.map((adopcion) => (
              <li key={adopcion.id} className="flex gap-4 items-center">
                <MiniaturaAnimal animal={adopcion.animal} />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      to={`/animales/${adopcion.animal.id}`}
                      className="font-semibold text-stone-900 hover:text-refugio-700 transition-colors"
                    >
                      {adopcion.animal.nombre}
                    </Link>
                    <EstadoBadge
                      estado={adopcion.estado}
                      etiquetas={ESTADOS_ADOPCION}
                      colores={ESTADO_ADOPCION_COLORES}
                    />
                  </div>
                  <p className="text-sm text-stone-600">{SIGUIENTE_PASO[adopcion.estado]}</p>
                  <p className="text-xs text-stone-400">
                    {ESPECIES[adopcion.animal.especie]} · Solicitada el {formatFecha(adopcion.fechaSolicitud)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Recomendaciones */}
      {tienePerfil ? (
        <Recomendaciones />
      ) : (
        <section className="bg-refugio-50 border border-refugio-200 rounded-xl p-6">
          <h2 className="font-semibold text-refugio-700 mb-1">¿Qué animal encaja contigo?</h2>
          <p className="text-sm text-stone-600 mb-3">
            Cuéntanos cómo es tu hogar y tu día a día, y te recomendaremos los animales más
            compatibles contigo.
          </p>
          <Link to="/perfil" className="btn-primary inline-flex text-sm px-4 py-2">
            Completar mi perfil
          </Link>
        </section>
      )}
    </div>
  );
}

function fraseBienvenida(enCurso, completadas, apadrinados, tienePerfil) {
  if (enCurso.some((a) => a.estado === 'APROBADA')) {
    return 'Tienes una adopción aprobada: muy pronto tendrás un nuevo compañero en casa.';
  }
  if (enCurso.length > 0) return 'Te contamos cómo van tus solicitudes.';
  if (completadas.length > 0 || apadrinados.length > 0) {
    return 'Gracias por formar parte de la familia del refugio.';
  }
  if (!tienePerfil) {
    return 'Te damos la bienvenida al refugio. Completa tu perfil y te diremos qué animales encajan contigo.';
  }
  return 'Estos son los animales que podrían encajar contigo.';
}

function TarjetaResumen({ icono, titulo, cargando, valor, detalle, extra }) {
  return (
    <Link to="/mis-solicitudes" className="card card-hover p-5 block">
      <p className="text-sm font-medium text-stone-500">
        <span aria-hidden="true">{icono}</span> {titulo}
      </p>
      <p className="text-3xl font-bold text-stone-900 tracking-tight mt-1">
        {cargando ? '…' : valor}
      </p>
      <p className="text-sm text-stone-600">{detalle}</p>
      {extra && <p className="text-xs text-refugio-700 font-medium mt-1">{extra}</p>}
    </Link>
  );
}

function Recomendaciones() {
  const { data, isPending, isError } = useQuery({
    queryKey: ['recomendaciones', 'inicio'],
    queryFn: () => fetchRecomendaciones({ limite: 3 })
  });

  if (isError) return null;

  return (
    <section className="space-y-4">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-semibold text-stone-800">Animales que encajan contigo</h2>
        <Link to="/recomendaciones" className="text-sm text-refugio-600 hover:underline font-medium">
          Ver todas
        </Link>
      </div>

      {isPending ? (
        <p className="text-sm text-stone-500">Buscando los más compatibles…</p>
      ) : data.recomendaciones.length === 0 ? (
        <p className="text-sm text-stone-600">
          Ahora mismo no hay animales disponibles que encajen con tu perfil.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          {data.recomendaciones.map(({ animal, puntuacion }) => (
            <Link
              key={animal.id}
              to={`/animales/${animal.id}`}
              className="card card-hover group overflow-hidden flex flex-col"
            >
              <div className="aspect-[4/3] bg-gradient-to-br from-refugio-100 to-refugio-50 flex items-center justify-center overflow-hidden">
                {animal.fotos?.[0] ? (
                  <img
                    src={fotoUrl(animal.fotos[0])}
                    alt={animal.nombre}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <span className="text-5xl" aria-hidden="true">
                    {animal.especie === 'GATO' ? '🐱' : '🐶'}
                  </span>
                )}
              </div>
              <div className="p-4 space-y-2">
                <p className="font-semibold text-stone-900">{animal.nombre}</p>
                <CompatibilidadBadge puntuacion={puntuacion} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
