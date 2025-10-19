import { useState, useEffect } from 'react';
import { getPacientes } from '../services/pacientes';
import { getDiagnosticosByExpediente } from '../services/expedientes';
import { useNavigate } from 'react-router-dom'; // Importar useNavigate

const ExpedientesPage = () => {
  const navigate = useNavigate(); // Hook para navegar
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [diagnosticosModal, setDiagnosticosModal] = useState({
    isOpen: false,
    paciente: null,
    diagnosticos: [],
    loading: false,
  });

  useEffect(() => {
    const fetchPacientes = async () => {
      try {
        const res = await getPacientes();
        setPacientes(res.data);
      } catch (err) {
        console.error('Error al obtener pacientes:', err);
        setError('Error al cargar pacientes');
      } finally {
        setLoading(false);
      }
    };
    fetchPacientes();
  }, []);

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

  const handleAgregarDiagnostico = () => {   
    navigate('/agregar-diagnostico', { state: { pacienteId: diagnosticosModal.paciente?.id } });
  };

  const closeModal = () => {
    setDiagnosticosModal({
      isOpen: false,
      paciente: null,
      diagnosticos: [],
      loading: false,
    });
  };

  if (loading) return <div className="loading">Cargando...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div>
      <h2>Expedientes</h2>
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
          {pacientes.map(p => (
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
                      <hr />
                    </div>
                  ))}
                </div>
              )}
              <div className="modal-footer">
                <button 
                  className="btn btn-primary"
                  onClick={handleAgregarDiagnostico}
                >
                  Agregar Nuevo Diagnóstico
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpedientesPage;