import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAnimalById } from '../../api/animales.js';
import {
  fetchExpedientes,
  createExpediente,
  updateExpediente,
  deleteExpediente
} from '../../api/expedientes.js';
import { useAuth } from '../../context/AuthContext.jsx';
import ExpedienteForm from '../../components/ExpedienteForm.jsx';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';
import { TIPOS_EXPEDIENTE, ESPECIES } from '../../utils/constants.js';
import { formatFecha } from '../../utils/format.js';

export default function ExpedientesAdminPage() {
  const { animalId } = useParams();
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();

  const [formAbierto, setFormAbierto] = useState(false);
  const [editando, setEditando] = useState(null);
  const [aBorrar, setABorrar] = useState(null);
  const [error, setError] = useState(null);

  const animal = useQuery({
    queryKey: ['animal', animalId],
    queryFn: () => fetchAnimalById(animalId)
  });

  const expedientes = useQuery({
    queryKey: ['expedientes', animalId],
    queryFn: () => fetchExpedientes(animalId)
  });

  function invalidar() {
    queryClient.invalidateQueries({ queryKey: ['expedientes', animalId] });
    queryClient.invalidateQueries({ queryKey: ['animal', animalId] });
  }

  function manejarError(err, mensajePorDefecto) {
    const detalles = err.response?.data?.details;
    setError(
      detalles?.length
        ? detalles.map((d) => `${d.field}: ${d.message}`).join('. ')
        : err.response?.data?.error || mensajePorDefecto
    );
  }

  const crearMutation = useMutation({
    mutationFn: (data) => createExpediente(animalId, data),
    onSuccess: () => {
      setError(null);
      setFormAbierto(false);
      invalidar();
    },
    onError: (err) => manejarError(err, 'No se pudo crear el expediente')
  });

  const actualizarMutation = useMutation({
    mutationFn: ({ id, data }) => updateExpediente(animalId, id, data),
    onSuccess: () => {
      setError(null);
      setEditando(null);
      invalidar();
    },
    onError: (err) => manejarError(err, 'No se pudo actualizar el expediente')
  });

  const borrarMutation = useMutation({
    mutationFn: (id) => deleteExpediente(animalId, id),
    onSuccess: () => {
      setError(null);
      setABorrar(null);
      invalidar();
    },
    onError: (err) => {
      setABorrar(null);
      manejarError(err, 'No se pudo eliminar el expediente');
    }
  });

  function abrirNuevo() {
    setEditando(null);
    setFormAbierto(true);
    setError(null);
  }

  function abrirEdicion(expediente) {
    setFormAbierto(false);
    setEditando(expediente);
    setError(null);
  }

  if (animal.isPending) {
    return <p className="text-center text-gray-500 py-12">Cargando…</p>;
  }

  if (animal.isError) {
    return (
      <div className="bg-papel shadow rounded-xl p-8 text-center">
        <p className="text-gray-700 mb-4">No se pudo cargar el animal.</p>
        <Link to="/admin/animales" className="text-refugio-600 hover:underline">
          ← Volver al listado
        </Link>
      </div>
    );
  }

  const lista = expedientes.data ?? [];
  const proximas = lista
    .filter((e) => e.proximaRevision && new Date(e.proximaRevision) >= new Date())
    .sort((a, b) => new Date(a.proximaRevision) - new Date(b.proximaRevision));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">
            Historial médico de {animal.data.nombre}
          </h2>
          <p className="text-sm text-gray-600">
            {ESPECIES[animal.data.especie]}
            {animal.data.raza ? ` · ${animal.data.raza}` : ''}
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Link
            to={`/admin/animales/${animalId}/editar`}
            className="text-sm text-refugio-600 hover:underline px-2 py-2"
          >
            Editar animal
          </Link>
          <button
            onClick={abrirNuevo}
            className="bg-refugio-600 hover:bg-refugio-700 text-white text-sm font-medium rounded-lg px-4 py-2 transition"
          >
            + Nuevo expediente
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      {/* Aviso de próximas revisiones */}
      {proximas.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <p className="text-sm text-amber-800">
            <span className="font-medium">Próxima revisión:</span>{' '}
            {formatFecha(proximas[0].proximaRevision)} (
            {TIPOS_EXPEDIENTE[proximas[0].tipo]?.etiqueta ?? proximas[0].tipo})
          </p>
        </div>
      )}

      {formAbierto && (
        <ExpedienteForm
          onGuardar={(data) => crearMutation.mutate(data)}
          onCancelar={() => setFormAbierto(false)}
          cargando={crearMutation.isPending}
        />
      )}

      {expedientes.isPending && (
        <p className="text-center text-gray-500 py-8">Cargando expedientes…</p>
      )}

      {expedientes.isError && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
          No se pudieron cargar los expedientes.
        </div>
      )}

      {expedientes.data && (
        lista.length === 0 && !formAbierto ? (
          <div className="bg-papel shadow rounded-xl p-12 text-center">
            <p className="text-gray-500 mb-4">
              {animal.data.nombre} todavía no tiene expedientes médicos registrados.
            </p>
            <button
              onClick={abrirNuevo}
              className="bg-refugio-600 hover:bg-refugio-700 text-white text-sm font-medium rounded-lg px-5 py-2.5 transition"
            >
              Registrar el primero
            </button>
          </div>
        ) : (
          <ul className="space-y-3">
            {lista.map((exp) => {
              const tipo = TIPOS_EXPEDIENTE[exp.tipo] ?? {
                etiqueta: exp.tipo,
                icono: '📋',
                color: 'bg-gray-100 text-gray-700'
              };

              if (editando?.id === exp.id) {
                return (
                  <li key={exp.id}>
                    <ExpedienteForm
                      expediente={exp}
                      onGuardar={(data) =>
                        actualizarMutation.mutate({ id: exp.id, data })
                      }
                      onCancelar={() => setEditando(null)}
                      cargando={actualizarMutation.isPending}
                    />
                  </li>
                );
              }

              return (
                <li key={exp.id} className="bg-papel shadow rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-xl shrink-0" aria-hidden="true">
                      {tipo.icono}
                    </span>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded-full ${tipo.color}`}
                        >
                          {tipo.etiqueta}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatFecha(exp.fecha)}
                        </span>
                        {exp.veterinario && (
                          <span className="text-xs text-gray-500">· {exp.veterinario}</span>
                        )}
                      </div>

                      <p className="text-sm text-gray-700">{exp.descripcion}</p>

                      {exp.proximaRevision && (
                        <p className="text-xs text-gray-500 mt-1">
                          Próxima revisión: {formatFecha(exp.proximaRevision)}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-1 shrink-0">
                      <button
                        onClick={() => abrirEdicion(exp)}
                        className="text-xs px-2 py-1 rounded text-refugio-700 hover:bg-refugio-50 transition"
                      >
                        Editar
                      </button>
                      {isAdmin && (
                        <button
                          onClick={() => setABorrar(exp)}
                          className="text-xs px-2 py-1 rounded text-red-600 hover:bg-red-50 transition"
                        >
                          Eliminar
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )
      )}

      <ConfirmDialog
        abierto={aBorrar !== null}
        titulo="Eliminar expediente"
        mensaje={`Se eliminará permanentemente el registro de ${
          TIPOS_EXPEDIENTE[aBorrar?.tipo]?.etiqueta?.toLowerCase() ?? 'este expediente'
        } del ${formatFecha(aBorrar?.fecha)}.`}
        textoConfirmar="Eliminar"
        peligroso
        cargando={borrarMutation.isPending}
        onConfirmar={() => borrarMutation.mutate(aBorrar.id)}
        onCancelar={() => setABorrar(null)}
      />
    </div>
  );
}
