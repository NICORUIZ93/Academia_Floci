## Manipular el DOM

```js
const lista = document.querySelector("#lista");
const items = ["Pan", "Leche", "Huevos"];

for (const texto of items) {
  const li = document.createElement("li");
  li.textContent = texto;
  lista.appendChild(li);
}
```

## Delegación de eventos

En vez de un listener por cada `<li>` (caro si hay muchos y no funciona con elementos agregados después), escucha en el padre y revisa `event.target`:

```js
lista.addEventListener("click", (event) => {
  if (event.target.tagName === "LI") {
    event.target.classList.toggle("completado");
  }
});
```

## Formularios y validación nativa

```html
<input type="email" required pattern=".+@.+\..+" id="correo" />
```

```js
const input = document.querySelector("#correo");
input.addEventListener("invalid", () => {
  input.setCustomValidity("Ingresa un correo válido, ej. nombre@dominio.com");
});
input.addEventListener("input", () => input.setCustomValidity(""));
```

## localStorage e IntersectionObserver

```js
// Persistencia simple
input.addEventListener("input", e => localStorage.setItem("borrador", e.target.value));
input.value = localStorage.getItem("borrador") ?? "";

// Scroll infinito básico
const sentinela = document.querySelector("#sentinela");
new IntersectionObserver((entradas) => {
  if (entradas[0].isIntersecting) cargarMasResultados();
}).observe(sentinela);
```
