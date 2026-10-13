import http from 'node:http';
import pg from 'pg';
const pool = new pg.Pool({ connectionTimeoutMillis: 2000 });
// La comprobación inicial falla explícitamente si la DB no está lista.
await pool.query('SELECT 1');
console.log('DB lista; iniciando API');
const server = http.createServer(async (_request, response) => {
  try {
    const result = await pool.query('SELECT 1 AS disponible');
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify(result.rows[0]));
  } catch {
    response.writeHead(503); response.end('DB no disponible');
  }
});
server.listen(3000, '0.0.0.0');
process.on('SIGTERM', () => server.close(() => pool.end()));
