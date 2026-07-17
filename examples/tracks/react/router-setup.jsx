// React Router — navegación (Módulo 5): rutas anidadas y navegación programática.
import { Link, Route, Routes, useNavigate, useParams } from 'react-router-dom';

function ListaTareas() {
  return (
    <ul>
      <li><Link to="/tareas/1">Tarea 1</Link></li>
      <li><Link to="/tareas/2">Tarea 2</Link></li>
    </ul>
  );
}

function DetalleTarea() {
  // useParams lee los segmentos dinámicos definidos en la ruta (":id" abajo).
  const { id } = useParams();
  const navegar = useNavigate();

  return (
    <div>
      <p>Detalle de la tarea {id}</p>
      {/* Navegación programática: útil tras una acción (guardar, borrar), no un click directo. */}
      <button onClick={() => navegar('/tareas')}>Volver al listado</button>
    </div>
  );
}

export function App() {
  return (
    <Routes>
      <Route path="/tareas" element={<ListaTareas />} />
      <Route path="/tareas/:id" element={<DetalleTarea />} />
    </Routes>
  );
}

// En el punto de entrada de la app:
//
// import { BrowserRouter } from 'react-router-dom';
// createRoot(document.getElementById('root')).render(
//   <BrowserRouter><App /></BrowserRouter>
// );
