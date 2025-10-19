import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getPacientes } from '../services/pacientes';
import { createDiagnostico } from '../services/expedientes';
import ModalMensaje from '../components/ModalMensaje'; // Importar el componente

const AgregarDiagnosticoPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const pacienteDesdeExpediente = location.state?.pacienteId;

  const [pacientes, setPacientes] = useState([]);
  const [formData, setFormData] = useState({
    paciente_id: pacienteDesdeExpediente || '',
    diagnostico: '',
    tratamiento: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mensajeModal, setMensajeModal] = useState({
    isOpen: false,
    tipo: '',
    mensaje: '',
  });

  useEffect(() => {
    const fetchPacientes = async () => {
      try {
        const res = await getPacientes();
        setPacientes(res.data);
      } catch (err) {
        console.error('Error al obtener pacientes:', err);
        setError('Error al cargar pacientes');
      }
    };
    if (!pacienteDesdeExpediente) {
      fetchPacientes();
    } else {
      const fetchPaciente = async () => {
        try {
          const res = await getPacientes();
          const paciente = res.data.find(p => p.id === pacienteDesdeExpediente);
          if (paciente) {
            setPacientes([paciente]);
          }
        } catch (err) {
          console.error('Error al obtener paciente:', err);
          setError('Error al cargar paciente');
        }
      };
      fetchPaciente();
    }
  }, [pacienteDesdeExpediente]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await createDiagnostico(formData.paciente_id, {
        diagnostico: formData.diagnostico,
        tratamiento: formData.tratamiento,
      });
      
      // Mostrar modal de éxito
      setMensajeModal({
        isOpen: true,
        tipo: 'exito',
        mensaje: 'Diagnóstico agregado exitosamente',
      });

      // Limpiar formulario
      setFormData({
        paciente_id: pacienteDesdeExpediente || '',
        diagnostico: '',
        tratamiento: '',
      });
    } catch (err) {
      console.error('Error al crear diagnóstico:', err);
      // Mostrar modal de error
      setMensajeModal({
        isOpen: true,
        tipo: 'error',
        mensaje: 'Error al crear diagnóstico. Por favor intenta de nuevo.',
      });
    } finally {
      setLoading(false);
    }
  };

 const handleMensajeModalClose = () => {
    setMensajeModal({
      isOpen: false,
      tipo: '',
      mensaje: '',
    });
    // Redirigir a expedientes después de cerrar el modal
    if (mensajeModal.tipo === 'exito') {
      navigate('/expedientes');
    }
  };

  return (
    <div>
      <h2>Agregar Nuevo Diagnóstico</h2>
      {error && <div className="error">{error}</div>}
      <form onSubmit={handleSubmit} className="diagnostico-form">
        <div className="form-group">
          <label htmlFor="paciente_id">Paciente:</label>
          <select
            id="paciente_id"
            name="paciente_id"
            value={formData.paciente_id}
            onChange={handleChange}
            required
            disabled={!!pacienteDesdeExpediente}
          >
            {pacienteDesdeExpediente ? (
              pacientes.map(p => (
                <option key={p.id} value={p.id}>
                  {p.nombre} {p.apellido} (CI: {p.ci})
                </option>
              ))
            ) : (
              <>
                <option value="">Selecciona un paciente</option>
                {pacientes.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.nombre} {p.apellido} (CI: {p.ci})
                  </option>
                ))}
              </>
            )}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="diagnostico">Diagnóstico:</label>
          <textarea
            id="diagnostico"
            name="diagnostico"
            value={formData.diagnostico}
            onChange={handleChange}
            required
            rows="4"
          />
        </div>
        <div className="form-group">
          <label htmlFor="tratamiento">Tratamiento:</label>
          <textarea
            id="tratamiento"
            name="tratamiento"
            value={formData.tratamiento}
            onChange={handleChange}
            rows="4"
          />
        </div>
        <div className="form-actions">
          <button type="button" className="btn btn-danger" onClick={() => navigate(-1)}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Guardando...' : 'Agregar Diagnóstico'}
          </button>
        </div>
      </form>

      {/* Modal de mensaje */}
      <ModalMensaje
        isOpen={mensajeModal.isOpen}
        onClose={handleMensajeModalClose}
        tipo={mensajeModal.tipo}
        mensaje={mensajeModal.mensaje}
      />
    </div>
  );
};

export default AgregarDiagnosticoPage;