import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App.jsx';
import './index.css';

/**
 * Cliente de React Query.
 * Configuramos algunos defaults sensatos para no repetirlos en cada query.
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,                    // reintenta 1 vez ante fallo
      refetchOnWindowFocus: false, // no refetch al volver a la pestaña
      staleTime: 60_000            // considera fresco durante 1 minuto
    }
  }
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>
);
