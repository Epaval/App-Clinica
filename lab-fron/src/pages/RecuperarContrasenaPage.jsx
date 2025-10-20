import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { recuperarContrasena } from '../services/auth';
import ModalMensaje from '../components/ModalMensaje';

const RecuperarContrasenaPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
  });
  const [loading, setLoading] = useState(false);
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

    try {
      await recuperarContrasena(formData);
      setMensajeModal({
        isOpen: true,
        tipo: 'exito',
        mensaje: 'Se ha enviado un token de recuperación a tu correo. Revisa la consola para ver el token.',
      });
    } catch (err) {
      console.error('Error al recuperar contraseña:', err);
      setMensajeModal({
        isOpen: true,
        tipo: 'error',
        mensaje: 'Error al enviar el token de recuperación. Por favor intenta de nuevo.',
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
  };

  return (
    <div className="recuperar-container">
      <div className="recuperar-form">
        <h2>Recuperar Contraseña</h2>
        <p>Ingresa tu email para recibir un token de recuperación</p>
        <form onSubmit={handleSubmit}>
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
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Enviando...' : 'Enviar Token'}
          </button>
        </form>
        <div className="recuperar-actions">
          <button 
            onClick={() => navigate('/login')}
            className="btn btn-secondary"
          >
            Volver al Login
          </button>
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

export default RecuperarContrasenaPage;