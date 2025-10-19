import { useState, useEffect } from 'react';
import { getHorarios } from '../services/horarios'; // Asegúrate de crear este archivo

const HorariosPage = () => {
  const [horarios, setHorarios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHorarios = async () => {
      try {
        const res = await getHorarios();
        setHorarios(res.data);
      } catch (err) {
        console.error('Error al obtener horarios:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHorarios();
  }, []);

  if (loading) return <div className="loading">Cargando...</div>;

  return (
    <div>
      <h2>Horarios</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Usuario</th>
            <th>Día de la Semana</th>
            <th>Hora Inicio</th>
            <th>Hora Fin</th>
          </tr>
        </thead>
        <tbody>
          {horarios.map(h => (
            <tr key={h.id}>
              <td>{h.id}</td>
              <td>{h.nombre_usuario} {h.apellido_usuario}</td>
              <td>{h.dia_semana}</td>
              <td>{h.hora_inicio}</td>
              <td>{h.hora_fin}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default HorariosPage;