# Módulo 12: Proyecto integrador — SPA sin framework

## Sílabo

**Objetivo general**

Demostrar dominio de los fundamentos de JavaScript construyendo una Single Page Application real y funcional sin depender de Angular, React ni Vue, integrando routing manual, gestión de estado propia, y consumo de una API real.

**Objetivos específicos**

1. Implementar un router manual con la History API para múltiples rutas.
2. Construir un store propio que notifique a la UI cuando el estado cambia.
3. Conectar el store a una API real con manejo explícito de estados de carga y error.
4. Renderizar vistas actualizando el DOM manualmente según la ruta activa y el estado.
5. Generar y auditar un build de producción optimizado con Vite.

**Contenido**

- Routing manual con History API.
- Estado de aplicación con un store propio.
- Consumo de una API real con manejo de errores.
- Build de producción optimizado.

**Evaluación**

Una SPA funcional (varias vistas, estado compartido, datos reales) sin ningún framework de UI, más tres ejercicios de evaluación.

---

## Comienza desde cero: prepara este capítulo

Este recorrido parte de una carpeta vacía. Al finalizar tendrás **Una SPA funcional (varias vistas, estado compartido, datos reales) sin ningún framework de UI, más tres ejercicios de evaluación.** No avances ejecutando comandos que no comprendes: primero identifica la entrada, la transformación y la evidencia que comprobará el resultado.

### 1. Comprueba las herramientas

Los comandos funcionan en macOS, Linux y WSL. En PowerShell usa el equivalente indicado por la herramienta.

```bash
node --version
npm --version
git --version
```

Si un comando no existe, detente e instala esa herramienta desde su sitio oficial. Cierra y abre la terminal después de modificar `PATH`. Las versiones deben ser compatibles entre sí antes de crear archivos.

### 2. Crea o recupera el proyecto del track

```bash
npm create vite@latest academia-labs/javascript -- --template vanilla-ts
cd academia-labs/javascript
npm install
git init
```

Trabaja dentro de `academia-labs/javascript`. Si ya existe, no lo vuelvas a generar: entra en la carpeta, confirma `git status` y continúa sobre una rama propia.

### 3. Ubica cada tema antes de escribir

```text
academia-labs/javascript/
├─ src/
│  └─ module-12/
├─ tests/
├─ docs/decisions/
├─ evidence/module-12/
└─ README.md
```

| Tema | Archivo o decisión | Evidencia mínima |
|---|---|---|
| 1. Routing manual con History API | `src/module-12/topic-1-routing-manual-con-history-api.ts` | prueba + salida observable |
| 2. Estado de aplicación con un store propio | `src/module-12/topic-2-estado-de-aplicacion-con-un-store-propio.ts` | prueba + salida observable |
| 3. Consumo de una API real con manejo de errores | `src/module-12/topic-3-consumo-de-una-api-real-con-manejo-de-errores.ts` | prueba + salida observable |
| 4. Conectando todo — el patrón completo de una SPA | `src/module-12/topic-4-conectando-todo-el-patron-completo-de-una-spa.ts` | prueba + salida observable |

Un ejemplo técnico vive en el archivo indicado y debe tener una prueba. Un tema conceptual vive en `docs/decisions/`: compara opciones usando restricciones medibles; no escribas código decorativo solo para llenar espacio.

### 4. Ejecuta una línea base

Desde `academia-labs/javascript`:

```bash
npm test && npm run dev
```

**Resultado esperado:** el comando reconoce el proyecto y termina sin errores antes de introducir el cambio del capítulo. Después del incremento, la evidencia debe demostrar: **Una SPA funcional (varias vistas, estado compartido, datos reales) sin ningún framework de UI, más tres ejercicios de evaluación.**

Si falla la línea base, no continúes. Localiza el primer mensaje que indique archivo, línea o dependencia; formula una causa y compruébala con un cambio pequeño.

### 5. Provoca un fallo y recupérate

Prueba un valor límite, un tipo inesperado o una operación fuera de orden; compara la salida con tu predicción. Guarda en `evidence/module-12/` el comando, la salida relevante, tu hipótesis y la corrección. Revierte únicamente el cambio deliberado; no borres todo el proyecto para ocultar la causa.

### 6. Conecta el capítulo con RutaFlow

Aplica el aprendizaje de **Proyecto integrador — SPA sin framework** a un incremento vertical de RutaFlow. Define qué componente produce el dato, qué contrato lo transporta, quién lo consume y cómo observarás un fallo. La entrega final incluye archivo o decisión, prueba, salida, error corregido y una limitación que todavía validarías en producción.

---

## Contenido teórico

### Tema 1: Routing manual con History API

**Conceptos clave:** `history.pushState`, evento `popstate`, navegación sin recarga completa.

Una Single Page Application (SPA) mantiene la ilusión de navegación entre "páginas" distintas sin que el navegador realice una recarga completa del documento HTML en cada cambio de ruta, algo que requiere gestionar manualmente tanto la URL visible en la barra de direcciones como el contenido renderizado en pantalla, sincronizados entre sí de forma coherente. La History API del navegador, específicamente `history.pushState(estado, titulo, nuevaURL)`, permite cambiar la URL visible en la barra de direcciones sin disparar ninguna recarga de página, añadiendo además una nueva entrada al historial de navegación del navegador, de modo que el botón de retroceso del navegador funcione de forma coherente con esta navegación simulada.

El evento `popstate`, disparado en `window` cuando el usuario navega usando los botones de retroceso o avanzar del navegador (o invoca programáticamente `history.back()`/`history.forward()`), es el complemento necesario de `pushState`: sin escuchar este evento, el navegador cambiaría la URL visible correctamente al usar el botón de retroceso, pero el contenido renderizado en pantalla no se actualizaría en consecuencia, produciendo una desincronización perceptible y confusa entre la URL mostrada y el contenido real visible. Escuchar `popstate` y volver a ejecutar la lógica de renderizado según la nueva URL resultante cierra ese ciclo, manteniendo URL y contenido siempre sincronizados sin importar cómo el usuario navegue (mediante enlaces internos de la aplicación, o mediante los controles nativos de navegación del propio navegador).

Interceptar clics sobre enlaces internos de la aplicación (marcados, por ejemplo, con un atributo personalizado `data-link`) mediante `event.preventDefault()` es necesario para evitar que el navegador realice su comportamiento nativo por defecto de navegación con recarga completa de página al hacer clic en un elemento `<a>`, sustituyendo ese comportamiento nativo por la llamada a `pushState` y la lógica de renderizado manual correspondiente a la nueva ruta, mientras se preserva la apariencia y accesibilidad de un enlace real (incluyendo, por ejemplo, la posibilidad de abrir el enlace en una nueva pestaña mediante clic central o clic con una tecla modificadora, comportamientos que un router manual bien diseñado debería respetar y no interceptar indebidamente).

Un router manual mínimo, aunque simplificado comparado con las capacidades de un router de un framework maduro (parámetros de ruta anidados, guards de navegación, transiciones animadas), captura el mecanismo esencial que cualquier router más sofisticado, incluyendo los de Angular y React estudiados en sus tracks correspondientes, construye internamente sobre esta misma base: sincronizar la URL de la barra de direcciones con el contenido renderizado, respondiendo tanto a navegación programática interna como a los controles nativos del navegador.

**Analogía:** un router manual con History API es como un sistema de señalización interna en un museo grande que, en vez de obligar a los visitantes a salir completamente del edificio y volver a entrar por una puerta distinta cada vez que quieren ver una sala diferente (una recarga completa de página), simplemente los guía internamente hacia la sala correcta manteniendo un registro coherente de qué sala visitaron, de modo que puedan retroceder a la sala anterior siguiendo ese mismo registro sin confusión.

**¿Por qué es importante?** Entender el mecanismo exacto de la History API es la base sobre la que se construye cualquier sistema de routing de una SPA, incluyendo los routers de Angular y React que se estudiarán en sus tracks correspondientes, que automatizan esta misma sincronización de forma más sofisticada pero conceptualmente equivalente.

**Código del ejemplo:**

```js
function navegar(ruta) {
  history.pushState({}, "", ruta); // cambia la URL sin recargar
  render(ruta);                     // actualiza el contenido manualmente
}
window.addEventListener("popstate", () => render(location.pathname)); // retroceso/avance
document.body.addEventListener("click", (e) => {
  if (e.target.matches("[data-link]")) {
    e.preventDefault();               // evita la recarga nativa del navegador
    navegar(e.target.getAttribute("href"));
  }
});
```

### Tema 2: Estado de aplicación con un store propio

**Conceptos clave:** patrón store, suscriptores, notificación de cambios, actualización inmutable.

Un store centraliza el estado compartido de una aplicación (los datos que múltiples partes de la interfaz necesitan leer y que cambian a lo largo del tiempo) en un único lugar bien definido, en vez de dispersar ese estado de forma descoordinada entre múltiples variables globales o entre el propio DOM directamente, un patrón que se vuelve rápidamente insostenible a medida que una aplicación crece más allá de una interacción trivial. Un store mínimo propio, sin ninguna biblioteca externa, expone típicamente tres capacidades: `getState()` para leer el estado actual en cualquier momento, `setState(cambios)` para actualizar el estado (idealmente de forma inmutable, aplicando el mismo principio de actualización sin mutación estudiado en el Módulo 4), y `subscribe(callback)` para registrar funciones que deben notificarse automáticamente cada vez que el estado cambia.

El mecanismo de notificación mediante `subscribe` es, en esencia, una aplicación directa del patrón observador: cualquier parte de la interfaz que necesite reaccionar a cambios de estado se registra una vez como suscriptor, y el store se encarga de invocar a todos los suscriptores registrados automáticamente cada vez que `setState` se invoca, desacoplando completamente la lógica que modifica el estado (que no necesita saber qué partes específicas de la interfaz dependen de ese estado) de la lógica que renderiza la interfaz en respuesta a esos cambios (que no necesita saber qué acción específica disparó el cambio, solo que el estado cambió y debe volver a renderizarse en consecuencia).

Devolver una función de cancelación de suscripción desde `subscribe` (`return () => listeners.delete(fn);`) es una práctica importante de higiene: permite que un componente de UI que deja de existir (por ejemplo, al navegar hacia otra ruta que ya no lo necesita) se dé de baja explícitamente de la lista de suscriptores del store, evitando que continúe recibiendo notificaciones innecesarias indefinidamente después de haber dejado de ser relevante, un descuido que de otro modo acumularía progresivamente suscriptores obsoletos y consumo de memoria innecesario en una aplicación de larga duración con muchas transiciones de vista.

Construir este patrón desde cero, aunque considerablemente más simplificado que las implementaciones completas de gestión de estado de bibliotecas dedicadas (Redux, o los propios mecanismos internos de Angular y React estudiados en sus tracks), revela con claridad el problema fundamental que esas herramientas resuelven de forma más sofisticada: mantener sincronizados de forma eficiente y predecible el estado de una aplicación y la interfaz que lo refleja visualmente, sin que cada parte de la aplicación necesite coordinar manualmente y de forma ad-hoc con cada otra parte que también depende del mismo estado compartido.

**Analogía:** un store es como un tablón de anuncios central de una oficina, donde cualquier departamento puede consultar el estado actual de un proyecto compartido, y cualquier departamento interesado puede suscribirse para recibir una notificación automática cada vez que ese tablón se actualiza, sin que el departamento que actualiza el tablón necesite conocer ni contactar individualmente a cada departamento interesado en enterarse del cambio.

**¿Por qué es importante?** Construir un store propio desde cero revela el mecanismo esencial de sincronización entre estado y UI que automatizan Angular y React, dando una base conceptual sólida para entender por qué esos frameworks están diseñados como están, antes de depender de sus abstracciones específicas.

**Código del ejemplo:**

```js
function createStore(estadoInicial) {
  let estado = estadoInicial;
  const listeners = new Set();
  return {
    getState: () => estado,
    setState: (parcial) => {
      estado = { ...estado, ...parcial }; // actualización inmutable
      listeners.forEach(fn => fn(estado)); // notifica a TODOS los suscriptores
    },
    subscribe: (fn) => { listeners.add(fn); return () => listeners.delete(fn); },
  };
}
```

### Tema 3: Consumo de una API real con manejo de errores

**Conceptos clave:** estados de carga/error/datos, integración del store con `fetch`.

Conectar el store del Tema 2 a datos reales obtenidos mediante `fetch` (Módulo 6) requiere modelar explícitamente en el propio estado los distintos momentos posibles de una operación asíncrona: antes de que la petición inicie, mientras está en curso (estado de carga, típicamente mostrando un indicador visual al usuario para comunicar que algo está sucediendo), y después de que termina, ya sea con éxito (datos disponibles para renderizar) o con fallo (un mensaje de error que comunicar de forma clara y útil al usuario, en vez de dejar la interfaz en un estado ambiguo o simplemente vacío sin ninguna explicación).

Un patrón robusto y ampliamente usado es representar estos tres momentos explícitamente como parte del estado (`{ cargando: boolean, datos: T | null, error: string | null }`), actualizando el store en cada transición: `setState({cargando: true, error: null})` inmediatamente antes de disparar la petición; `setState({cargando: false, datos: resultado})` al recibir una respuesta exitosa; `setState({cargando: false, error: mensaje})` si la petición falla, ya sea por un error de red genuino o por una respuesta HTTP de error (recordando del Módulo 6 que `fetch` no rechaza automáticamente ante estas últimas, requiriendo verificación explícita de `respuesta.ok`).

La interfaz, suscrita al store mediante el mecanismo del Tema 2, simplemente reacciona a estos tres estados posibles renderizando el contenido apropiado en cada caso: un indicador de carga mientras `cargando` es verdadero, el contenido real cuando `datos` está disponible y `cargando` es falso, o un mensaje de error claro cuando `error` no es nulo, sin necesidad de que la lógica de renderizado conozca los detalles internos de cómo o cuándo se disparó la petición original, simplemente reaccionando al estado actual disponible en el store en cualquier momento dado.

Esta separación entre "la lógica que dispara y gestiona la petición asíncrona" y "la lógica que renderiza según el estado resultante" es exactamente el mismo principio de separación de responsabilidades que sustenta el manejo de datos asíncronos en frameworks completos como Angular (con sus Observables y servicios) o React (con sus Hooks de estado y efectos), estudiados en sus tracks correspondientes, donde este mismo patrón de "cargando/datos/error" reaparece consistentemente como la forma estándar y ampliamente adoptada de modelar operaciones asíncronas en una interfaz de usuario.

**Analogía:** modelar explícitamente los tres estados de una operación asíncrona es como un semáforo con tres luces claras y bien diferenciadas —amarillo intermitente mientras se procesa una solicitud en curso, verde cuando la solicitud se completó con éxito, rojo cuando falló— en vez de un indicador ambiguo de una sola luz que no comunica con precisión en cuál de los tres momentos posibles se encuentra realmente la situación en cada instante.

**¿Por qué es importante?** Modelar explícitamente carga, datos y error como parte del estado (en vez de dejarlos implícitos o parcialmente gestionados) es el patrón estándar para construir interfaces que comunican claramente al usuario qué está sucediendo en cada momento de una operación asíncrona, un patrón que reaparece consistentemente en cualquier framework de UI moderno.

**Código del ejemplo:**

```js
async function cargarUsuarios(store) {
  store.setState({ cargando: true, error: null });
  try {
    const r = await fetch("/api/usuarios");
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    store.setState({ cargando: false, datos: await r.json() });
  } catch (error) {
    store.setState({ cargando: false, error: error.message });
  }
}
// la UI, suscrita al store, renderiza según { cargando, datos, error } en cada momento
```

### Tema 4: Conectando todo — el patrón completo de una SPA

**Conceptos clave:** integración de routing, store y renderizado, lo que un framework automatiza.

El patrón completo de esta SPA sin framework integra los tres temas anteriores en un ciclo coherente: una ruta activa (gestionada por el router del Tema 1) determina qué vista específica debe renderizarse; esa vista lee su información necesaria del store (Tema 2), que puede a su vez estar poblado con datos reales obtenidos de una API (Tema 3); las acciones del usuario dentro de esa vista (un clic, el envío de un formulario) invocan `store.setState(...)` directamente, o disparan una nueva petición `fetch` que eventualmente actualiza el store con su resultado; y cuando el store notifica un cambio a través de sus suscriptores, la función de renderizado correspondiente a la vista actualmente activa se vuelve a ejecutar, actualizando el DOM manualmente para reflejar el nuevo estado.

Este ciclo completo —ruta activa → lectura del store → renderizado → acción del usuario → actualización del store → nuevo renderizado— es, en esencia, exactamente lo que un framework de UI como Angular o React automatiza y abstrae mediante sus propios mecanismos específicos: el "binding" declarativo entre estado y DOM (en vez de actualizar el DOM manualmente con `createElement`/`appendChild` en cada cambio, un framework declara qué debería mostrarse dado un estado, y el framework mismo se encarga de calcular y aplicar eficientemente los cambios mínimos necesarios al DOM real), el diffing eficiente (determinar exactamente qué partes del DOM necesitan actualizarse ante un cambio de estado, sin re-renderizar innecesariamente partes que no cambiaron), y la gestión del ciclo de vida de los componentes (inicialización, actualización, destrucción, incluyendo la cancelación automática de suscripciones al store cuando un componente deja de existir).

Haber construido manualmente cada una de estas piezas —el router, el store, la integración con datos asíncronos, el renderizado manual del DOM en respuesta a cambios— antes de aprender un framework completo en los tracks siguientes (Angular, React) tiene un valor pedagógico deliberado y considerable: permite apreciar con precisión exactamente qué problema resuelve cada capacidad específica de un framework, en vez de aprender esas capacidades como "magia" que simplemente funciona sin entender el problema real subyacente que resuelven, ni por qué esas soluciones específicas fueron diseñadas de la forma en que lo fueron.

Reflexionar honestamente, al completar este proyecto, sobre en qué punto exacto del desarrollo un framework habría ahorrado tiempo real y reducido complejidad genuina (probablemente en el renderizado eficiente del DOM ante cambios frecuentes de estado, y en la gestión coordinada del ciclo de vida de múltiples vistas simultáneas) es un ejercicio de síntesis que consolida de forma duradera tanto el conocimiento de JavaScript puro de este track completo como la motivación genuina y bien fundamentada para adoptar un framework en los tracks siguientes.

**Analogía:** construir esta SPA sin framework es como construir manualmente un reloj mecánico completo antes de empezar a usar relojes con movimiento automático: una vez que entiendes exactamente cómo cada engranaje individual contribuye al movimiento final completo, apreciar y confiar en un mecanismo automático más sofisticado (que internamente sigue dependiendo de los mismos principios mecánicos fundamentales) se vuelve una decisión informada, no un acto de fe ciega en una caja negra que nunca se entendió realmente.

**¿Por qué es importante?** Este proyecto integrador consolida todo el conocimiento de JavaScript puro de los doce módulos anteriores en un sistema coherente y funcional, y sienta las bases conceptuales exactas sobre las que se construirán los tracks de Angular y React que siguen a continuación.

**Diagrama:**

```
Ruta activa (router) ──▶ determina la vista a renderizar
        │                              │
        ▼                              ▼
   store.getState()  ◄────────  vista lee el estado actual
        │
   acción del usuario (click, submit)
        │
        ▼
   store.setState(...) o fetch() → store.setState(resultado)
        │
        ▼
   store notifica a los suscriptores ──▶ vista se vuelve a renderizar
```

---

## Proyecto transversal RutaFlow: Widget público de seguimiento

RutaFlow conecta este track con una plataforma completa de paquetería. La implementación de referencia está en `examples/rutaflow/javascript/tracking-widget.js`; se estudia como punto de partida pequeño, no como sistema terminado.

### Capacidad y fundamento

Construye el seguimiento sin `innerHTML`: crea nodos, asigna `textContent`, usa `aria-live` y formatea fechas con `Intl`. El contrato público no expone dirección, teléfono, coordenadas ni identificadores internos. Separa obtención, validación, presentación y renderizado para que la función conserve una responsabilidad clara.

### Implementación guiada

1. Copia el contrato y escribe primero casos normales, límite, inválidos y duplicados.
2. Ejecuta la referencia, provoca un fallo y explica el mensaje antes de modificarla.
3. Implementa una mejora pequeña manteniendo nombres de dominio, efectos visibles y errores tipados.
4. Integra con el contrato del track anterior sin compartir tablas, estado mutable ni detalles de framework.
5. Registra la decisión en el README y etiqueta el hito de RutaFlow correspondiente.

### Verificación profesional

Prueba caracteres HTML en `publicCode`, fecha inválida, actualización de estado y navegación con lector de pantalla. Mide que una actualización reemplace el contenido sin duplicar nodos y explica por qué sanitizar después es más frágil que no interpretar texto como HTML.

El capítulo se completa cuando la evidencia permite a otra persona reproducir el flujo y explicar qué garantías ofrece y cuáles todavía no.

## Criterio transversal de calidad del código

Aplica estas decisiones en todos los ejemplos y en tu entrega:

- usa nombres que expresen intención, dominio y unidades; evita `data`, `temp`, `manager` o `process` cuando exista un término preciso;
- mantén funciones, componentes, clases, consultas y módulos cohesionados alrededor de una responsabilidad comprobable;
- haz visibles las dependencias y los efectos de red, tiempo, archivos, estado y base de datos;
- valida entradas en la frontera y representa errores con contexto, sin ocultar la causa ni registrar secretos;
- elimina duplicación de reglas, no toda repetición textual; una abstracción incorrecta cuesta más que dos líneas parecidas;
- escribe primero la solución más simple que satisface el requisito y refactoriza con pruebas verdes;
- aplica SOLID únicamente cuando exista una necesidad real de cambio, extensión, sustitución o aislamiento.

**SOLID con criterio:** responsabilidad única significa una razón coherente de cambio, no una clase por función. Abierto/cerrado justifica estrategias cuando hay variantes reales. Sustitución exige respetar contratos. Segregación evita obligar a consumidores a depender de operaciones que no usan. Inversión de dependencias protege el dominio frente a detalles externos; no exige crear interfaces para cada objeto.

**Comprobación antes de continuar:** ¿otra persona puede entender los nombres y el flujo?, ¿los casos de error son observables?, ¿una prueba demuestra la regla principal?, ¿cada abstracción aporta más claridad de la que cuesta? Registra una decisión de refactorización y una decisión consciente de *no abstraer*.

## Laboratorio práctico

**Objetivo del laboratorio:** construir una SPA completa y funcional (varias vistas, estado compartido, datos reales de una API) sin ningún framework de UI, integrando todos los conceptos del track.

**Requisitos previos:** todos los Módulos 0-11 completados, Node.js con Vite instalado.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Implementar el router manual | Ver Tema 1, al menos 3 rutas (`/inicio`, `/detalle/:id`, `/404`) | Verifica navegación con clic y con retroceso del navegador |
| 2 | Construir el store propio | Ver Tema 2 | Verifica que múltiples suscriptores se notifican correctamente |
| 3 | Conectar el store a datos reales | Ver Tema 3, usa la misma API pública del Módulo 6 | Modela explícitamente `cargando`/`datos`/`error` |
| 4 | Renderizar las vistas según ruta y estado | Actualiza el DOM manualmente en cada notificación del store | Verifica sincronización entre URL, estado y contenido visible |
| 5 | Manejar errores visibles al usuario | Ruta inexistente → vista 404; fetch fallido → mensaje de error | Ningún estado de fallo debe quedar sin comunicar al usuario |
| 6 | Generar el build de producción | `npm run build` | Documenta el tamaño final del bundle y qué se podría optimizar más |

**Verificación:** el laboratorio se considera exitoso si la SPA completa navega correctamente entre las 3 rutas (incluyendo con los botones nativos de retroceso/avance del navegador), si los datos reales se cargan y muestran correctamente con sus tres estados (carga/datos/error) claramente comunicados, y si el build de producción se genera sin errores.

**Errores comunes y soluciones**

- **Olvidar escuchar `popstate`, dejando el botón de retroceso del navegador desincronizado del contenido mostrado.** Verifica que la lógica de renderizado se vuelva a ejecutar tanto en navegación programática como en `popstate`.
- **No desuscribirse del store al cambiar de vista, acumulando suscriptores obsoletos.** Guarda y ejecuta la función de cancelación devuelta por `subscribe` al desmontar una vista.
- **Dejar la interfaz en un estado ambiguo cuando `fetch` falla, sin ningún mensaje visible.** Verifica que el estado `error` del store siempre se traduzca en un mensaje claro y visible para el usuario.

---

## Ejercicios de evaluación

### Ejercicio 1: Qué automatiza un framework

**Enunciado:** tras completar este proyecto, enumera al menos tres capacidades concretas que un framework como Angular o React automatiza, que tú tuviste que implementar manualmente en este proyecto.

**Solución esperada:** tres respuestas razonables: (1) el "binding" declarativo entre estado y DOM, evitando escribir manualmente `createElement`/`appendChild` en cada actualización; (2) el diffing eficiente, actualizando solo las partes del DOM que realmente cambiaron en vez de re-renderizar todo; (3) la gestión automática del ciclo de vida de componentes, incluyendo la cancelación automática de suscripciones al desmontar una vista, en vez de gestionarla manualmente con el valor de retorno de `subscribe`.

**Criterios de éxito:**
- Enumera al menos tres capacidades concretas y correctamente atribuidas a lo que un framework automatiza.
- Conecta cada una con la experiencia concreta y específica de haberla implementado manualmente en este proyecto.

### Ejercicio 2: Diagnosticar un bug de sincronización de rutas

**Enunciado:** un usuario reporta que, al usar el botón de retroceso del navegador, la URL cambia correctamente pero el contenido visible en pantalla no se actualiza. ¿Cuál es la causa más probable y cómo la corregirías?

**Solución esperada:** la causa más probable es que la aplicación no está escuchando el evento `popstate`, o lo escucha pero no vuelve a invocar la función de renderizado correspondiente a la nueva ruta resultante de `location.pathname`. La corrección es añadir (o corregir) un listener de `popstate` en `window` que invoque `render(location.pathname)` cada vez que se dispara.

**Criterios de éxito:**
- Identifica correctamente la ausencia (o el mal funcionamiento) del listener de `popstate` como la causa.
- Propone la corrección concreta y correcta.

### Ejercicio 3: Diseñar el estado de una operación asíncrona

**Enunciado:** diseña la estructura del estado del store para una vista que carga el detalle de un producto por id, considerando que el usuario puede navegar rápidamente entre distintos productos antes de que la petición anterior termine.

**Solución esperada:** una estructura razonable incluye `{ cargando: boolean, producto: Producto | null, error: string | null, idSolicitado: number | null }`, donde `idSolicitado` permite verificar, al recibir una respuesta tardía de una petición anterior, si esa respuesta corresponde efectivamente al producto actualmente solicitado o si debe descartarse por corresponder a una navegación ya obsoleta (un problema de condición de carrera similar al discutido con `AbortController` en el Módulo 6, que también sería una solución válida y complementaria aquí).

**Criterios de éxito:**
- Incluye los tres estados esenciales (cargando, datos, error).
- Identifica y aborda explícitamente el riesgo de condición de carrera ante navegación rápida entre productos distintos.

---

## Rúbrica del proyecto

Esta rúbrica evalúa el laboratorio y los ejercicios como evidencia de dominio, no la mera finalización de pasos.

| Criterio | Peso | Evidencia esperada |
|---|---:|---|
| Comprensión conceptual | 20% | Explica el mecanismo, sus límites y por qué la solución funciona. |
| Implementación funcional | 30% | El artefacto satisface requisitos normales, límite y de error. |
| Verificación | 20% | Incluye pruebas, mediciones o inspecciones reproducibles. |
| Diseño y calidad | 15% | Nombres, estructura, seguridad y mantenibilidad son deliberados. |
| Comunicación profesional | 15% | README, decisiones, comandos y resultados permiten repetir el trabajo. |

Se alcanza competencia con 70/100 y sin cero en implementación o verificación. El nivel experto exige comparar alternativas, justificar trade-offs y reconocer condiciones donde la solución dejaría de ser válida.

## Bibliografía y fundamento académico

Estas fuentes sustentan los conceptos y deben consultarse para verificar detalles que cambian entre versiones:

- ECMA International, *ECMAScript Language Specification*.
- MDN Web Docs, guías de JavaScript y Web APIs.
- WHATWG, *HTML Living Standard* y *Fetch Standard*.
- ACM/IEEE-CS/AAAI, *Computer Science Curricula 2023*.
- IEEE Computer Society, *SWEBOK Guide V4.0*.

## Resumen del módulo

**Puntos clave**

- La History API (`pushState` + `popstate`) permite construir routing manual sin recargas completas de página, sincronizando URL y contenido renderizado.
- Un store propio centraliza estado compartido y notifica a suscriptores mediante el patrón observador, con actualización inmutable.
- Modelar explícitamente carga/datos/error en el estado es el patrón estándar para comunicar claramente el progreso de operaciones asíncronas.
- El ciclo completo ruta→estado→renderizado→acción→estado es exactamente lo que Angular y React automatizan mediante sus propios mecanismos.
- Construir esto manualmente antes de aprender un framework da una base conceptual sólida para entender qué problema real resuelve cada capacidad de esos frameworks.

**Conceptos aprendidos**

- Routing manual con la History API.
- Diseño de un store propio con notificación de cambios.
- Integración de datos asíncronos reales con manejo explícito de estados.
- Síntesis completa de los doce módulos del track en un proyecto funcional real.

**Próximos pasos**

Con el track de JavaScript completo, el siguiente paso natural es el track de Node.js (para aplicar estos fundamentos al backend) o el track de Angular/React (para aprender un framework completo que automatiza gran parte de lo construido manualmente en este proyecto).

**Recursos adicionales**

- MDN Web Docs: "Working with the History API".
- El artículo "Build Your Own React" (Rodrigo Pombo) para profundizar en cómo un framework real implementa internamente el diffing y el renderizado eficiente.
