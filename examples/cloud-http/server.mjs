import { createServer } from 'node:http';
const server = createServer((request, response) => {
  const found = request.method === 'GET' && request.url === '/salud';
  response.writeHead(found ? 200 : 404, { 'Content-Type': 'application/json' });
  response.end(JSON.stringify(found ? { estado: 'ok' } : { error: 'No encontrado' }));
});
server.listen(Number(process.env.PORT ?? 3000), '127.0.0.1', () => {
  console.log(`Servidor en http://127.0.0.1:${server.address().port}`);
});
process.on('SIGTERM', () => server.close());
