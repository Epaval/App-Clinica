import { useState, useEffect } from 'react';

const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [rol, setRol] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userRol = localStorage.getItem('rol');
    
    setIsAuthenticated(!!token);
    setRol(userRol);
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
    localStorage.removeItem('usuario_id');
    setIsAuthenticated(false);
    setRol(null);
  };

  return { isAuthenticated, rol, logout };
};

export default useAuth;