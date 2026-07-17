// El DOM y eventos del navegador (Módulo 8): delegación de eventos.
// Este archivo asume un navegador (usa `document`); no se ejecuta con `node`.
// Pégalo en un <script> junto a un <ul id="lista-tareas"> en el HTML.

const lista = document.getElementById('lista-tareas');

// Delegación de eventos: UN solo listener en el contenedor padre, en vez de un
// listener por cada <li> individual. Funciona incluso con elementos añadidos
// dinámicamente DESPUÉS de que el listener se registró, porque el evento burbujea
// (bubbles) desde el elemento clicado hasta el contenedor donde escuchamos.
lista.addEventListener('click', (evento) => {
  const boton = evento.target.closest('button.completar');
  if (!boton) return; // el click fue en otra parte del <li>, no en el botón

  const li = boton.closest('li');
  li.classList.toggle('completada');
});

function agregarTarea(titulo) {
  const li = document.createElement('li');
  li.innerHTML = `
    <span>${titulo}</span>
    <button class="completar">Completar</button>
  `;
  // Este <li> nuevo también dispara el listener delegado de arriba, sin
  // necesidad de volver a llamar addEventListener sobre él.
  lista.appendChild(li);
}

// IntersectionObserver: detecta cuándo un elemento entra/sale del viewport,
// sin escuchar el evento 'scroll' manualmente (mucho más eficiente).
const observador = new IntersectionObserver(
  (entradas) => {
    entradas.forEach((entrada) => {
      if (entrada.isIntersecting) {
        entrada.target.classList.add('visible');
      }
    });
  },
  { threshold: 0.5 } // se dispara cuando el 50% del elemento es visible
);

document.querySelectorAll('.animado-al-scroll').forEach((el) => observador.observe(el));
