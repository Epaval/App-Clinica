import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ModalMensaje = ({ isOpen, onClose, tipo, mensaje, redirigirExpedientes = false }) => {
  const navigate = useNavigate();

  useEffect(() => {
    // Agregar clase al body para prevenir scroll cuando el modal está abierto
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Limpiar al desmontar
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    let timer;
    if (isOpen && tipo === 'exito') {
      // Cerrar el modal después de 2 segundos si es éxito
      timer = setTimeout(() => {
        onClose();
        if (redirigirExpedientes) {
          navigate('/expedientes');
        }
      }, 2000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isOpen, tipo, onClose, navigate, redirigirExpedientes]);

  if (!isOpen) return null;

  const getIcon = () => {
    switch (tipo) {
      case 'exito':
        return (
          <div className="mensaje-icon exito">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case 'error':
        return (
          <div className="mensaje-icon error">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        );
      case 'advertencia':
        return (
          <div className="mensaje-icon advertencia">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="modal-mensaje-overlay" onClick={tipo !== 'exito' ? onClose : null}>
      <div className="modal-mensaje-content" onClick={e => e.stopPropagation()}>
        <div className="modal-mensaje-body">
          {getIcon()}
          <h3 className={`mensaje-titulo ${tipo}`}>
            {tipo === 'exito' ? 'Éxito' : tipo === 'error' ? 'Error' : 'Advertencia'}
          </h3>
          <p className="mensaje-texto">{mensaje}</p>
          {tipo !== 'exito' && (
            <div className="mensaje-actions">
              <button 
                className="btn btn-primary" 
                onClick={onClose}
              >
                Aceptar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModalMensaje;