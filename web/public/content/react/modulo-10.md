# Módulo 10: Server Components y Next.js

## Sílabo

**Objetivo general**

Entender el giro del ecosistema React hacia renderizado en servidor por defecto: Server Components frente a Client Components, el App Router de Next.js, streaming con Suspense en el servidor, y Server Actions.

**Objetivos específicos**

1. Explicar por qué un Server Component nunca envía su JavaScript al navegador.
2. Identificar cuándo un componente debe marcarse explícitamente como `"use client"`.
3. Implementar streaming de una sección lenta con Suspense en el servidor.
4. Implementar una Server Action que procese un formulario sin un endpoint API separado.
5. Explicar la relación entre Server Components y el bundle final del cliente.

**Contenido**

- Server Components vs Client Components.
- App Router de Next.js.
- Streaming y Suspense en el servidor.
- Server Actions.

**Evaluación**

Aplicación Next.js con App Router, Server Components y al menos una Server Action, más tres ejercicios de evaluación.

---

## Contenido teórico

### Tema 1: Server Components por defecto

**Conceptos clave:** ejecución exclusiva en servidor, acceso directo a recursos del backend, sin JavaScript enviado al cliente.

Un Server Component (`async function PaginaTareas() { const tareas = await db.tarea.findMany(); return <ListaTareas tareas={tareas} />; }`, sin la directiva `"use client"`) se ejecuta exclusivamente en el servidor: puede acceder directamente a una base de datos, al sistema de archivos, o a cualquier recurso disponible únicamente en el entorno del servidor, sin necesidad de exponer un endpoint API intermedio para obtener esos datos, dado que el propio componente ya se ejecuta en ese entorno con acceso directo.

La consecuencia más significativa de esto es que un Server Component nunca envía su propio código JavaScript al navegador del cliente: únicamente el HTML resultante de su renderizado (y los datos serializados necesarios para hidratar cualquier Client Component anidado dentro de él, Tema 2) llegan al navegador, reduciendo directamente el tamaño del bundle de JavaScript que el cliente necesita descargar y ejecutar, un beneficio de rendimiento particularmente significativo para componentes que dependen de librerías pesadas del lado del servidor (un parser de markdown complejo, una librería de manipulación de imágenes) que de otro modo tendrían que incluirse completas en el bundle del cliente aunque solo se usen para producir el HTML final, nunca para volver a ejecutarse en el navegador.

**Analogía:** un Server Component es como un chef que prepara un plato completo en la cocina del restaurante y solo envía el plato terminado a la mesa, sin enviar también las ollas, el equipo de cocina, ni la receta completa junto con el plato; el cliente recibe únicamente el resultado final, sin el aparato completo que fue necesario para producirlo.

**¿Por qué es importante?** Un Server Component reduce el bundle de JavaScript del cliente al no enviar su propio código de ejecución, y permite acceso directo a recursos del servidor sin necesidad de un endpoint API intermedio.

**Diagrama:**

```jsx
// app/tareas/page.tsx — Server Component (sin "use client")
async function PaginaTareas() {
  const tareas = await db.tarea.findMany(); // acceso directo a datos, corre solo en el servidor
  return <ListaTareas tareas={tareas} />;
}
```

### Tema 2: use client para interactividad

**Conceptos clave:** hooks de estado solo en Client Components, límite explícito entre servidor y cliente.

Cualquier componente que necesite interactividad basada en hooks de estado (`useState`, `useEffect`, manejadores de eventos como `onClick`) debe marcarse explícitamente con la directiva `"use client"` al inicio del archivo, indicando a Next.js que ese componente (y todo lo que importe transitivamente desde ese punto) debe compilarse también para ejecutarse en el navegador, no únicamente en el servidor: `"use client"; function BotonLike() { const [likes, setLikes] = useState(0); return <button onClick={() => setLikes(l => l + 1)}>{likes} likes</button>; }`, dado que `useState` y los manejadores de eventos interactivos requieren un entorno de ejecución en el navegador donde el JavaScript del componente efectivamente corre después de la carga inicial, algo que un Server Component, por definición, no ofrece.

Esta directiva establece un límite explícito y deliberado en el árbol de componentes: todo lo que está por encima de ese límite (los componentes padre que no la declaran) puede seguir siendo Server Components ejecutándose únicamente en el servidor, mientras que el subárbol marcado con `"use client"` (y cualquier componente que ese subárbol importe) se convierte en Client Components, compilados también para el navegador; diseñar cuidadosamente dónde colocar ese límite (idealmente lo más profundo posible en el árbol, marcando solo los componentes que genuinamente necesitan interactividad, no envolviendo prematuramente componentes enteros de página completos) maximiza la proporción de código que permanece exclusivamente en el servidor.

**Analogía:** `"use client"` es como marcar explícitamente una habitación de la casa donde sí se permite instalar y encender aparatos eléctricos interactivos, mientras que el resto de la casa (por defecto) simplemente exhibe objetos ya terminados sin necesidad de electricidad ni interacción activa dentro de esa habitación específica.

**¿Por qué es importante?** `"use client"` es obligatorio para cualquier componente que use hooks de estado o manejadores de eventos interactivos; colocar ese límite lo más profundo posible en el árbol maximiza la cantidad de código que permanece exclusivamente en el servidor.

**Diagrama:**

```jsx
"use client";
function BotonLike() {
  const [likes, setLikes] = useState(0); // hooks de estado solo funcionan en Client Components
  return <button onClick={() => setLikes(l => l + 1)}>{likes} likes</button>;
}
```

### Tema 3: Streaming con Suspense en el servidor

**Conceptos clave:** enviar el HTML disponible primero, no bloquear toda la página por una sección lenta.

El streaming del lado del servidor permite que Next.js envíe al navegador el HTML de las partes de una página que ya están listas, sin esperar a que absolutamente todas las secciones de esa página (incluyendo alguna sección particularmente lenta, como una consulta a una base de datos que tarda varios segundos) completen su renderizado: `<Suspense fallback={<Spinner />}><SeccionLenta /></Suspense>` permite que el resto de la página se envíe y se muestre inmediatamente, mientras `SeccionLenta` continúa renderizándose en el servidor, enviándose y reemplazando el `fallback` correspondiente en cuanto efectivamente completa, sin bloquear el resto de la página mientras tanto.

Este mismo `Suspense` que en el Módulo 5 se usaba para mostrar un `fallback` mientras un chunk de JavaScript se descargaba en el cliente, aquí se aplica del lado del servidor para el mismo propósito conceptual: permitir que partes de la interfaz que sí están listas se muestren de inmediato, sin esperar a la parte más lenta, evitando que una única sección costosa de calcular retrase la percepción de toda la página como lenta para el usuario.

**Analogía:** el streaming con Suspense es como servir primero los platos de una comida que ya están listos en la mesa, en vez de hacer esperar a todos los comensales hasta que el plato más lento de preparar esté terminado antes de servir absolutamente nada.

**¿Por qué es importante?** El streaming con Suspense evita que una sección particularmente lenta de una página retrase la percepción de toda la página, mostrando de inmediato el contenido que ya está listo.

**Diagrama:**

```jsx
<Suspense fallback={<Spinner />}>
  <SeccionLenta /> {/* el resto de la página se muestra mientras esto carga */}
</Suspense>
```

### Tema 4: Server Actions

**Conceptos clave:** procesar formularios en el servidor sin un endpoint API separado.

Una Server Action (`async function crearTarea(formData) { "use server"; await db.tarea.create({ data: { titulo: formData.get('titulo') } }); }`) es una función marcada explícitamente con `"use server"` que se ejecuta en el servidor pero que puede invocarse directamente desde un formulario del lado del cliente (`<form action={crearTarea}>`), sin necesidad de crear manualmente un endpoint API dedicado (una ruta HTTP separada que reciba la petición, la parsee, y la procese) que el formulario tendría que invocar explícitamente mediante `fetch`.

Next.js genera automáticamente la infraestructura de comunicación necesaria entre el formulario del cliente y la función marcada como Server Action (serializando los datos del formulario y estableciendo la petición correspondiente por debajo), reduciendo significativamente el código repetitivo que tradicionalmente se necesitaba para conectar un formulario del cliente con lógica de procesamiento del servidor: sin Server Actions, el mismo caso de uso requeriría definir una ruta API separada, un manejador de submit del lado del cliente que capture el evento, prevenga el comportamiento por defecto, serialice los datos, y realice una petición `fetch` manual hacia esa ruta.

**Analogía:** una Server Action es como entregar un formulario directamente a la persona correcta que lo procesará, sin necesidad de pasar primero por una oficina de recepción separada (el endpoint API) que reciba, registre y reenvíe el formulario hacia esa persona.

**¿Por qué es importante?** Las Server Actions eliminan la necesidad de un endpoint API separado y de código manual de serialización/envío para conectar un formulario del cliente con lógica de procesamiento del servidor.

**Diagrama:**

```jsx
async function crearTarea(formData) {
  "use server";
  await db.tarea.create({ data: { titulo: formData.get('titulo') } });
}

<form action={crearTarea}><input name="titulo" /><button>Crear</button></form>
```

---

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

**Objetivo del laboratorio:** construir una aplicación Next.js con App Router, Server Components y una Server Action.

**Requisitos previos:** Módulos 0-9 completados.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Crear un proyecto Next.js con App Router | `npx create-next-app` | Observa Server Components por defecto |
| 2 | Marcar un componente interactivo con `"use client"` | Ver Tema 2 | Explica por qué lo necesita |
| 3 | Implementar streaming con Suspense | Ver Tema 3 | De una sección lenta simulada |
| 4 | Implementar una Server Action | Ver Tema 4 | Sin un endpoint API separado |

**Verificación:** el laboratorio se considera exitoso si el resto de la página se muestra antes que la sección lenta envuelta en Suspense, y si la Server Action procesa el formulario correctamente sin ninguna ruta API adicional definida.

**Errores comunes y soluciones**

- **Marcar toda una página como `"use client"` innecesariamente.** Marca solo el componente específico que necesita interactividad, lo más profundo posible en el árbol.
- **Intentar usar `useState` en un Server Component.** Los hooks de estado requieren `"use client"`.
- **Envolver la sección lenta sin `Suspense`.** Sin `Suspense`, toda la página espera a que la sección lenta complete antes de mostrarse.

---

## Ejercicios de evaluación

### Ejercicio 1: Ventaja de un Server Component

**Enunciado:** explica qué ventaja tiene un Server Component que nunca envía su JavaScript al navegador.

**Solución esperada:** reduce directamente el tamaño del bundle de JavaScript que el cliente necesita descargar y ejecutar, un beneficio particularmente significativo para componentes que dependen de librerías pesadas del servidor, que de otro modo tendrían que incluirse completas en el bundle del cliente aunque solo produzcan el HTML final.

**Criterios de éxito:**
- Explica correctamente la reducción del bundle del cliente como beneficio principal.

### Ejercicio 2: Cuándo es obligatorio use client

**Enunciado:** ¿cuándo es obligatorio marcar un componente como `"use client"`?

**Solución esperada:** cuando el componente usa hooks de estado (`useState`, `useEffect`) o manejadores de eventos interactivos (`onClick`, `onChange`), dado que esas capacidades requieren un entorno de ejecución en el navegador donde el JavaScript del componente corre después de la carga inicial, algo que un Server Component no ofrece por definición.

**Criterios de éxito:**
- Identifica correctamente hooks de estado y manejadores de eventos interactivos como los casos que requieren `"use client"`.

### Ejercicio 3: Server Actions frente a un endpoint API manual

**Enunciado:** ¿qué código repetitivo evita una Server Action frente a definir manualmente un endpoint API y un manejador de submit del lado del cliente?

**Solución esperada:** evita definir una ruta API separada, un manejador de submit que capture el evento, prevenga el comportamiento por defecto del formulario, serialice los datos, y realice una petición `fetch` manual hacia esa ruta; Next.js genera automáticamente esa infraestructura de comunicación al usar una Server Action directamente en el `action` del formulario.

**Criterios de éxito:**
- Enumera correctamente el código repetitivo evitado (ruta API, manejador manual, serialización, fetch manual).

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

- Meta Open Source, *React Documentation*.
- WHATWG, estándares de DOM, HTML y Fetch.
- W3C, *Web Content Accessibility Guidelines (WCAG)*.
- ACM/IEEE-CS/AAAI, *Computer Science Curricula 2023*.
- IEEE Computer Society, *SWEBOK Guide V4.0*.

## Resumen del módulo

**Puntos clave**

- Un Server Component nunca envía su JavaScript al cliente, reduciendo el bundle y permitiendo acceso directo a recursos del servidor.
- `"use client"` es obligatorio para hooks de estado y manejadores de eventos interactivos.
- El streaming con Suspense permite mostrar el contenido listo sin esperar a las secciones más lentas.
- Las Server Actions conectan formularios del cliente con lógica del servidor sin un endpoint API separado.

**Conceptos aprendidos**

- Server Components vs Client Components.
- App Router de Next.js.
- Streaming con Suspense en el servidor.
- Server Actions.

**Próximos pasos**

En el Módulo 11 aprenderás TypeScript con React: tipado de props, hooks genéricos, eventos tipados y componentes polimórficos.

**Recursos adicionales**

- Documentación oficial de Next.js (nextjs.org/docs): "Server Components" y "Server Actions".
