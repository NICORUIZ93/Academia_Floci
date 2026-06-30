## Router manual con History API

```js
function navegar(ruta) {
  history.pushState({}, "", ruta);
  render(ruta);
}

window.addEventListener("popstate", () => render(location.pathname));

document.body.addEventListener("click", (e) => {
  if (e.target.matches("[data-link]")) {
    e.preventDefault();
    navegar(e.target.getAttribute("href"));
  }
});
```

## Store propio

```js
function createStore(estadoInicial) {
  let estado = estadoInicial;
  const listeners = new Set();

  return {
    getState: () => estado,
    setState: (parcial) => {
      estado = { ...estado, ...parcial };
      listeners.forEach(fn => fn(estado));
    },
    subscribe: (fn) => { listeners.add(fn); return () => listeners.delete(fn); },
  };
}

const store = createStore({ usuarios: [], cargando: false });
store.subscribe(estado => render(estado)); // re-renderiza cuando cambia el estado
```

## Conectando todo

El patrón completo: una ruta activa determina qué vista renderizar; esa vista lee del store; las acciones del usuario (click, submit) llaman a `store.setState(...)` o disparan un `fetch`; cuando el fetch resuelve, actualiza el store, y el store notifica a la UI para volver a pintar.

Esto es, en esencia, lo que un framework como React o Angular automatiza por ti: el "binding" entre estado y DOM, el diffing eficiente, y el manejo del ciclo de vida. Construirlo a mano una vez ayuda a entender qué problema resuelve realmente cada framework antes de aprenderlo.
