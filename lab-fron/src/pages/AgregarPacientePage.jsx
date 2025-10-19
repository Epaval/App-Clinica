import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPaciente } from '../services/pacientes';
import ModalMensaje from '../components/ModalMensaje'; // Asegúrate de que la ruta sea correcta

const AgregarPacientePage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    ci: '',
    telefono: '',
    email: '',
    fecha_nacimiento: '',
    sexo: 'M', // Valor por defecto
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mensajeModal, setMensajeModal] = useState({
    isOpen: false,
    tipo: '',
    mensaje: '',
  });

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
      await createPaciente(formData);
      
      // Mostrar modal de éxito
      setMensajeModal({
        isOpen: true,
        tipo: 'exito',
        mensaje: 'Paciente agregado exitosamente',
      });

      // Limpiar formulario
      setFormData({
        nombre: '',
        apellido: '',
        ci: '',
        telefono: '',
        email: '',
        fecha_nacimiento: '',
        sexo: 'M',
      });
    } catch (err) {
      console.error('Error al crear paciente:', err);
      // Mostrar modal de error
      setMensajeModal({
        isOpen: true,
        tipo: 'error',
        mensaje: 'Error al crear paciente. Por favor intenta de nuevo.',
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
      <h2>Agregar Nuevo Paciente</h2>
      {error && <div className="error">{error}</div>}
      <form onSubmit={handleSubmit} className="paciente-form">
        <div className="form-group">
          <label htmlFor="nombre">Nombre:</label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="apellido">Apellido:</label>
          <input
            type="text"
            id="apellido"
            name="apellido"
            value={formData.apellido}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="ci">CI:</label>
          <input
            type="text"
            id="ci"
            name="ci"
            value={formData.ci}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="telefono">Teléfono:</label>
          <input
            type="text"
            id="telefono"
            name="telefono"
            value={formData.telefono}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="fecha_nacimiento">Fecha de Nacimiento:</label>
          <input
            type="date"
            id="fecha_nacimiento"
            name="fecha_nacimiento"
            value={formData.fecha_nacimiento}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="sexo">Sexo:</label>
          <select
            id="sexo"
            name="sexo"
            value={formData.sexo}
            onChange={handleChange}
            required
          >
            <option value="M">Masculino</option>
            <option value="F">Femenino</option>
          </select>
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Guardando...' : 'Agregar Paciente'}
        </button>
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

export default AgregarPacientePage;