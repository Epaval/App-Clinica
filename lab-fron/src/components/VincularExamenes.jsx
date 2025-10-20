import { useState, useEffect } from 'react';
import { getExamenes, getExamenesPorDiagnostico, addExamenesADiagnostico } from '../services/examenes';
import ModalMensaje from './ModalMensaje';

const VincularExamenes = ({ diagnosticoId, onClose, onExamenAgregado }) => {
  const [examenes, setExamenes] = useState([]);
  const [examenesSeleccionados, setExamenesSeleccionados] = useState({});
  const [resultados, setResultados] = useState({});
  const [loading, setLoading] = useState(true);
  const [mensajeModal, setMensajeModal] = useState({
    isOpen: false,
    tipo: '',
    mensaje: '',
  });

  useEffect(() => {
    const cargarExamenes = async () => {
      try {
        const res = await getExamenes();
        setExamenes(res.data);
      } catch (err) {
        console.error('Error al cargar exámenes:', err);
      } finally {
        setLoading(false);
      }
    };

    cargarExamenes();
  }, []);

  const handleSeleccionarExamen = (examenId) => {
    setExamenesSeleccionados(prev => ({
      ...prev,
      [examenId]: !prev[examenId]
    }));
  };

  const handleResultadoChange = (examenId, valor) => {
    setResultados(prev => ({
      ...prev,
      [examenId]: valor
    }));
  };

// En handleSubmit
// En handleSubmit, prueba con un examen fijo
const handleSubmit = async () => {
  // Prueba con un examen fijo que sepas que existe
  const examenesAEnviar = [
    {
      examen_id: 2,  // Cambia este ID por uno que exista
      resultado: null
    }
  ];

  console.log('Enviando exámenes:', examenesAEnviar);

  try {
    const response = await addExamenesADiagnostico(diagnosticoId, examenesAEnviar);
    console.log('Respuesta del servidor:', response);
    
    setMensajeModal({
      isOpen: true,
      tipo: 'exito',
      mensaje: 'Exámenes solicitados exitosamente',
    });
    onExamenAgregado && onExamenAgregado();
  } catch (err) {
    console.error('Error al solicitar exámenes:', err);
    console.error('Detalles del error:', err.response?.data || err.message);
    
    setMensajeModal({
      isOpen: true,
      tipo: 'error',
      mensaje: 'Error al solicitar exámenes: ' + (err.response?.data?.message || err.message),
    });
  }
};

  const handleMensajeModalClose = () => {
    setMensajeModal({
      isOpen: false,
      tipo: '',
      mensaje: '',
    });
    if (mensajeModal.tipo === 'exito') {
      onClose(); // Cierra el modal padre
    }
  };

  if (loading) return <div className="loading">Cargando exámenes...</div>;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Vincular Exámenes al Diagnóstico</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="examenes-list">
            {examenes.map(examen => (
              <div key={examen.id} className="examen-item">
                <label className="examen-checkbox">
                  <input
                    type="checkbox"
                    checked={!!examenesSeleccionados[examen.id]}
                    onChange={() => handleSeleccionarExamen(examen.id)}
                  />
                  <span className="examen-info">
                    <strong>{examen.nombre}</strong> - {examen.perfil_nombre}
                    <br />
                    <small>{examen.descripcion || 'Sin descripción'}</small>
                  </span>
                </label>
                {examenesSeleccionados[examen.id] && (
                  <div className="examen-resultado">
                    <label>
                      Resultado:
                      <input
                        type="text"
                        value={resultados[examen.id] || ''}
                        onChange={(e) => handleResultadoChange(examen.id, e.target.value)}
                        placeholder="Ingresar resultado..."
                      />
                    </label>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button className="btn btn-primary" onClick={handleSubmit}>
              Vincular Exámenes
            </button>
          </div>
        </div>
      </div>

      <ModalMensaje
        isOpen={mensajeModal.isOpen}
        onClose={handleMensajeModalClose}
        tipo={mensajeModal.tipo}
        mensaje={mensajeModal.mensaje}
      />
    </div>
  );
};

export default VincularExamenes;