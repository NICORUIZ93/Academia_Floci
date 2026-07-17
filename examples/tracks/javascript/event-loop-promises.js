// Asincronía I — Event Loop y Promesas (Módulo 5).
// Ejecutar: node event-loop-promises.js — observa el orden de salida con atención.

console.log('1: síncrono');

setTimeout(() => console.log('4: macrotask (setTimeout)'), 0);

Promise.resolve().then(() => console.log('3: microtask (Promise)'));

console.log('2: síncrono');

// Orden de salida real: 1, 2, 3, 4 — no 1, 2, 4, 3.
//
// Por qué: el código síncrono corre primero y completo (call stack se vacía).
// Luego el event loop procesa TODA la cola de microtasks (Promises, queueMicrotask)
// antes de tocar la cola de macrotasks (setTimeout, setInterval, I/O) — aunque
// el setTimeout tenga delay 0, siempre pierde contra cualquier microtask pendiente.

// --- Encadenar promesas vs. anidarlas (pyramid of doom) ---
function obtenerUsuario(id) {
  return Promise.resolve({ id, nombre: 'Ana' });
}
function obtenerPedidos(usuarioId) {
  return Promise.resolve([{ id: 1, usuarioId }]);
}

// Encadenado: cada .then() recibe el resultado del anterior, plano y legible.
obtenerUsuario(1)
  .then((usuario) => obtenerPedidos(usuario.id))
  .then((pedidos) => console.log('Pedidos:', pedidos))
  .catch((error) => console.error('Error en la cadena:', error));

// Promise.race: se resuelve/rechaza con la PRIMERA promesa que termine —
// útil para implementar timeouts sobre una operación que no los tiene nativamente.
function conTimeout(promesa, ms) {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Timeout')), ms)
  );
  return Promise.race([promesa, timeout]);
}
