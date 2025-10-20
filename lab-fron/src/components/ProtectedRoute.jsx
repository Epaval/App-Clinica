import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [token, setToken] = useState(null);
  const [rol, setRol] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedRol = localStorage.getItem('rol');
    
    setToken(storedToken);
    setRol(storedRol);

    if (storedToken && (!allowedRoles.length || allowedRoles.includes(storedRol))) {
      setIsAuthorized(true);
    }
    
    setIsChecking(false);
  }, [allowedRoles]);

  if (isChecking) {
    return <div className="loading">Verificando permisos...</div>;
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !isAuthorized) {
    // Redirigir según el rol del usuario
    switch (rol) {
      case 'admin':
      case 'jefe_medico':
        return <Navigate to="/pacientes" replace />;
      case 'medico':
        return <Navigate to="/expedientes" replace />;
      case 'asistente':
        return <Navigate to="/agregar-paciente" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;