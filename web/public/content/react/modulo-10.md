# Módulo 10: Server Components y Next.js


## Aprende construyendo

### Tema 1: Server Components por defecto

#### Paso 1 · Objetivo y preparación
Al finalizar podrás evaluar React Server Components desde cero. Prerrequisitos: Node.js LTS, npm y editor. Verifica node --version y npm --version.

#### Paso 2 · Contexto y caso real
En un caso real, una página de seguimiento debe enviar poco JavaScript, mostrar datos rápido y reservar interactividad para controles que realmente la necesitan.

#### Paso 3 · Teoría, modelo mental y analogía
Un Server Component se ejecuta en servidor y no añade código interactivo al cliente; use client marca una frontera; Suspense permite streaming; Server Actions ejecutan mutaciones en servidor con validación. La analogía es un restaurante: cocina lo estático antes de servir y envía solo la estación que requiere interacción.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-react-m10
cd ejemplo-react-m10
npx create-next-app@latest app --ts --eslint --app --src-dir --no-tailwind --use-npm
cd app
npm run dev
```

`npx` es el comando que ejecuta un paquete sin instalarlo globalmente (`create-next-app`, el andamiador oficial de Next.js). `--ts` es la bandera que usa TypeScript; `--eslint` activa el linter; `--app` usa el App Router; `--src-dir` mueve el código a una carpeta `src/`; `--no-tailwind` es la bandera que omite Tailwind CSS; `--use-npm` es la bandera que fija npm como gestor de paquetes en vez de preguntar.
Crea src/app/deliveries/page.tsx como Server Component y src/app/deliveries/DeliveryButton.tsx con use client; explica la frontera y el resultado.

#### Paso 5 · Práctica guiada
Pista: importa deliberadamente un hook en un componente servidor para provocar un fallo deliberado de compilación; lee el mensaje y mueve la frontera correcta. Resultado esperado: build estable.

#### Paso 6 · Práctica independiente
Añade Suspense, una Server Action con validación, estado pending y una medición del JavaScript enviado al cliente.

#### Paso 7 · Cierre y evidencia
Guarda build, capturas y métricas; como siguiente paso estudia despliegue. Errores comunes: enviar secretos al cliente, usar hooks en servidor, mutar sin autorización y asumir que streaming arregla consultas lentas. Fuentes oficiales: https://nextjs.org/docs/app y https://react.dev/reference/rsc/server-components.
**¿Por qué es importante?** Porque separar servidor y cliente mejora rendimiento, seguridad y claridad de responsabilidades.
**Evidencia de aprendizaje:** entrega árbol, frontera client/server, fallo, acción y medición.
**Conceptos clave:** ejecución exclusiva en servidor, acceso directo a recursos del backend, sin JavaScript enviado al cliente.

Esta frontera Server/Client Component es la decisión de arquitectura que tomarás para cada pantalla del proyecto integrador (SPA con datos reales, Módulo 12) si lo migras a Next.js: qué partes solo muestran datos (Server) y cuáles necesitan interactividad real del usuario (Client).

**Cuándo no usarlo:** Server Components requieren un framework con soporte de servidor (Next.js) y un entorno de despliegue que lo ejecute; para una SPA puramente estática servida como archivos (el enfoque de los módulos anteriores de este track), esta frontera no aplica — toda la app se ejecuta en el cliente.

```tsx
async function PaginaTareas() {
  const tareas = await db.tarea.findMany();
  return <ListaTareas tareas={tareas} />;
}
```

Este Server Component (sin la directiva `"use client"`) se ejecuta exclusivamente en el servidor: puede acceder directamente a una base de datos, al sistema de archivos, o a cualquier recurso disponible únicamente en el entorno del servidor, sin necesidad de exponer un endpoint API intermedio para obtener esos datos, dado que el propio componente ya se ejecuta en ese entorno con acceso directo.

La consecuencia más significativa de esto es que un Server Component nunca envía su propio código JavaScript al navegador del cliente: únicamente el HTML resultante de su renderizado (y los datos serializados necesarios para hidratar cualquier Client Component anidado dentro de él, Tema 2) llegan al navegador, reduciendo directamente el tamaño del bundle de JavaScript que el cliente necesita descargar y ejecutar, un beneficio de rendimiento particularmente significativo para componentes que dependen de librerías pesadas del lado del servidor (un parser de markdown complejo, una librería de manipulación de imágenes) que de otro modo tendrían que incluirse completas en el bundle del cliente aunque solo se usen para producir el HTML final, nunca para volver a ejecutarse en el navegador.

**Analogía:** un Server Component es como un chef que prepara un plato completo en la cocina del restaurante y solo envía el plato terminado a la mesa, sin enviar también las ollas, el equipo de cocina, ni la receta completa junto con el plato; el cliente recibe únicamente el resultado final, sin el aparato completo que fue necesario para producirlo.

**¿Por qué es importante?** Un Server Component reduce el bundle de JavaScript del cliente al no enviar su propio código de ejecución, y permite acceso directo a recursos del servidor sin necesidad de un endpoint API intermedio.

**Código del ejemplo:**

```jsx
// app/tareas/page.tsx — Server Component (sin "use client")
async function PaginaTareas() {
  const tareas = await db.tarea.findMany(); // acceso directo a datos, corre solo en el servidor
  return <ListaTareas tareas={tareas} />;
}
```

### Tema 2: use client para interactividad

#### Paso 1 · Objetivo y preparación
Al finalizar podrás evaluar React Server Components desde cero. Prerrequisitos: Node.js LTS, npm y editor. Verifica node --version y npm --version.

#### Paso 2 · Contexto y caso real
En un caso real, una página de seguimiento debe enviar poco JavaScript, mostrar datos rápido y reservar interactividad para controles que realmente la necesitan.

#### Paso 3 · Teoría, modelo mental y analogía
Un Server Component se ejecuta en servidor y no añade código interactivo al cliente; use client marca una frontera; Suspense permite streaming; Server Actions ejecutan mutaciones en servidor con validación. La analogía es un restaurante: cocina lo estático antes de servir y envía solo la estación que requiere interacción.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-react-m10
cd ejemplo-react-m10
npx create-next-app@latest app --ts --eslint --app --src-dir --no-tailwind --use-npm
cd app
npm run dev
```
Crea src/app/deliveries/page.tsx como Server Component y src/app/deliveries/DeliveryButton.tsx con use client; explica la frontera y el resultado.

#### Paso 5 · Práctica guiada
Pista: importa deliberadamente un hook en un componente servidor para provocar un fallo deliberado de compilación; lee el mensaje y mueve la frontera correcta. Resultado esperado: build estable.

#### Paso 6 · Práctica independiente
Añade Suspense, una Server Action con validación, estado pending y una medición del JavaScript enviado al cliente.

#### Paso 7 · Cierre y evidencia
Guarda build, capturas y métricas; como siguiente paso estudia despliegue. Errores comunes: enviar secretos al cliente, usar hooks en servidor, mutar sin autorización y asumir que streaming arregla consultas lentas. Fuentes oficiales: https://nextjs.org/docs/app y https://react.dev/reference/rsc/server-components.
**¿Por qué es importante?** Porque separar servidor y cliente mejora rendimiento, seguridad y claridad de responsabilidades.
**Evidencia de aprendizaje:** entrega árbol, frontera client/server, fallo, acción y medición.
**Conceptos clave:** hooks de estado solo en Client Components, límite explícito entre servidor y cliente.

Cualquier componente que necesite interactividad basada en hooks de estado (`useState`, `useEffect`, manejadores de eventos como `onClick`) debe marcarse explícitamente con la directiva `"use client"` al inicio del archivo, indicando a Next.js que ese componente (y todo lo que importe transitivamente desde ese punto) debe compilarse también para ejecutarse en el navegador, no únicamente en el servidor:

```tsx
"use client";
function BotonLike() {
  const [likes, setLikes] = useState(0);
  return <button onClick={() => setLikes(l => l + 1)}>{likes} likes</button>;
}
```

Esto es necesario dado que `useState` y los manejadores de eventos interactivos requieren un entorno de ejecución en el navegador donde el JavaScript del componente efectivamente corre después de la carga inicial, algo que un Server Component, por definición, no ofrece.

Esta directiva establece un límite explícito y deliberado en el árbol de componentes: todo lo que está por encima de ese límite (los componentes padre que no la declaran) puede seguir siendo Server Components ejecutándose únicamente en el servidor, mientras que el subárbol marcado con `"use client"` (y cualquier componente que ese subárbol importe) se convierte en Client Components, compilados también para el navegador; diseñar cuidadosamente dónde colocar ese límite (idealmente lo más profundo posible en el árbol, marcando solo los componentes que genuinamente necesitan interactividad, no envolviendo prematuramente componentes enteros de página completos) maximiza la proporción de código que permanece exclusivamente en el servidor.

**Analogía:** `"use client"` es como marcar explícitamente una habitación de la casa donde sí se permite instalar y encender aparatos eléctricos interactivos, mientras que el resto de la casa (por defecto) simplemente exhibe objetos ya terminados sin necesidad de electricidad ni interacción activa dentro de esa habitación específica.

**¿Por qué es importante?** `"use client"` es obligatorio para cualquier componente que use hooks de estado o manejadores de eventos interactivos; colocar ese límite lo más profundo posible en el árbol maximiza la cantidad de código que permanece exclusivamente en el servidor.

**Código del ejemplo:**

```jsx
"use client";
function BotonLike() {
  const [likes, setLikes] = useState(0); // hooks de estado solo funcionan en Client Components
  return <button onClick={() => setLikes(l => l + 1)}>{likes} likes</button>;
}
```

### Tema 3: Streaming con Suspense en el servidor

#### Paso 1 · Objetivo y preparación
Al finalizar podrás evaluar React Server Components desde cero. Prerrequisitos: Node.js LTS, npm y editor. Verifica node --version y npm --version.

#### Paso 2 · Contexto y caso real
En un caso real, una página de seguimiento debe enviar poco JavaScript, mostrar datos rápido y reservar interactividad para controles que realmente la necesitan.

#### Paso 3 · Teoría, modelo mental y analogía
Un Server Component se ejecuta en servidor y no añade código interactivo al cliente; use client marca una frontera; Suspense permite streaming; Server Actions ejecutan mutaciones en servidor con validación. La analogía es un restaurante: cocina lo estático antes de servir y envía solo la estación que requiere interacción.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-react-m10
cd ejemplo-react-m10
npx create-next-app@latest app --ts --eslint --app --src-dir --no-tailwind --use-npm
cd app
npm run dev
```
Crea src/app/deliveries/page.tsx como Server Component y src/app/deliveries/DeliveryButton.tsx con use client; explica la frontera y el resultado.

#### Paso 5 · Práctica guiada
Pista: importa deliberadamente un hook en un componente servidor para provocar un fallo deliberado de compilación; lee el mensaje y mueve la frontera correcta. Resultado esperado: build estable.

#### Paso 6 · Práctica independiente
Añade Suspense, una Server Action con validación, estado pending y una medición del JavaScript enviado al cliente.

#### Paso 7 · Cierre y evidencia
Guarda build, capturas y métricas; como siguiente paso estudia despliegue. Errores comunes: enviar secretos al cliente, usar hooks en servidor, mutar sin autorización y asumir que streaming arregla consultas lentas. Fuentes oficiales: https://nextjs.org/docs/app y https://react.dev/reference/rsc/server-components.
**¿Por qué es importante?** Porque separar servidor y cliente mejora rendimiento, seguridad y claridad de responsabilidades.
**Evidencia de aprendizaje:** entrega árbol, frontera client/server, fallo, acción y medición.
**Conceptos clave:** enviar el HTML disponible primero, no bloquear toda la página por una sección lenta.

El streaming del lado del servidor permite que Next.js envíe al navegador el HTML de las partes de una página que ya están listas, sin esperar a que absolutamente todas las secciones de esa página (incluyendo alguna sección particularmente lenta, como una consulta a una base de datos que tarda varios segundos) completen su renderizado: `<Suspense fallback={<Spinner />}><SeccionLenta /></Suspense>` permite que el resto de la página se envíe y se muestre inmediatamente, mientras `SeccionLenta` continúa renderizándose en el servidor, enviándose y reemplazando el `fallback` correspondiente en cuanto efectivamente completa, sin bloquear el resto de la página mientras tanto.

Este mismo `Suspense` que en el Módulo 5 se usaba para mostrar un `fallback` mientras un chunk de JavaScript se descargaba en el cliente, aquí se aplica del lado del servidor para el mismo propósito conceptual: permitir que partes de la interfaz que sí están listas se muestren de inmediato, sin esperar a la parte más lenta, evitando que una única sección costosa de calcular retrase la percepción de toda la página como lenta para el usuario.

**Analogía:** el streaming con Suspense es como servir primero los platos de una comida que ya están listos en la mesa, en vez de hacer esperar a todos los comensales hasta que el plato más lento de preparar esté terminado antes de servir absolutamente nada.

**¿Por qué es importante?** El streaming con Suspense evita que una sección particularmente lenta de una página retrase la percepción de toda la página, mostrando de inmediato el contenido que ya está listo.

**Código del ejemplo:**

```jsx
<Suspense fallback={<Spinner />}>
  <SeccionLenta /> {/* el resto de la página se muestra mientras esto carga */}
</Suspense>
```

### Tema 4: Server Actions

#### Paso 1 · Objetivo y preparación
Al finalizar podrás evaluar React Server Components desde cero. Prerrequisitos: Node.js LTS, npm y editor. Verifica node --version y npm --version.

#### Paso 2 · Contexto y caso real
En un caso real, una página de seguimiento debe enviar poco JavaScript, mostrar datos rápido y reservar interactividad para controles que realmente la necesitan.

#### Paso 3 · Teoría, modelo mental y analogía
Un Server Component se ejecuta en servidor y no añade código interactivo al cliente; use client marca una frontera; Suspense permite streaming; Server Actions ejecutan mutaciones en servidor con validación. La analogía es un restaurante: cocina lo estático antes de servir y envía solo la estación que requiere interacción.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-react-m10
cd ejemplo-react-m10
npx create-next-app@latest app --ts --eslint --app --src-dir --no-tailwind --use-npm
cd app
npm run dev
```
Crea src/app/deliveries/page.tsx como Server Component y src/app/deliveries/DeliveryButton.tsx con use client; explica la frontera y el resultado.

#### Paso 5 · Práctica guiada
Pista: importa deliberadamente un hook en un componente servidor para provocar un fallo deliberado de compilación; lee el mensaje y mueve la frontera correcta. Resultado esperado: build estable.

#### Paso 6 · Práctica independiente
Añade Suspense, una Server Action con validación, estado pending y una medición del JavaScript enviado al cliente.

#### Paso 7 · Cierre y evidencia
Guarda build, capturas y métricas; como siguiente paso estudia despliegue. Errores comunes: enviar secretos al cliente, usar hooks en servidor, mutar sin autorización y asumir que streaming arregla consultas lentas. Fuentes oficiales: https://nextjs.org/docs/app y https://react.dev/reference/rsc/server-components.
**¿Por qué es importante?** Porque separar servidor y cliente mejora rendimiento, seguridad y claridad de responsabilidades.
**Evidencia de aprendizaje:** entrega árbol, frontera client/server, fallo, acción y medición.
**Conceptos clave:** procesar formularios en el servidor sin un endpoint API separado.

Una Server Action es una función marcada explícitamente con `"use server"` que se ejecuta en el servidor pero que puede invocarse directamente desde un formulario del lado del cliente:

```jsx
async function crearTarea(formData) {
  "use server";
  await db.tarea.create({ data: { titulo: formData.get('titulo') } });
}
```

Invocada como `<form action={crearTarea}>`, esta función no necesita un endpoint API dedicado (una ruta HTTP separada que reciba la petición, la parsee, y la procese) que el formulario tendría que invocar explícitamente mediante `fetch`.

Next.js genera automáticamente la infraestructura de comunicación necesaria entre el formulario del cliente y la función marcada como Server Action (serializando los datos del formulario y estableciendo la petición correspondiente por debajo), reduciendo significativamente el código repetitivo que tradicionalmente se necesitaba para conectar un formulario del cliente con lógica de procesamiento del servidor: sin Server Actions, el mismo caso de uso requeriría definir una ruta API separada, un manejador de submit del lado del cliente que capture el evento, prevenga el comportamiento por defecto, serialice los datos, y realice una petición `fetch` manual hacia esa ruta.

**Analogía:** una Server Action es como entregar un formulario directamente a la persona correcta que lo procesará, sin necesidad de pasar primero por una oficina de recepción separada (el endpoint API) que reciba, registre y reenvíe el formulario hacia esa persona.

**¿Por qué es importante?** Las Server Actions eliminan la necesidad de un endpoint API separado y de código manual de serialización/envío para conectar un formulario del cliente con lógica de procesamiento del servidor.

**Código del ejemplo:**

```jsx
async function crearTarea(formData) {
  "use server";
  await db.tarea.create({ data: { titulo: formData.get('titulo') } });
}

<form action={crearTarea}><input name="titulo" /><button>Crear</button></form>
```

---


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
