import { useState, useEffect, useMemo } from 'react';
import { getPacientes } from '../services/pacientes';

const PacientesPage = () => {
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);
  const pacientesPorPagina = 6;

  useEffect(() => {
    const fetchPacientes = async () => {
      try {
        const res = await getPacientes();
        setPacientes(res.data);
      } catch (err) {
        console.error('Error al obtener pacientes:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPacientes();
  }, []);

  // Filtrar pacientes según la búsqueda
  const pacientesFiltrados = useMemo(() => {
    if (!busqueda) return pacientes;
    const termino = busqueda.toLowerCase();
    return pacientes.filter(p => 
      p.nombre.toLowerCase().includes(termino) || 
      p.apellido.toLowerCase().includes(termino) || 
      p.ci.includes(termino)
    );
  }, [busqueda, pacientes]);

  // Calcular pacientes para la página actual
  const indiceInicio = (paginaActual - 1) * pacientesPorPagina;
  const indiceFin = indiceInicio + pacientesPorPagina;
  const pacientesPagina = pacientesFiltrados.slice(indiceInicio, indiceFin);

  // Calcular número total de páginas
  const totalPaginas = Math.ceil(pacientesFiltrados.length / pacientesPorPagina);

  const manejarCambioPagina = (numeroPagina) => {
    setPaginaActual(numeroPagina);
  };

  if (loading) return <div className="loading">Cargando...</div>;

  return (
    <div>
      <h2>Pacientes</h2>
      
      {/* Buscador */}
      <div className="buscador-container">
        <input
          type="text"
          placeholder="Buscar por nombre o CI..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="buscador-input"
        />
      </div>

      {/* Mostrar total de resultados */}
      <p className="resultados-info">
        Mostrando {pacientesPagina.length} de {pacientesFiltrados.length} pacientes
      </p>

      {/* Tabla de pacientes */}
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Apellido</th>
            <th>CI</th>
            <th>Teléfono</th>
            <th>Email</th>
            <th>Edad</th>
          </tr>
        </thead>
        <tbody>
          {pacientesPagina.map(p => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.nombre}</td>
              <td>{p.apellido}</td>
              <td>{p.ci}</td>
              <td>{p.telefono}</td>
              <td>{p.email}</td>
              <td>{p.edad}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Paginador */}
      {totalPaginas > 1 && (
        <div className="paginador">
          <button 
            onClick={() => manejarCambioPagina(paginaActual - 1)}
            disabled={paginaActual === 1}
            className="btn-pagina"
          >
            Anterior
          </button>
          
          {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(numero => (
            <button
              key={numero}
              onClick={() => manejarCambioPagina(numero)}
              className={`btn-pagina ${paginaActual === numero ? 'activo' : ''}`}
            >
              {numero}
            </button>
          ))}
          
          <button 
            onClick={() => manejarCambioPagina(paginaActual + 1)}
            disabled={paginaActual === totalPaginas}
            className="btn-pagina"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
};

export default PacientesPage;