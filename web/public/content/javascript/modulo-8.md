# Módulo 8: El DOM y eventos del navegador

## Sílabo

**Objetivo general**

Entender cómo JavaScript manipula una página web real antes de depender de cualquier framework: selección y manipulación del DOM, delegación de eventos, formularios, y las Web APIs más usadas del navegador.

**Objetivos específicos**

1. Seleccionar y manipular elementos del DOM dinámicamente.
2. Aplicar delegación de eventos y explicar su ventaja de rendimiento.
3. Construir formularios con validación nativa.
4. Usar `localStorage`, `IntersectionObserver`, `ResizeObserver` y `MutationObserver`.
5. Aplicar `requestAnimationFrame` y `requestIdleCallback` apropiadamente.

**Contenido**

- Selección y manipulación del DOM.
- Delegación de eventos.
- Formularios y validación nativa.
- Web APIs: `localStorage`, `IntersectionObserver`.
- `ResizeObserver` y `MutationObserver`.
- `requestAnimationFrame` y `requestIdleCallback`.

**Evaluación**

Un componente de UI interactivo (lista filtrable) sin frameworks, solo DOM API, más tres ejercicios de evaluación.

---

## Contenido teórico

### Tema 1: Selección y manipulación del DOM

**Conceptos clave:** DOM como árbol de nodos, `querySelector`, creación dinámica de elementos.

El DOM (Document Object Model) es la representación en forma de árbol de nodos que el navegador construye a partir del HTML de una página, y que JavaScript puede consultar y modificar dinámicamente en tiempo de ejecución. `document.querySelector(selector)` y `document.querySelectorAll(selector)` son los métodos modernos y preferidos para seleccionar elementos, aceptando cualquier selector CSS válido (incluyendo combinadores complejos), y devolviendo respectivamente el primer elemento coincidente o una `NodeList` estática con todos los coincidentes, reemplazando métodos más antiguos y específicos como `getElementById` o `getElementsByClassName` en la mayoría de código nuevo, precisamente por la flexibilidad de aceptar cualquier selector CSS.

Crear elementos dinámicamente sigue un patrón consistente: `document.createElement(tag)` crea un nuevo elemento desconectado del árbol del documento; se configuran sus propiedades (`textContent`, atributos, clases); y finalmente se inserta en su posición deseada del árbol con métodos como `appendChild`, `prepend`, o el más moderno y flexible `insertAdjacentElement`. Es importante usar `textContent` en vez de `innerHTML` cuando se inserta texto proveniente de datos (especialmente si esos datos provienen de una fuente no completamente confiable, como la entrada de un usuario), porque `innerHTML` interpreta el string como HTML, abriendo la puerta a un ataque de XSS (Cross-Site Scripting, que se estudiará en el Módulo 10) si el string contiene marcado malicioso; `textContent` siempre trata el valor como texto plano literal, sin ningún riesgo de interpretación como HTML ejecutable.

Insertar elementos uno por uno dentro de un bucle, cada uno con su propia llamada a `appendChild`, provoca múltiples "reflows" (recálculos del layout de la página) si se hace de forma ingenua directamente sobre un elemento ya insertado en el documento visible; una técnica de optimización común es construir la estructura completa en un `DocumentFragment` (un contenedor ligero que vive fuera del árbol visible del documento) y añadir todos los elementos hijos a ese fragmento primero, insertando finalmente el fragmento completo de una sola vez en el documento real, provocando un único reflow en vez de uno por cada elemento insertado individualmente.

Dominar la manipulación directa del DOM, aunque frameworks como Angular o React (estudiados en sus tracks correspondientes) automatizan gran parte de este trabajo mediante mecanismos de renderizado declarativo, sigue siendo relevante: entender qué ocurre realmente "por debajo" de esos frameworks facilita diagnosticar problemas de rendimiento y entender por qué ciertos patrones de esos frameworks (como las claves en listas renderizadas) existen precisamente para optimizar estas mismas operaciones de bajo nivel sobre el DOM real.

**Analogía:** manipular el DOM directamente es como reorganizar los muebles de una habitación físicamente, uno por uno; usar un `DocumentFragment` para insertar varios elementos de golpe es como preparar completamente una habitación entera en un espacio separado antes de trasladarla de una sola vez a su ubicación final, evitando reorganizar la habitación real visible varias veces de forma incremental y costosa.

**¿Por qué es importante?** Entender la manipulación directa del DOM es la base indispensable para comprender qué automatizan realmente los frameworks de UI, y sigue siendo directamente relevante para cualquier optimización de rendimiento de bajo nivel en aplicaciones reales.

**Diagrama:**

```js
const fragmento = document.createDocumentFragment();
for (const texto of items) {
  const li = document.createElement("li");
  li.textContent = texto; // seguro: nunca interpreta texto como HTML
  fragmento.appendChild(li);
}
lista.appendChild(fragmento); // un único reflow, no uno por elemento
```

### Tema 2: Delegación de eventos

**Conceptos clave:** delegación, `event.target`, eficiencia con elementos dinámicos.

Añadir un listener de evento individual a cada uno de muchos elementos similares (por ejemplo, cada `<li>` de una lista larga) tiene dos desventajas concretas: consume memoria adicional proporcional al número de elementos (cada listener registrado ocupa recursos), y no funciona automáticamente para elementos añadidos dinámicamente después de que los listeners iniciales se registraron, requiriendo volver a añadir un listener manualmente a cada nuevo elemento creado posteriormente. La delegación de eventos resuelve ambos problemas aprovechando que los eventos del DOM se propagan (hacen "bubbling") desde el elemento donde ocurrieron hacia sus ancestros en el árbol: registrar un único listener en un elemento contenedor (el `<ul>` padre, por ejemplo) permite capturar clics ocurridos en cualquiera de sus elementos hijos, actuales o futuros, sin necesidad de un listener individual por cada uno.

Dentro del listener del contenedor, `event.target` identifica exactamente cuál de los elementos hijos disparó el evento originalmente (el elemento específico donde ocurrió el clic, no el contenedor donde el listener está registrado), permitiendo distinguir y actuar de forma específica según qué hijo particular fue el origen real del evento. Esto requiere típicamente verificar la etiqueta o clase del `event.target` (`if (event.target.tagName === "LI")` o `event.target.matches(".item")`) para asegurarse de que el clic ocurrió efectivamente sobre un elemento hijo relevante, y no sobre el propio contenedor o algún elemento intermedio no relevante para la lógica del listener.

Este patrón es especialmente valioso para listas dinámicas donde elementos se añaden o eliminan constantemente: sin delegación, cada elemento nuevo requeriría registrar explícitamente su propio listener en el momento de su creación (y, con la misma disciplina, eliminar ese listener cuando el elemento se remueve, para evitar fugas de memoria por listeners huérfanos); con delegación, el único listener registrado en el contenedor padre automáticamente cubre cualquier elemento hijo presente en cualquier momento, presente o futuro, sin ningún trabajo adicional de gestión de listeners individuales.

Frameworks modernos de UI (React, notablemente) usan delegación de eventos internamente de forma sistemática precisamente por estas ventajas, registrando típicamente un único listener a nivel de la raíz de la aplicación completa y despachando internamente los eventos hacia los componentes correspondientes según su lógica interna de reconciliación, en vez de registrar listeners individuales de DOM real por cada elemento de la interfaz.

**Analogía:** la delegación de eventos es como tener un único recepcionista en la entrada principal de un edificio que registra y dirige a cualquier visitante hacia el departamento correcto, en vez de asignar un recepcionista dedicado y permanente a la puerta de cada oficina individual del edificio, incluyendo oficinas que aún no existen pero que podrían construirse en el futuro.

**¿Por qué es importante?** La delegación de eventos es más eficiente en memoria y funciona automáticamente con elementos añadidos dinámicamente después del registro inicial del listener, siendo el patrón estándar recomendado para listas y colecciones de elementos similares en JavaScript sin frameworks.

**Diagrama:**

```js
lista.addEventListener("click", (event) => {
  if (event.target.tagName === "LI") {          // identifica el hijo específico
    event.target.classList.toggle("completado");
  }
}); // UN SOLO listener cubre cualquier <li>, presente o añadido después
```

### Tema 3: Formularios y validación nativa

**Conceptos clave:** atributos de validación HTML, `setCustomValidity`, eventos `invalid` e `input`.

HTML ofrece validación nativa de formularios mediante atributos declarativos —`required` (obligatorio), `pattern` (una expresión regular que el valor debe cumplir), `min`/`max` (límites numéricos), `type="email"` (formato de correo)— que el navegador verifica automáticamente antes de permitir el envío del formulario, sin necesidad de escribir lógica de validación en JavaScript para los casos más comunes cubiertos por estos atributos estándar. El navegador muestra automáticamente un mensaje de error predeterminado (con estilo y texto que varían según el navegador y el idioma configurado del usuario) cuando un campo no cumple su validación al intentar enviar el formulario.

`setCustomValidity(mensaje)` permite personalizar el mensaje de error mostrado por la validación nativa, reemplazando el mensaje genérico predeterminado del navegador por uno específico y más útil para el contexto de la aplicación; invocar `setCustomValidity("")` (una cadena vacía) marca el campo como nuevamente válido, siendo necesario limpiar explícitamente cualquier mensaje personalizado previo cuando el usuario corrige el valor, típicamente escuchando el evento `input` para reevaluar y limpiar la validez en cada cambio, mientras el evento `invalid` se dispara específicamente en el momento en que el navegador determina que el campo no es válido al intentar el envío.

Aunque la validación nativa cubre gran parte de los casos comunes, validaciones más complejas (que dependen de comparar el valor de un campo con otro, o de una verificación asíncrona contra un servidor, como comprobar si un nombre de usuario ya está en uso) requieren lógica de JavaScript adicional, típicamente combinada con `setCustomValidity` para integrar esa lógica personalizada dentro del mismo mecanismo de validación nativa del navegador, en vez de construir un sistema de validación completamente separado y paralelo al comportamiento nativo esperado del formulario.

Confiar en la validación nativa del lado del cliente nunca reemplaza la necesidad de validar también en el servidor: la validación del navegador es una mejora de experiencia de usuario (feedback inmediato sin esperar un viaje de red completo), pero un cliente malicioso o simplemente una petición HTTP directa sin pasar por el formulario del navegador puede saltarse completamente cualquier validación del lado del cliente, haciendo que la validación del lado del servidor sea la única garantía real e ineludible de integridad de los datos recibidos.

**Analogía:** la validación nativa del navegador es como un guardia de seguridad en la entrada de un edificio que revisa visualmente que los visitantes cumplan un código de vestimenta básico antes de dejarlos pasar, dando feedback inmediato en el momento; pero la verificación de identidad realmente seria y definitiva ocurre después, dentro del edificio (el servidor), donde no se puede confiar únicamente en lo que el guardia de la entrada ya aprobó superficialmente.

**¿Por qué es importante?** La validación nativa reduce significativamente la cantidad de JavaScript necesario para casos comunes de formularios, mejorando la experiencia del usuario con feedback inmediato, aunque nunca sustituye la validación obligatoria del lado del servidor.

**Diagrama:**

```html
<input type="email" required pattern=".+@.+\..+" id="correo" />
```
```js
input.addEventListener("invalid", () => {
  input.setCustomValidity("Ingresa un correo válido, ej. nombre@dominio.com");
});
input.addEventListener("input", () => input.setCustomValidity("")); // limpia al corregir
```

### Tema 4: Web APIs — localStorage e IntersectionObserver

**Conceptos clave:** persistencia simple del lado del cliente, observación eficiente de visibilidad.

`localStorage` proporciona una forma simple de persistir datos como strings en el navegador del usuario, sobreviviendo entre recargas de página e incluso entre sesiones completas del navegador (a diferencia de `sessionStorage`, que se limpia al cerrar la pestaña), útil para casos como recordar preferencias del usuario o guardar un borrador de formulario sin necesidad de un servidor. Es importante recordar que `localStorage` solo almacena strings: guardar objetos requiere serializarlos explícitamente con `JSON.stringify()` antes de guardar, y deserializarlos con `JSON.parse()` al leer, y que su capacidad es limitada (típicamente unos pocos megabytes según el navegador), inapropiado para almacenar volúmenes grandes de datos.

`IntersectionObserver` es una API moderna y eficiente para detectar cuándo un elemento entra o sale del viewport visible (o de cualquier otro elemento contenedor especificado), reemplazando el patrón anterior, mucho menos eficiente, de escuchar el evento `scroll` y calcular manualmente en cada disparo si un elemento específico está visible (una operación costosa si se ejecuta en cada uno de los muchos eventos de scroll que ocurren durante un desplazamiento continuo del usuario). En vez de eso, `IntersectionObserver` notifica de forma asíncrona y eficiente, gestionada internamente por el navegador, exactamente cuándo ocurre un cambio real de intersección, sin necesidad de recalcular constantemente en cada pequeño movimiento de scroll.

El caso de uso más común de `IntersectionObserver` es el scroll infinito: colocar un elemento "sentinela" invisible al final de una lista de resultados, y observar cuándo ese sentinela se vuelve visible en el viewport (indicando que el usuario se ha desplazado hasta cerca del final de la lista actual), disparando en ese momento la carga de más resultados adicionales, típicamente mediante una petición a una API (Módulo 6). Otro uso frecuente es implementar "lazy loading" de imágenes: cargar la imagen real de un elemento solo cuando ese elemento se acerca a entrar en el viewport visible, en vez de cargar todas las imágenes de la página completa desde el inicio, mejorando el tiempo de carga inicial percibido.

Ambas APIs —`localStorage` e `IntersectionObserver`— ilustran un principio recurrente en el diseño de APIs modernas del navegador: preferir mecanismos declarativos y eficientes gestionados internamente por el navegador (observadores) sobre patrones imperativos que requieren que el propio JavaScript de la aplicación recalcule constantemente el estado relevante en respuesta a eventos de alta frecuencia como el scroll.

**Analogía:** `localStorage` es como una libreta personal que cada visitante deja guardada en su propia casillero al salir de un edificio, disponible de nuevo exactamente donde la dejó en su próxima visita; `IntersectionObserver` es como un sensor de movimiento inteligente que notifica automáticamente cuando algo entra en un área específica, en vez de requerir que alguien revise constantemente y de forma manual esa área cada fracción de segundo.

**¿Por qué es importante?** `IntersectionObserver` es sustancialmente más eficiente que escuchar `scroll` manualmente para detectar visibilidad, y `localStorage` es la forma más simple de persistencia del lado del cliente sin requerir un backend, ambas ampliamente usadas en interfaces web reales.

**Diagrama:**

```js
input.addEventListener("input", e => localStorage.setItem("borrador", e.target.value));
input.value = localStorage.getItem("borrador") ?? "";

new IntersectionObserver((entradas) => {
  if (entradas[0].isIntersecting) cargarMasResultados(); // scroll infinito eficiente
}).observe(sentinela);
```

### Tema 5: ResizeObserver y MutationObserver

**Conceptos clave:** observación de cambios de tamaño y de cambios en el árbol del DOM.

`ResizeObserver` notifica de forma eficiente cuándo el tamaño de un elemento observado cambia, ya sea por una acción directa del usuario (redimensionar la ventana del navegador) o indirectamente por cambios de layout provocados por otro contenido de la página (como una imagen que termina de cargar y empuja el tamaño de un contenedor adyacente). Antes de esta API, detectar cambios de tamaño de un elemento específico (no de toda la ventana) requería trucos indirectos y menos confiables, como escuchar el evento `resize` global de la ventana y recalcular manualmente el tamaño de cada elemento de interés, un enfoque que además no capturaba cambios de tamaño provocados por causas distintas al redimensionamiento de la ventana completa.

`MutationObserver` notifica cuándo el árbol del DOM cambia dentro de un elemento observado: adición o eliminación de nodos hijos, cambios de atributos, o cambios de texto, según qué tipos de mutación se configuren explícitamente al crear el observador. Este mecanismo es útil para reaccionar a cambios en el DOM provocados por código externo sobre el que no se tiene control directo (por ejemplo, una biblioteca de terceros que inserta contenido dinámicamente en un contenedor específico), permitiendo ejecutar lógica propia en respuesta a esos cambios sin necesidad de modificar el código de esa biblioteca externa directamente.

Ambos observadores comparten un patrón de diseño común con `IntersectionObserver` (Tema 4): en vez de sondear activamente el estado (verificar repetidamente y de forma manual si algo cambió, un patrón costoso e ineficiente conocido como "polling"), se registra un callback una única vez, y el navegador se encarga internamente de notificar de forma eficiente y asíncrona exactamente cuándo ocurre el cambio relevante, sin desperdiciar ciclos de procesamiento en verificaciones innecesarias cuando nada ha cambiado realmente.

Es importante desconectar estos observadores explícitamente (`observer.disconnect()`) cuando el elemento que observan se elimina de la página o cuando la lógica que depende de ellos ya no es necesaria, para evitar que el observador siga consumiendo recursos innecesariamente de forma indefinida, un descuido de limpieza que, aunque no cause errores visibles inmediatos, puede acumular overhead innecesario en aplicaciones de larga duración con muchos componentes creándose y destruyéndose dinámicamente.

**Analogía:** `ResizeObserver` es como un sastre que automáticamente te notifica en cuanto detecta que tu talla cambió, sin que tengas que medirte constantemente tú mismo; `MutationObserver` es como una cámara de seguridad que notifica automáticamente cualquier cambio específico en una habitación vigilada (algo que entra, sale, o se mueve), sin necesidad de revisar manualmente la habitación cada cierto tiempo para comprobar si algo cambió.

**¿Por qué es importante?** Estos observadores permiten reaccionar eficientemente a cambios de tamaño o de estructura del DOM sin recurrir a sondeo costoso e ineficiente, un patrón de diseño consistente y recomendado en las Web APIs modernas del navegador.

**Diagrama:**

```js
new ResizeObserver(entradas => {
  console.log("nuevo tamaño:", entradas[0].contentRect);
}).observe(contenedor);

new MutationObserver(mutaciones => {
  console.log(`${mutaciones.length} cambios detectados en el DOM observado`);
}).observe(contenedor, { childList: true, attributes: true });
```

### Tema 6: requestAnimationFrame y requestIdleCallback

**Conceptos clave:** sincronización con el ciclo de renderizado, trabajo de baja prioridad en tiempo ocioso.

`requestAnimationFrame(callback)` programa la ejecución de `callback` justo antes de que el navegador realice el siguiente repintado visual de la página, típicamente sincronizado con la frecuencia de actualización de la pantalla del usuario (comúnmente 60 veces por segundo). Esto lo hace la herramienta correcta para cualquier animación programada directamente en JavaScript (en vez de usar animaciones CSS, que suelen ser preferibles cuando son suficientes para el efecto deseado): usar `setTimeout` con un intervalo fijo para animaciones produce resultados visualmente inconsistentes, porque no está sincronizado con el ciclo real de repintado del navegador y puede disparar la actualización en momentos que no coinciden con cuándo el navegador realmente va a repintar la pantalla, mientras que `requestAnimationFrame` garantiza que cada actualización de la animación ocurra exactamente en sincronía con un repintado real, evitando tanto actualizaciones desperdiciadas (que ocurren pero nunca se muestran porque el navegador aún no repintó) como saltos visuales perceptibles.

`requestIdleCallback(callback)` programa la ejecución de `callback` durante un período de tiempo en que el navegador está genuinamente ocioso (sin trabajo urgente pendiente de renderizado o de respuesta a interacción del usuario), siendo apropiado para trabajo de baja prioridad que puede posponerse sin afectar la experiencia percibida por el usuario, como el registro de analíticas no urgentes, pre-cálculos especulativos que podrían no llegar a necesitarse, o limpieza de datos en segundo plano. El callback recibe un objeto con información sobre cuánto tiempo restante de ociosidad está disponible, permitiendo que el propio código decida ceder el control de vuelta al navegador antes de que ese tiempo se agote, en vez de monopolizar el hilo principal con trabajo prolongado que podría retrasar una interacción urgente del usuario que llegue en medio de esa ejecución.

Elegir entre estos dos mecanismos según la naturaleza del trabajo —visualmente crítico y sincronizado con el repintado (`requestAnimationFrame`) frente a genuinamente prescindible y de baja prioridad (`requestIdleCallback`)— es importante para no congestionar innecesariamente el hilo principal de JavaScript con trabajo que compite por los mismos recursos que la interactividad y la fluidez visual que el usuario percibe directamente, una consideración de rendimiento particularmente relevante en aplicaciones con animaciones complejas o con volúmenes grandes de procesamiento de datos en segundo plano.

Ambas APIs, junto con los observadores del Tema 5, forman parte de un conjunto más amplio de herramientas del navegador diseñadas específicamente para que el código de la aplicación pueda cooperar de forma eficiente con el ciclo de renderizado y con la disponibilidad real de recursos del navegador, en vez de competir ciegamente por el hilo único de JavaScript sin ninguna consideración de prioridad o de sincronización con el repintado visual real.

**Analogía:** `requestAnimationFrame` es como sincronizar cada paso de un bailarín exactamente con el compás de la música (el ciclo de repintado del navegador), garantizando que cada movimiento se vea fluido y en el momento correcto; `requestIdleCallback` es como aprovechar los momentos de pausa genuina entre tareas urgentes de un equipo de trabajo para adelantar tareas de baja prioridad que pueden esperar, sin interrumpir nunca el trabajo urgente cuando este llega.

**¿Por qué es importante?** Usar la API correcta según la naturaleza del trabajo —animaciones sincronizadas frente a trabajo de baja prioridad diferible— evita competir innecesariamente por recursos del hilo principal con la interactividad y fluidez visual que el usuario percibe directamente.

**Diagrama:**

```js
function animar() {
  moverElementoUnPaso();
  requestAnimationFrame(animar); // sincronizado con el repintado real del navegador
}
requestAnimationFrame(animar);

requestIdleCallback((deadline) => {
  while (deadline.timeRemaining() > 0 && hayTrabajoPendiente()) {
    procesarSiguienteTareaDeBajaPrioridad();
  }
});
```

---

## Laboratorio práctico

**Objetivo del laboratorio:** construir un componente de UI interactivo (lista filtrable con scroll infinito) usando exclusivamente DOM API, sin ningún framework.

**Requisitos previos:** un navegador moderno, Módulos 0-7 completados.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Renderizar una lista dinámica desde un array | Ver Tema 1 | Usa un `DocumentFragment` para inserción eficiente |
| 2 | Aplicar delegación de eventos en el `<ul>` padre | Ver Tema 2 | Verifica que funciona con elementos añadidos después |
| 3 | Construir un formulario con validación nativa | `required`, `pattern`, `setCustomValidity` | Muestra mensajes de error personalizados |
| 4 | Persistir el texto de un input en `localStorage` | Ver Tema 4 | Recupera el valor al recargar la página |
| 5 | Implementar scroll infinito con `IntersectionObserver` | Elemento sentinela al final de la lista | Carga más resultados al acercarse al final |
| 6 | Construir la lista filtrable completa | Input de búsqueda que oculta/muestra `<li>` según coincidencia | Sin ningún framework, solo DOM API |

**Verificación:** el laboratorio se considera exitoso si la lista filtrable responde correctamente a la búsqueda en tiempo real, si la delegación de eventos funciona con elementos añadidos dinámicamente después de la carga inicial, y si el scroll infinito dispara la carga de más resultados exactamente al acercarse al final de la lista visible.

**Errores comunes y soluciones**

- **Usar `innerHTML` con datos de usuario sin sanitizar.** Usa `textContent` cuando el contenido es texto plano, para evitar el riesgo de XSS (se profundizará en el Módulo 10).
- **Registrar un listener individual por cada elemento de una lista larga.** Usa delegación de eventos en el contenedor padre en su lugar.
- **Olvidar desconectar un `IntersectionObserver`/`MutationObserver`/`ResizeObserver` cuando el elemento observado se elimina.** Llama a `.disconnect()` explícitamente para evitar overhead innecesario acumulado.

---

## Ejercicios de evaluación

### Ejercicio 1: Justificar la delegación de eventos

**Enunciado:** explica por qué la delegación de eventos es más eficiente que un listener por elemento, usando un ejemplo concreto de una lista de 10,000 elementos donde nuevos elementos se añaden dinámicamente cada pocos segundos.

**Solución esperada:** con un listener por elemento, cada uno de los 10,000 elementos consume memoria adicional para su propio listener registrado, y cada nuevo elemento añadido dinámicamente requeriría registrar manualmente un nuevo listener explícito. Con delegación, un único listener registrado en el contenedor padre cubre automáticamente los 10,000 elementos existentes y cualquier elemento añadido después, sin memoria adicional proporcional al número de elementos ni necesidad de gestión manual de listeners para elementos nuevos.

**Criterios de éxito:**
- Explica correctamente el ahorro de memoria proporcional al número de elementos.
- Explica que la delegación cubre automáticamente elementos añadidos dinámicamente después del registro inicial.

### Ejercicio 2: localStorage frente a sessionStorage

**Enunciado:** explica la diferencia entre `localStorage` y `sessionStorage`, y da un ejemplo de un caso de uso apropiado para cada uno.

**Solución esperada:** `localStorage` persiste indefinidamente entre recargas y sesiones del navegador hasta que se borra explícitamente; `sessionStorage` se limpia automáticamente al cerrar la pestaña o ventana. Un caso apropiado para `localStorage` es recordar la preferencia de tema (claro/oscuro) del usuario a largo plazo; un caso apropiado para `sessionStorage` es mantener el estado temporal de un formulario multi-paso solo durante la sesión actual de llenado, sin necesidad de persistirlo más allá de esa sesión específica.

**Criterios de éxito:**
- Explica correctamente la diferencia de persistencia entre ambos.
- Da un ejemplo apropiado y bien justificado para cada uno.

### Ejercicio 3: Elegir la API de observación correcta

**Enunciado:** para cada uno de estos tres escenarios, indica qué observador usarías: (a) cargar más resultados cuando el usuario se acerca al final de una lista, (b) reaccionar cuando una biblioteca externa inserta un banner publicitario dentro de un contenedor específico, (c) ajustar el layout de un componente cuando su contenedor cambia de tamaño por un redimensionamiento de la ventana.

**Solución esperada:** (a) `IntersectionObserver`, para detectar cuándo un elemento sentinela se vuelve visible; (b) `MutationObserver`, para detectar la inserción de nuevos nodos dentro del contenedor observado; (c) `ResizeObserver`, para detectar cambios de tamaño del elemento contenedor específico.

**Criterios de éxito:**
- Asigna correctamente cada uno de los tres observadores a su escenario correspondiente.
- Justifica brevemente por qué cada observador es apropiado para ese escenario específico.

---

## Resumen del módulo

**Puntos clave**

- `querySelector`/`querySelectorAll` y `createElement` son la base de la manipulación dinámica del DOM; `DocumentFragment` optimiza inserciones múltiples.
- La delegación de eventos, aprovechando el bubbling, es más eficiente en memoria y funciona automáticamente con elementos dinámicos futuros.
- La validación nativa de formularios (`required`, `pattern`, `setCustomValidity`) cubre casos comunes sin JavaScript adicional, pero nunca reemplaza la validación del servidor.
- `localStorage` persiste datos simples entre sesiones; `IntersectionObserver` detecta visibilidad de forma eficiente sin sondeo de scroll.
- `ResizeObserver` y `MutationObserver` notifican eficientemente cambios de tamaño y de estructura del DOM.
- `requestAnimationFrame` sincroniza animaciones con el repintado real; `requestIdleCallback` programa trabajo de baja prioridad en tiempo ocioso.

**Conceptos aprendidos**

- Manipulación eficiente del DOM y su relación con lo que automatizan los frameworks.
- Delegación de eventos como patrón estándar recomendado.
- Validación nativa de formularios.
- Las Web APIs de observación (`Intersection`/`Resize`/`Mutation`) y `localStorage`.
- Sincronización con el ciclo de renderizado y trabajo de baja prioridad.

**Próximos pasos**

En el Módulo 9 aprenderás testing y calidad de código: Vitest, mocks/spies, ESLint/Prettier, y cómo medir cobertura de código de forma significativa.

**Recursos adicionales**

- MDN Web Docs: "Document Object Model", "Event delegation", "Constraint validation", "IntersectionObserver".
- web.dev (Google): guías sobre rendimiento de renderizado y `requestIdleCallback`.
