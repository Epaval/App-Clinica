import { useState, useEffect } from 'react';
import { getPerfilesExamenes, getExamenes } from '../services/examenes';

const ExamenesPage = () => {
  const [perfiles, setPerfiles] = useState([]);
  const [examenes, setExamenes] = useState([]);
  const [examenesFiltrados, setExamenesFiltrados] = useState([]);
  const [perfilSeleccionado, setPerfilSeleccionado] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Cargar perfiles
        const perfilesRes = await getPerfilesExamenes();
        setPerfiles(perfilesRes.data);

        // Cargar todos los exámenes
        const examenesRes = await getExamenes();
        setExamenes(examenesRes.data);
        setExamenesFiltrados(examenesRes.data);
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError('Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleFiltrarPorPerfil = (perfilId) => {
    if (perfilId === '') {
      setExamenesFiltrados(examenes);
      return;
    }

    const filtrados = examenes.filter(examen => 
      examen.perfil_nombre === perfiles.find(p => p.id === parseInt(perfilId))?.nombre
    );
    setExamenesFiltrados(filtrados);
  };

  const handleChangePerfil = (e) => {
    const perfilId = e.target.value;
    setPerfilSeleccionado(perfilId);
    handleFiltrarPorPerfil(perfilId);
  };

  if (loading) return <div className="loading">Cargando...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div>
      <h2>Exámenes</h2>
      
      <div className="filtro-container">
        <label htmlFor="perfil">Filtrar por perfil:</label>
        <select
          id="perfil"
          value={perfilSeleccionado}
          onChange={handleChangePerfil}
          className="filtro-select"
        >
          <option value="">Todos los perfiles</option>
          {perfiles.map(perfil => (
            <option key={perfil.id} value={perfil.id}>
              {perfil.nombre}
            </option>
          ))}
        </select>
      </div>

      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Perfil</th>
            <th>Descripción</th>
            <th>Referencia</th>
          </tr>
        </thead>
        <tbody>
          {examenesFiltrados.map(examen => (
            <tr key={examen.id}>
              <td>{examen.nombre}</td>
              <td>{examen.perfil_nombre}</td>
              <td>{examen.descripcion || '-'}</td>
              <td>{examen.referencia_resultado || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ExamenesPage;