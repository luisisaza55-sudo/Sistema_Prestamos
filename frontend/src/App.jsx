/**
 * App.jsx - Define las rutas de la SPA y protege el acceso con login.
 * Envuelve todo con ToastProvider para notificaciones globales.
 */
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import { ToastProvider } from './components/Toast';
import Dashboard from './pages/Dashboard';
import Herramientas from './pages/Herramientas';
import Prestamos from './pages/Prestamos';
import Alertas from './pages/Alertas';
import Login from './pages/Login';
import { isAuthenticated } from './auth/users';

function Protected({ children }) {
  const location = useLocation();
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="app-content">{children}</main>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/dashboard"    element={<Protected><Dashboard /></Protected>} />
        <Route path="/herramientas" element={<Protected><Herramientas /></Protected>} />
        <Route path="/prestamos"    element={<Protected><Prestamos /></Protected>} />
        <Route path="/alertas"      element={<Protected><Alertas /></Protected>} />

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
    </ToastProvider>
  );
}
