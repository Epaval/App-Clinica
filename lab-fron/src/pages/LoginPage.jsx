import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/auth";
import ModalMensaje from "../components/ModalMensaje";

const LoginPage = ({ onLoginSuccess }) => { // Recibir la función
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    contrasena: "",
  });
  const [loading, setLoading] = useState(false);
  const [mensajeModal, setMensajeModal] = useState({
    isOpen: false,
    tipo: "",
    mensaje: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Manejar el envío del formulario de login
 const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    const response = await login(formData);
    const { token, rol, usuario_id, nombre, apellido } = response.data; // Asegúrate de que el backend devuelva nombre y apellido

    // Almacenar token, rol, usuario_id, nombre y apellido en localStorage
    localStorage.setItem("token", token);
    localStorage.setItem("rol", rol);
    localStorage.setItem("usuario_id", usuario_id);
    localStorage.setItem("nombre_usuario", nombre);
    localStorage.setItem("apellido_usuario", apellido);

    // ✅ Notificar al padre que el login fue exitoso
    onLoginSuccess && onLoginSuccess(token, rol);

    // Redirigir según rol
    switch (rol) {
      case "admin":
      case "jefe_medico":
        navigate("/pacientes");
        break;
      case "medico":
        navigate("/expedientes");
        break;
      case "asistente":
        navigate("/agregar-paciente");
        break;
      default:
        navigate("/");
    }
  } catch (err) {
    console.error("Error de login:", err);
    setMensajeModal({
      isOpen: true,
      tipo: "error",
      mensaje: "Credenciales inválidas. Por favor intenta de nuevo.",
    });
  } finally {
    setLoading(false);
  }
};

  const handleMensajeModalClose = () => {
    setMensajeModal({
      isOpen: false,
      tipo: "",
      mensaje: "",
    });
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h2>Iniciar Sesión</h2>
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
          <div className="form-group">
            <label htmlFor="contrasena">Contraseña:</label>
            <input
              type="password"
              id="contrasena"
              name="contrasena"
              value={formData.contrasena}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
          </button>
          <div className="login-actions">
            <button
              onClick={() => navigate("/recuperar-contrasena")}
              className="btn btn-link"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>
        </form>
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

export default LoginPage;