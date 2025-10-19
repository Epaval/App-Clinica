import { useState, useEffect } from 'react';
import { getCitas } from '../services/citas'; // Asegúrate de crear este archivo

const CitasPage = () => {
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCitas = async () => {
      try {
        const res = await getCitas();
        setCitas(res.data);
      } catch (err) {
        console.error('Error al obtener citas:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCitas();
  }, []);

  if (loading) return <div className="loading">Cargando...</div>;

  return (
    <div>
      <h2>Citas</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Paciente</th>
            <th>Médico</th>
            <th>Fecha y Hora</th>
            <th>Estado</th>
            <th>Motivo</th>
          </tr>
        </thead>
        <tbody>
          {citas.map(c => (
            <tr key={c.id}>
              <td>{c.id}</td>
              <td>{c.nombre_paciente} {c.apellido_paciente}</td>
              <td>{c.nombre_medico} {c.apellido_medico}</td>
              <td>{new Date(c.fecha_hora).toLocaleString()}</td>
              <td>
                <span className={`status status-${c.estado}`}>
                  {c.estado}
                </span>
              </td>
              <td>{c.motivo || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CitasPage;