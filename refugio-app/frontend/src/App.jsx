import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import Layout from './components/Layout.jsx';
import AdminLayout from './components/AdminLayout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import AnimalesPage from './pages/AnimalesPage.jsx';
import AnimalDetallePage from './pages/AnimalDetallePage.jsx';
import MisSolicitudesPage from './pages/MisSolicitudesPage.jsx';

import DashboardPage from './pages/admin/DashboardPage.jsx';
import AnimalesAdminPage from './pages/admin/AnimalesAdminPage.jsx';
import AdopcionesAdminPage from './pages/admin/AdopcionesAdminPage.jsx';

const STAFF = ['ADMIN', 'VOLUNTARIO'];

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
                  <MisSolicitudesPage />
                </ProtectedRoute>
              }
            />

            {/* Panel de administración (rutas anidadas) */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute roles={STAFF}>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardPage />} />
              <Route path="animales" element={<AnimalesAdminPage />} />
              <Route path="adopciones" element={<AdopcionesAdminPage />} />
            </Route>
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
