import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import PacientesPage from './pages/PacientesPage';
import UsuariosPage from './pages/UsuariosPage';
import CitasPage from './pages/CitasPage';
import HorariosPage from './pages/HorariosPage';
import ExpedientesPage from './pages/ExpedientesPage';
import AgregarPacientePage from './pages/AgregarPacientePage';
import AgregarDiagnosticoPage from './pages/AgregarDiagnosticoPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-blue-600 text-white p-4">
          <ul className="flex space-x-4">
            <li><Link to="/pacientes">Pacientes</Link></li>
            <li><Link to="/expedientes">Expedientes</Link></li>
            <li><Link to="/usuarios">Usuarios</Link></li>
            <li><Link to="/citas">Citas</Link></li>
            <li><Link to="/horarios">Horarios</Link></li>
            <li><Link to="/agregar-paciente">Agregar Paciente</Link></li>
             <li><Link to="/agregar-diagnostico">Agregar Diagnóstico</Link></li> 
          </ul>
        </nav>

        <main className="p-4">
          <Routes>
            <Route path="/pacientes" element={<PacientesPage />} />
            <Route path="/expedientes" element={<ExpedientesPage />} />
            <Route path="/usuarios" element={<UsuariosPage />} />
            <Route path="/citas" element={<CitasPage />} />
            <Route path="/horarios" element={<HorariosPage />} />
            <Route path="/agregar-paciente" element={<AgregarPacientePage />} />
            <Route path="/agregar-diagnostico" element={<AgregarDiagnosticoPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;