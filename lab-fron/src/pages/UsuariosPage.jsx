import { useState, useEffect } from 'react';
import { getUsuarios } from '../services/usuarios'; // Asegúrate de crear este archivo

const UsuariosPage = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const res = await getUsuarios();
        setUsuarios(res.data);
      } catch (err) {
        console.error('Error al obtener usuarios:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsuarios();
  }, []);

  if (loading) return <div className="loading">Cargando...</div>;

  return (
    <div>
      <h2>Usuarios</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Apellido</th>
            <th>Teléfono</th>
            <th>Email</th>
            <th>Fecha Nacimiento</th>
            <th>Sexo</th>
            <th>Rol</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map(u => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.nombre}</td>
              <td>{u.apellido}</td>
              <td>{u.telefono}</td>
              <td>{u.email}</td>
              <td>{new Date(u.fecha_nacimiento).toLocaleDateString()}</td>
              <td>{u.sexo}</td>
              <td>
                <span className={`rol rol-${u.rol_nombre}`}>
                  {u.rol_nombre}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UsuariosPage;