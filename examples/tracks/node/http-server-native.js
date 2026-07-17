// Servidores HTTP nativos (Módulo 3): http.createServer sin ningún framework,
// para entender qué resuelve Express/Fastify antes de usarlos.
const http = require('node:http');
const { URL } = require('node:url');

const tareas = [{ id: '1', titulo: 'Aprender Node nativo' }];

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === 'GET' && url.pathname === '/tareas') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(tareas));
    return;
  }

  if (req.method === 'POST' && url.pathname === '/tareas') {
    // El body llega en chunks: hay que acumularlos manualmente y esperar el
    // evento 'end' — esto es exactamente lo que Express hace por debajo con
    // su middleware de parsing, pero aquí se ve explícito.
    let cuerpo = '';
    req.on('data', (chunk) => { cuerpo += chunk; });
    req.on('end', () => {
      const { titulo } = JSON.parse(cuerpo);
      const nueva = { id: String(tareas.length + 1), titulo };
      tareas.push(nueva);
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(nueva));
    });
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'No encontrado' }));
});

server.listen(3000, () => console.log('Servidor nativo en http://localhost:3000'));
