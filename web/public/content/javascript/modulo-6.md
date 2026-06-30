## async/await

`async/await` es azúcar sintáctica sobre promesas: el código se lee como síncrono pero sigue siendo no bloqueante por debajo.

```js
async function obtenerUsuarios() {
  try {
    const respuesta = await fetch("https://jsonplaceholder.typicode.com/users");
    if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);
    return await respuesta.json();
  } catch (error) {
    console.error("No se pudo obtener usuarios:", error.message);
    return [];
  }
}
```

## AbortController: cancelar peticiones

```js
const controlador = new AbortController();
fetch(url, { signal: controlador.signal })
  .catch(error => { if (error.name === "AbortError") console.log("cancelada"); });

// en otra interacción del usuario (ej. nueva búsqueda):
controlador.abort();
```

## Reintentos con backoff

```js
async function fetchConReintentos(url, intentos = 3) {
  for (let i = 0; i < intentos; i++) {
    try {
      const respuesta = await fetch(url);
      if (respuesta.ok) return await respuesta.json();
    } catch { /* reintenta */ }
    await new Promise(r => setTimeout(r, 300 * (i + 1))); // backoff simple
  }
  throw new Error("Falló tras varios intentos");
}
```

## Timeout manual con Promise.race

```js
function conTimeout(promesa, ms) {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("timeout")), ms)
  );
  return Promise.race([promesa, timeout]);
}
```
