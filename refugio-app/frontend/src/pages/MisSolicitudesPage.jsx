import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchMisAdopciones } from '../api/adopciones.js';
import {
  fetchMisApadrinamientos,
  cancelarApadrinamiento
} from '../api/apadrinamientos.js';
import { fetchMisDonaciones } from '../api/donaciones.js';
import { useAuth } from '../context/AuthContext.jsx';
import Tabs from '../components/Tabs.jsx';
import EstadoBadge from '../components/EstadoBadge.jsx';
import {
  ESPECIES,
  ESTADOS_ADOPCION,
  ESTADO_ADOPCION_COLORES,
  fotoUrl
} from '../utils/constants.js';
import { formatFecha, formatEuros } from '../utils/format.js';

export default function MisSolicitudesPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState('adopciones');

  const adopciones = useQuery({
    queryKey: ['misAdopciones'],
    queryFn: fetchMisAdopciones
  });

  const apadrinamientos = useQuery({
    queryKey: ['misApadrinamientos'],
    queryFn: fetchMisApadrinamientos
  });

  const donaciones = useQuery({
    queryKey: ['misDonaciones'],
    queryFn: fetchMisDonaciones
  });

  const tabs = [
    { id: 'adopciones', label: 'Adopciones', count: adopciones.data?.length },
    { id: 'apadrinamientos', label: 'Apadrinamientos', count: apadrinamientos.data?.length },
    { id: 'donaciones', label: 'Donaciones', count: donaciones.data?.length }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Mi área</h1>
        <p className="page-subtitle">
          Hola {user.nombre}, aquí tienes el seguimiento de tu actividad con el refugio.
        </p>
      </div>

      <div className="card overflow-hidden">
        <Tabs tabs={tabs} activa={tab} onChange={setTab} />

        <div className="p-6">
          {tab === 'adopciones' && <PanelAdopciones query={adopciones} />}
          {tab === 'apadrinamientos' && <PanelApadrinamientos query={apadrinamientos} />}
          {tab === 'donaciones' && <PanelDonaciones query={donaciones} />}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Adopciones                                                          */
/* ------------------------------------------------------------------ */

function PanelAdopciones({ query }) {
  if (query.isPending) return <Cargando />;
  if (query.isError) return <ErrorCarga mensaje={query.error.message} />;

  if (query.data.length === 0) {
    return (
      <Vacio
        texto="Todavía no has solicitado ninguna adopción."
        accion={{ to: '/animales', label: 'Ver animales disponibles' }}
      />
    );
  }

  return (
    <ul className="space-y-3">
      {query.data.map((adopcion) => (
        <li
          key={adopcion.id}
          className="border border-stone-200 rounded-xl p-4 flex gap-4 items-start transition-colors hover:border-refugio-200 hover:bg-refugio-50/30"
        >
          <MiniaturaAnimal animal={adopcion.animal} />

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
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

            <p className="text-xs text-stone-500">
              {ESPECIES[adopcion.animal.especie]} · Solicitada el{' '}
              {formatFecha(adopcion.fechaSolicitud)}
            </p>

            {adopcion.notas && (
              <p className="text-sm text-stone-600 mt-2">{adopcion.notas}</p>
            )}

            {adopcion.motivoRechazo && (
              <div className="mt-2 text-sm bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2">
                <span className="font-medium">Motivo del rechazo:</span>{' '}
                {adopcion.motivoRechazo}
              </div>
            )}

            {adopcion.estado === 'COMPLETADA' && (
              <p className="text-sm text-refugio-700 mt-2 font-medium">
                🎉 Adopción completada el {formatFecha(adopcion.fechaCompletada)}
              </p>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

/* ------------------------------------------------------------------ */
/* Apadrinamientos                                                     */
/* ------------------------------------------------------------------ */

const ESTADOS_APADRINAMIENTO = {
  ACTIVO: 'Activo',
  CANCELADO: 'Cancelado',
  FINALIZADO: 'Finalizado'
};

const ESTADO_APADRINAMIENTO_COLORES = {
  ACTIVO: 'bg-green-100 text-green-800',
  CANCELADO: 'bg-stone-100 text-stone-700',
  FINALIZADO: 'bg-blue-100 text-blue-800'
};

function PanelApadrinamientos({ query }) {
  const queryClient = useQueryClient();
  const [error, setError] = useState(null);

  const cancelMutation = useMutation({
    mutationFn: cancelarApadrinamiento,
    onSuccess: () => {
      setError(null);
      queryClient.invalidateQueries({ queryKey: ['misApadrinamientos'] });
    },
    onError: (err) => {
      setError(err.response?.data?.error || 'No se pudo cancelar el apadrinamiento');
    }
  });

  if (query.isPending) return <Cargando />;
  if (query.isError) return <ErrorCarga mensaje={query.error.message} />;

  if (query.data.length === 0) {
    return (
      <Vacio
        texto="Todavía no apadrinas a ningún animal."
        accion={{ to: '/animales', label: 'Conocer a los animales' }}
      />
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      <ul className="space-y-3">
        {query.data.map((apad) => (
          <li
            key={apad.id}
            className="border border-stone-200 rounded-xl p-4 flex gap-4 items-start transition-colors hover:border-refugio-200 hover:bg-refugio-50/30"
          >
            <MiniaturaAnimal animal={apad.animal} />

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <Link
                  to={`/animales/${apad.animal.id}`}
                  className="font-semibold text-stone-900 hover:text-refugio-700 transition-colors"
                >
                  {apad.animal.nombre}
                </Link>
                <EstadoBadge
                  estado={apad.estado}
                  etiquetas={ESTADOS_APADRINAMIENTO}
                  colores={ESTADO_APADRINAMIENTO_COLORES}
                />
              </div>

              <p className="text-sm text-stone-700">
                {formatEuros(apad.cantidad)}
                {apad.tipo === 'MENSUAL' ? ' al mes' : ' (aportación puntual)'}
              </p>
              <p className="text-xs text-stone-500 mt-1">
                Desde el {formatFecha(apad.fechaInicio)}
                {apad.fechaFin && ` · Finalizado el ${formatFecha(apad.fechaFin)}`}
              </p>
            </div>

            {apad.estado === 'ACTIVO' && (
              <button
                onClick={() => cancelMutation.mutate(apad.id)}
                disabled={cancelMutation.isPending}
                className="text-sm text-stone-600 hover:text-red-700 hover:bg-red-50 rounded-lg px-3 py-2 transition-colors shrink-0"
              >
                Cancelar
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Donaciones                                                          */
/* ------------------------------------------------------------------ */

function PanelDonaciones({ query }) {
  if (query.isPending) return <Cargando />;
  if (query.isError) return <ErrorCarga mensaje={query.error.message} />;

  if (query.data.length === 0) {
    return <Vacio texto="Todavía no has registrado ninguna donación." />;
  }

  const total = query.data.reduce((suma, d) => suma + parseFloat(d.cantidad), 0);

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-refugio-500 to-refugio-600 rounded-xl px-4 py-3 shadow-soft">
        <p className="text-sm text-white">
          Has aportado un total de{' '}
          <span className="font-bold">{formatEuros(total)}</span> al refugio. ¡Gracias!
        </p>
      </div>

      <ul className="divide-y divide-stone-100">
        {query.data.map((donacion) => (
          <li key={donacion.id} className="py-3 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm font-medium text-stone-900">
                {donacion.concepto || 'Donación'}
              </p>
              <p className="text-xs text-stone-500">
                {formatFecha(donacion.fecha)}
                {donacion.metodoPago && ` · ${donacion.metodoPago}`}
              </p>
            </div>
            <span className="font-semibold text-refugio-700 shrink-0">
              {formatEuros(donacion.cantidad)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Componentes auxiliares                                              */
/* ------------------------------------------------------------------ */

function MiniaturaAnimal({ animal }) {
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

function Cargando() {
  return <p className="text-center text-stone-500 py-8">Cargando…</p>;
}

function ErrorCarga({ mensaje }) {
  return (
    <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">
      No se pudieron cargar los datos: {mensaje}
    </div>
  );
}

function Vacio({ texto, accion }) {
  return (
    <div className="text-center py-10">
      <p className="text-stone-500 mb-4">{texto}</p>
      {accion && (
        <Link to={accion.to} className="btn-primary inline-flex text-sm px-5 py-2.5">
          {accion.label}
        </Link>
      )}
    </div>
  );
}
