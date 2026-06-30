## Node es un runtime, no solo "JS en el servidor"

Node embebe V8 (el motor de JavaScript de Chrome) y le agrega **libuv**, una librería en C que da acceso a archivos, red y procesos del sistema operativo, todo de forma no bloqueante. Eso es lo que permite que un solo hilo de JavaScript maneje miles de conexiones simultáneas: mientras espera una respuesta de disco o red, libuv delega ese trabajo y avisa cuando está listo.

## Las fases del Event Loop

```
┌───────────────────────┐
│        timers          │  setTimeout, setInterval
├───────────────────────┤
│   pending callbacks    │
├───────────────────────┤
│        poll             │  recibe nuevos eventos de I/O
├───────────────────────┤
│        check            │  setImmediate
├───────────────────────┤
│    close callbacks      │
└───────────────────────┘
```

`process.nextTick()` y las microtasks de promesas se ejecutan **entre cada fase**, antes de pasar a la siguiente — tienen prioridad incluso sobre `setImmediate`.

```js
setTimeout(() => console.log("timeout"), 0);
setImmediate(() => console.log("immediate"));
process.nextTick(() => console.log("nextTick"));
Promise.resolve().then(() => console.log("promise"));
console.log("síncrono");

// Orden: síncrono, nextTick, promise, timeout/immediate (el orden entre estos dos últimos no está garantizado en el nivel superior)
```

## process y globales

```js
process.version;   // versión de Node
process.platform;  // darwin, linux, win32
process.argv;      // argumentos de línea de comandos
process.env.PORT;  // variables de entorno
```

`global` es el equivalente de `window` en el navegador, pero en Node casi nunca se usa directamente — los módulos son la forma idiomática de compartir código.
