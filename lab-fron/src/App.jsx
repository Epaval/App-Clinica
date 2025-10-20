import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import PacientesPage from './pages/PacientesPage';
import ExpedientesPage from './pages/ExpedientesPage';
import UsuariosPage from './pages/UsuariosPage';
import CitasPage from './pages/CitasPage';
import HorariosPage from './pages/HorariosPage';
import AgregarPacientePage from './pages/AgregarPacientePage';
import AgregarDiagnosticoPage from './pages/AgregarDiagnosticoPage';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import { logout } from './services/auth';
import RecuperarContrasenaPage from './pages/RecuperarContrasenaPage';
import CambiarContrasenaPage from './pages/CambiarContrasenaPage';
import ExamenesPage from './pages/ExamenesPage';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [rol, setRol] = useState(localStorage.getItem('rol'));
  const [nombreUsuario, setNombreUsuario] = useState(localStorage.getItem('nombre_usuario'));
  const [apellidoUsuario, setApellidoUsuario] = useState(localStorage.getItem('apellido_usuario'));

  // Función para manejar login exitoso
  const handleLoginSuccess = (token, userRol) => {
    setIsLoggedIn(true);
    setRol(userRol);
    // Obtener nombre y apellido del localStorage
    setNombreUsuario(localStorage.getItem('nombre_usuario'));
    setApellidoUsuario(localStorage.getItem('apellido_usuario'));
  };

  const handleLogout = () => {
    logout();
    setIsLoggedIn(false);
    setRol(null);
    setNombreUsuario(null);
    setApellidoUsuario(null);
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
    localStorage.removeItem('usuario_id');
    localStorage.removeItem('nombre_usuario');
    localStorage.removeItem('apellido_usuario');
  };

  // Definir enlaces según rol
  const getNavigationLinks = () => {
    const links = [];

    if (rol === 'admin' || rol === 'jefe_medico') {
      links.push(
        { path: '/pacientes', label: 'Pacientes' },
        { path: '/expedientes', label: 'Expedientes' },
        { path: '/examenes', label: 'Exámenes' },
        { path: '/usuarios', label: 'Usuarios' },
        { path: '/citas', label: 'Citas' },
        { path: '/horarios', label: 'Horarios' },
        { path: '/agregar-paciente', label: 'Agregar Paciente' },
        { path: '/agregar-diagnostico', label: 'Agregar Diagnóstico' }
      );
    } else if (rol === 'medico') {
      links.push(
        { path: '/expedientes', label: 'Expedientes' },
        { path: '/examenes', label: 'Exámenes' },
        { path: '/agregar-diagnostico', label: 'Agregar Diagnóstico' }
      );
    } else if (rol === 'asistente') {
      links.push(
        { path: '/pacientes', label: 'Pacientes' },
        { path: '/agregar-paciente', label: 'Agregar Paciente' },
        { path: '/citas', label: 'Citas' },
        { path: '/horarios', label: 'Horarios' }
      );
    }

    return links;
  };

  const navigationLinks = getNavigationLinks();

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        {isLoggedIn && (
          <nav className="bg-blue-600 text-white p-4">
            <div className="flex justify-between items-center">
              <ul className="flex space-x-4">
                {navigationLinks.map((link, index) => (
                  <li key={index}>
                    <Link to={link.path} className="hover:underline">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="flex items-center space-x-4">
                {/* Mostrar nombre del usuario logueado */}
                <span className="usuario-logueado">
                  Bienvenida/o:  <strong>{nombreUsuario} {apellidoUsuario}</strong>
                </span>
                <button onClick={handleLogout} className="btn btn-danger">
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </nav>
        )}

        <main className="p-4">
          <Routes>
            <Route path="/login" element={<LoginPage onLoginSuccess={handleLoginSuccess} />} />
            <Route
              path="/recuperar-contrasena"
              element={<RecuperarContrasenaPage />}
            />
            <Route
              path="/cambiar-contrasena"
              element={<CambiarContrasenaPage />}
            />

            {/* Rutas protegidas */}
            <Route
              path="/pacientes"
              element={
                <ProtectedRoute
                  allowedRoles={["admin", "jefe_medico", "asistente"]}
                >
                  <PacientesPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/expedientes"
              element={
                <ProtectedRoute
                  allowedRoles={["admin", "jefe_medico", "medico"]}
                >
                  <ExpedientesPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/examenes"
              element={
                <ProtectedRoute
                  allowedRoles={["admin", "jefe_medico", "medico"]}
                >
                  <ExamenesPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/usuarios"
              element={
                <ProtectedRoute allowedRoles={["admin", "jefe_medico"]}>
                  <UsuariosPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/citas"
              element={
                <ProtectedRoute
                  allowedRoles={["admin", "jefe_medico", "asistente"]}
                >
                  <CitasPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/horarios"
              element={
                <ProtectedRoute
                  allowedRoles={["admin", "jefe_medico", "asistente"]}
                >
                  <HorariosPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/agregar-paciente"
              element={
                <ProtectedRoute
                  allowedRoles={["admin", "jefe_medico", "asistente"]}
                >
                  <AgregarPacientePage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/agregar-diagnostico"
              element={
                <ProtectedRoute
                  allowedRoles={["admin", "jefe_medico", "medico"]}
                >
                  <AgregarDiagnosticoPage />
                </ProtectedRoute>
              }
            />

            {/* Redirigir a pacientes si está logueado y va a raíz */}
            <Route
              path="/"
              element={
                isLoggedIn ? (
                  <Navigate to="/pacientes" replace />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;