import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import Layout from './components/Layout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import AnimalesPage from './pages/AnimalesPage.jsx';
import AnimalDetallePage from './pages/AnimalDetallePage.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Rutas sin layout (pantalla completa) */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registro" element={<RegisterPage />} />

          {/* Rutas con layout compartido */}
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/animales" element={<AnimalesPage />} />
            <Route path="/animales/:id" element={<AnimalDetallePage />} />

            <Route
              path="/mis-solicitudes"
              element={
                <ProtectedRoute>
                  <div className="bg-white shadow rounded-xl p-8">
                    <h1 className="text-2xl font-bold text-refugio-700">
                      Mis solicitudes
                    </h1>
                    <p className="text-gray-600 mt-2">Próximamente.</p>
                  </div>
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin"
              element={
                <ProtectedRoute roles={['ADMIN', 'VOLUNTARIO']}>
                  <div className="bg-white shadow rounded-xl p-8">
                    <h1 className="text-2xl font-bold text-refugio-700">
                      Panel de administración
                    </h1>
                    <p className="text-gray-600 mt-2">Próximamente.</p>
                  </div>
                </ProtectedRoute>
              }
            />
          </Route>

          {/* 404 */}
          <Route
            path="*"
            element={
              <div className="min-h-screen flex flex-col items-center justify-center bg-refugio-50">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">404</h1>
                <p className="text-gray-600">Página no encontrada.</p>
              </div>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
