import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cambiarContrasena } from '../services/auth';
import ModalMensaje from '../components/ModalMensaje';

const CambiarContrasenaPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    token: '',
    nueva_contrasena: '',
    confirmar_contrasena: '',
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
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.nueva_contrasena !== formData.confirmar_contrasena) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);

    try {
      await cambiarContrasena(formData);
      setMensajeModal({
        isOpen: true,
        tipo: 'exito',
        mensaje: 'Contraseña actualizada exitosamente. Puedes iniciar sesión con tu nueva contraseña.',
      });
    } catch (err) {
      console.error('Error al cambiar contraseña:', err);
      setMensajeModal({
        isOpen: true,
        tipo: 'error',
        mensaje: 'Token inválido o expirado. Por favor solicita un nuevo token.',
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
    if (mensajeModal.tipo === 'exito') {
      navigate('/login');
    }
  };

  return (
    <div className="cambiar-container">
      <div className="cambiar-form">
        <h2>Cambiar Contraseña</h2>
        <p>Ingresa el token de recuperación y tu nueva contraseña</p>
        {error && <div className="error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="token">Token de Recuperación:</label>
            <input
              type="text"
              id="token"
              name="token"
              value={formData.token}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="nueva_contrasena">Nueva Contraseña:</label>
            <input
              type="password"
              id="nueva_contrasena"
              name="nueva_contrasena"
              value={formData.nueva_contrasena}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmar_contrasena">Confirmar Nueva Contraseña:</label>
            <input
              type="password"
              id="confirmar_contrasena"
              name="confirmar_contrasena"
              value={formData.confirmar_contrasena}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Actualizando...' : 'Cambiar Contraseña'}
          </button>
        </form>
        <div className="cambiar-actions">
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

export default CambiarContrasenaPage;