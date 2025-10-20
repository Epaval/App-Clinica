import { useState, useEffect } from 'react';
import { getPacientes } from '../services/pacientes';
import { getDiagnosticosByExpediente } from '../services/expedientes';
import { getExamenesPorDiagnostico } from '../services/examenes';
import VincularExamenes from '../components/VincularExamenes';
import ModalMensaje from '../components/ModalMensaje';

const ExpedientesPage = () => {
  const [pacientes, setPacientes] = useState([]);
  const [pacientesFiltrados, setPacientesFiltrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);
  const pacientesPorPagina = 5;

  const [diagnosticosModal, setDiagnosticosModal] = useState({
    isOpen: false,
    paciente: null,
    diagnosticos: [],
    loading: false,
  });
  const [examenesModal, setExamenesModal] = useState({
    isOpen: false,
    diagnosticoId: null,
  });

  useEffect(() => {
    const fetchPacientes = async () => {
      try {
        const res = await getPacientes();
        setPacientes(res.data);
        setPacientesFiltrados(res.data);
      } catch (err) {
        console.error('Error al obtener pacientes:', err);
        setError('Error al cargar pacientes');
      } finally {
        setLoading(false);
      }
    };
    fetchPacientes();
  }, []);

  // Filtrar pacientes según búsqueda
  useEffect(() => {
    const termino = busqueda.toLowerCase().trim();
    if (termino === '') {
      setPacientesFiltrados(pacientes);
      setPaginaActual(1);
    } else {
      const filtrados = pacientes.filter(p => 
        p.nombre.toLowerCase().includes(termino) ||
        p.apellido.toLowerCase().includes(termino) ||
        p.ci.includes(termino)
      );
      setPacientesFiltrados(filtrados);
      setPaginaActual(1);
    }
  }, [busqueda, pacientes]);

  // Calcular pacientes para la página actual
  const indiceUltimoPaciente = paginaActual * pacientesPorPagina;
  const indicePrimerPaciente = indiceUltimoPaciente - pacientesPorPagina;
  const pacientesActuales = pacientesFiltrados.slice(indicePrimerPaciente, indiceUltimoPaciente);
  const totalPaginas = Math.ceil(pacientesFiltrados.length / pacientesPorPagina);

  const handleVerDiagnosticos = async (pacienteId, paciente) => {
    setDiagnosticosModal({
      ...diagnosticosModal,
      isOpen: true,
      paciente,
      loading: true,
    });

    try {
      const res = await getDiagnosticosByExpediente(pacienteId);
      // Ordenar diagnósticos por fecha (más reciente primero)
      const diagnosticosOrdenados = res.data.sort((a, b) => 
        new Date(b.fecha_registro) - new Date(a.fecha_registro)
      );
      setDiagnosticosModal({
        isOpen: true,
        paciente,
        diagnosticos: diagnosticosOrdenados,
        loading: false,
      });
    } catch (err) {
      console.error('Error al obtener diagnósticos:', err);
      setDiagnosticosModal({
        ...diagnosticosModal,
        loading: false,
      });
    }
  };

  const handleVerExamenes = async (diagnosticoId) => {
    try {
      const res = await getExamenesPorDiagnostico(diagnosticoId);
      // Aquí puedes mostrar los exámenes en un nuevo modal o expandir el diagnóstico
      console.log('Exámenes del diagnóstico:', res.data);
    } catch (err) {
      console.error('Error al obtener exámenes del diagnóstico:', err);
    }
  };

 const handleAgregarExamenes = (diagnosticoId) => {
  console.log('ID del diagnóstico a usar:', diagnosticoId);
  console.log('Tipo del ID:', typeof diagnosticoId);
  
  if (!diagnosticoId) {
    console.error('ID del diagnóstico es inválido:', diagnosticoId);
    return;
  }
  
  setExamenesModal({
    isOpen: true,
    diagnosticoId,
  });
};

  const closeModal = () => {
    setDiagnosticosModal({
      isOpen: false,
      paciente: null,
      diagnosticos: [],
      loading: false,
    });
  };

  const closeExamenesModal = () => {
    setExamenesModal({
      isOpen: false,
      diagnosticoId: null,
    });
  };

  const handleCambioPagina = (numeroPagina) => {
    setPaginaActual(numeroPagina);
  };

  const handleBusquedaChange = (e) => {
    setBusqueda(e.target.value);
  };

  if (loading) return <div className="loading">Cargando...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div>
      <h2>Expedientes</h2>
      
      {/* Buscador */}
      <div className="buscador-container">
        <input
          type="text"
          placeholder="Buscar por nombre o CI..."
          value={busqueda}
          onChange={handleBusquedaChange}
          className="buscador-input"
        />
      </div>

      {/* Mostrar total de resultados */}
      <p className="resultados-info">
        Mostrando {pacientesActuales.length} de {pacientesFiltrados.length} pacientes
      </p>

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
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {pacientesActuales.map(p => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.nombre}</td>
              <td>{p.apellido}</td>
              <td>{p.ci}</td>
              <td>{p.telefono}</td>
              <td>{p.email}</td>
              <td>{p.edad}</td>
              <td>
                <button 
                  className="btn btn-primary"
                  onClick={() => handleVerDiagnosticos(p.id, p)}
                >
                  Ver Expediente
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Paginador */}
      {totalPaginas > 1 && (
        <div className="paginador">
          <button 
            onClick={() => handleCambioPagina(paginaActual - 1)}
            disabled={paginaActual === 1}
            className="btn-pagina"
          >
            Anterior
          </button>
          
          {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(numero => (
            <button
              key={numero}
              onClick={() => handleCambioPagina(numero)}
              className={`btn-pagina ${paginaActual === numero ? 'activo' : ''}`}
            >
              {numero}
            </button>
          ))}
          
          <button 
            onClick={() => handleCambioPagina(paginaActual + 1)}
            disabled={paginaActual === totalPaginas}
            className="btn-pagina"
          >
            Siguiente
          </button>
        </div>
      )}

      {/* Modal de diagnósticos */}
      {diagnosticosModal.isOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Expediente de {diagnosticosModal.paciente?.nombre} {diagnosticosModal.paciente?.apellido}</h3>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            <div className="modal-body">
              {diagnosticosModal.loading ? (
                <div className="loading">Cargando diagnósticos...</div>
              ) : diagnosticosModal.diagnosticos.length === 0 ? (
                <p>No hay diagnósticos registrados para este paciente.</p>
              ) : (
                <div className="diagnosticos-list">
                  {diagnosticosModal.diagnosticos.map((diag, index) => (
                    <div key={diag.id} className="diagnostico-item">
                      <h4>Diagnóstico #{diagnosticosModal.diagnosticos.length - index}</h4>
                      <p><strong>Fecha:</strong> {new Date(diag.fecha_registro).toLocaleString()}</p>
                      <p><strong>Diagnóstico:</strong> {diag.diagnostico}</p>
                      <p><strong>Tratamiento:</strong> {diag.tratamiento || 'No especificado'}</p>
                      
                      {/* Botones para exámenes */}
                      <div className="diagnostico-actions">
                        <button 
                          className="btn btn-secondary"
                          onClick={() => handleVerExamenes(diag.id)}
                        >
                          Ver Exámenes
                        </button>
                        <button 
                          className="btn btn-primary"
                          onClick={() => handleAgregarExamenes(diag.id)}
                        >
                          Agregar Exámenes
                        </button>
                      </div>
                      <hr />
                    </div>
                  ))}
                </div>
              )}
              <div className="modal-footer">
                <button 
                  className="btn btn-primary"
                  onClick={() => window.location.href = '/agregar-diagnostico'}
                >
                  Agregar Nuevo Diagnóstico
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de exámenes */}
      {examenesModal.isOpen && (
        <VincularExamenes
          diagnosticoId={examenesModal.diagnosticoId}
          onClose={closeExamenesModal}
          onExamenAgregado={() => {
            // Opcional: refrescar diagnósticos
            handleVerDiagnosticos(diagnosticosModal.paciente.id, diagnosticosModal.paciente);
          }}
        />
      )}
    </div>
  );
};

export default ExpedientesPage;