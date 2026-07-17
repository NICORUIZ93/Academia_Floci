// Express — routing y middleware (Módulo 4): el mismo servidor de arriba, con Express.
const express = require('express');

const app = express();
app.use(express.json()); // middleware: parsea el body JSON antes de que llegue a las rutas

const tareas = [{ id: '1', titulo: 'Aprender Express' }];

// Middleware personalizado de logging: se ejecuta en TODAS las rutas, en orden,
// antes de llegar al handler final — next() pasa el control al siguiente middleware.
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

app.get('/tareas', (req, res) => {
  res.json(tareas);
});

app.get('/tareas/:id', (req, res) => {
  const tarea = tareas.find((t) => t.id === req.params.id);
  if (!tarea) {
    return res.status(404).json({ error: 'Tarea no encontrada' });
  }
  res.json(tarea);
});

app.post('/tareas', (req, res) => {
  const { titulo } = req.body;
  if (!titulo) {
    return res.status(400).json({ error: 'El campo titulo es obligatorio' });
  }
  const nueva = { id: String(tareas.length + 1), titulo };
  tareas.push(nueva);
  res.status(201).json(nueva);
});

// Middleware de manejo de errores: se reconoce por tener 4 parámetros (err primero).
// Express lo detecta por la aridad de la función, no por dónde se declara.
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

app.listen(3000, () => console.log('Express en http://localhost:3000'));
