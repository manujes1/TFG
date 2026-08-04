import { useEffect, useState } from 'react';
import api from '../api/client.js';

/**
 * Página inicial. De momento sirve como prueba de conexión:
 * llama al endpoint /health del backend y muestra el resultado.
 */
export default function HomePage() {
  const [status, setStatus] = useState('cargando...');
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/health')
      .then((response) => setStatus(response.data.status))
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div className="min-h-screen bg-refugio-50 flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold text-refugio-700 mb-4">
        🐾 Refugio de Animales
      </h1>
      <p className="text-lg text-gray-700 mb-8">
        Plataforma de gestión integral. TFG en desarrollo.
      </p>

      <div className="bg-white shadow rounded-lg p-6 max-w-md w-full">
        <h2 className="font-semibold text-gray-800 mb-2">
          Estado del backend
        </h2>
        {error ? (
          <p className="text-red-600">Error: {error}</p>
        ) : (
          <p className="text-refugio-600">
            <span className="font-medium">Backend:</span> {status}
          </p>
        )}
      </div>
    </div>
  );
}
