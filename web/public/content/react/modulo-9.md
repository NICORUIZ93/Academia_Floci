# Módulo 9: Performance en React


## Aprende construyendo

### Tema 1: Medir antes de optimizar

#### Paso 1 · Objetivo y preparación
Al finalizar podrás investigar rendimiento React desde cero. Prerrequisitos: Node.js LTS, npm y editor. Verifica npm --version.

#### Paso 2 · Contexto y caso real
En un caso real, una lista de miles de entregas debe responder al teclado y cargar sin bloquear la pantalla.

#### Paso 3 · Teoría, modelo mental y analogía
Profiler y métricas establecen baseline; React.memo evita renders si props son estables; virtualización reduce DOM; code-splitting reduce carga inicial; transitions priorizan interacción. La analogía es una carretera: medir tráfico antes de añadir carriles evita gastar donde no está el cuello de botella.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-react-m9
cd ejemplo-react-m9
npm create vite@latest app -- --template react-ts
cd app
npm install
npm run dev
```
Crea src/components/DeliveryList.tsx con 10000 filas y una medición; añade memo o virtualización y compara.

#### Paso 5 · Práctica guiada
Pista: introduce deliberadamente un cálculo costoso durante cada render para provocar un fallo deliberado de interacción; mide el bloqueo y corrígelo con transición o virtualización. Resultado esperado: mejora medida, no solo sensación.

#### Paso 6 · Práctica independiente
Añade lazy import, useDeferredValue, presupuesto de bundle y una tabla antes/después con Profiler.

#### Paso 7 · Cierre y evidencia
Guarda perfiles, métricas y bundle; como siguiente paso estudia despliegue. Errores comunes: memoizar sin medir, comparar props siempre nuevas, virtualizar contenido pequeño y optimizar microsegundos irrelevantes. Fuentes oficiales: https://react.dev/learn/render-and-commit y https://react.dev/reference/react/useTransition.
**¿Por qué es importante?** Porque rendimiento es una propiedad medible de la experiencia, no una colección de trucos.
**Evidencia de aprendizaje:** entrega baseline, perfil, cambio y comparación; explica el resultado y conserva la salida.
**Conceptos clave:** React DevTools Profiler, evidencia antes que intuición.

React DevTools Profiler graba una interacción específica de la aplicación (un clic, escribir en un input, navegar entre vistas) y muestra exactamente qué componentes se re-renderizaron durante esa interacción y por qué (props que cambiaron, estado que cambió, o simplemente que su componente padre se re-renderizó, arrastrando consigo un re-render del hijo aunque sus props sean idénticas), información concreta y medible que reemplaza la intuición o suposición sobre qué parte del código podría estar causando lentitud.

Optimizar código sin esta información concreta es, en la inmensa mayoría de los casos, esfuerzo desperdiciado en el lugar equivocado: es común intuir que cierto componente "parece pesado" y envolverlo preventivamente en `React.memo` (Tema 2), cuando en realidad el componente que efectivamente causa el problema de rendimiento percibido es otro completamente distinto, identificable únicamente inspeccionando el Profiler durante la interacción real que el usuario reporta como lenta, en vez de adivinar basándose en una impresión general del código.

**Analogía:** optimizar sin el Profiler es como intentar reparar un motor de auto basándose únicamente en la intuición de qué pieza "suena mal", en vez de conectar un diagnóstico real que muestre exactamente qué componente específico está fallando y por qué.

**¿Por qué es importante?** El Profiler proporciona evidencia concreta de qué componentes se re-renderizan innecesariamente y por qué, evitando esfuerzo de optimización desperdiciado en suposiciones incorrectas sobre dónde está el problema real.

**Diagrama:**

```
Profiler graba una interacción → muestra QUÉ componentes se re-renderizaron y POR QUÉ
(props cambiadas / estado cambiado / re-render heredado del padre)
```

### Tema 2: React.memo con criterio

#### Paso 1 · Objetivo y preparación
Al finalizar podrás investigar rendimiento React desde cero. Prerrequisitos: Node.js LTS, npm y editor. Verifica npm --version.

#### Paso 2 · Contexto y caso real
En un caso real, una lista de miles de entregas debe responder al teclado y cargar sin bloquear la pantalla.

#### Paso 3 · Teoría, modelo mental y analogía
Profiler y métricas establecen baseline; React.memo evita renders si props son estables; virtualización reduce DOM; code-splitting reduce carga inicial; transitions priorizan interacción. La analogía es una carretera: medir tráfico antes de añadir carriles evita gastar donde no está el cuello de botella.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-react-m9
cd ejemplo-react-m9
npm create vite@latest app -- --template react-ts
cd app
npm install
npm run dev
```
Crea src/components/DeliveryList.tsx con 10000 filas y una medición; añade memo o virtualización y compara.

#### Paso 5 · Práctica guiada
Pista: introduce deliberadamente un cálculo costoso durante cada render para provocar un fallo deliberado de interacción; mide el bloqueo y corrígelo con transición o virtualización. Resultado esperado: mejora medida, no solo sensación.

#### Paso 6 · Práctica independiente
Añade lazy import, useDeferredValue, presupuesto de bundle y una tabla antes/después con Profiler.

#### Paso 7 · Cierre y evidencia
Guarda perfiles, métricas y bundle; como siguiente paso estudia despliegue. Errores comunes: memoizar sin medir, comparar props siempre nuevas, virtualizar contenido pequeño y optimizar microsegundos irrelevantes. Fuentes oficiales: https://react.dev/learn/render-and-commit y https://react.dev/reference/react/useTransition.
**¿Por qué es importante?** Porque rendimiento es una propiedad medible de la experiencia, no una colección de trucos.
**Evidencia de aprendizaje:** entrega baseline, perfil, cambio y comparación; explica el resultado y conserva la salida.
**Conceptos clave:** comparación superficial de props, overhead de comparación, cuándo realmente ayuda.

`React.memo(function Fila({ item }) { return <li>{item.nombre}</li>; })` envuelve un componente para que React realice una comparación superficial de sus props entre el render anterior y el actual antes de volver a ejecutar la función del componente: si todas las props son referencialmente iguales al render anterior, React se salta completamente la re-ejecución de ese componente y reutiliza el resultado anterior, en vez de volver a calcular un árbol de elementos idéntico innecesariamente.

`React.memo` solo aporta un beneficio real cuando el componente efectivamente recibe las mismas props en renders sucesivos con una frecuencia significativa (por ejemplo, una fila de una lista larga que se re-renderiza cada vez que el componente padre se actualiza por una razón no relacionada con esa fila específica): envolver absolutamente todos los componentes de la aplicación con `React.memo` de forma indiscriminada agrega el overhead de esa comparación superficial de props en cada render, sin ningún beneficio real en componentes que de todas formas reciben props distintas en la mayoría de sus renders (donde la comparación superficial siempre determinaría que sí hay que re-renderizar, agregando el costo de la comparación sin evitar ningún trabajo real).

**Analogía:** `React.memo` es como un guardia que compara una lista de invitados exacta antes de dejar pasar a un evento que ya ocurrió con la misma lista, ahorrando repetir el mismo trabajo; pedirle a ese guardia que revise la lista incluso cuando la lista prácticamente siempre cambia agrega el costo de la revisión sin ahorrar ningún trabajo real, dado que casi siempre habrá que dejar pasar de todas formas.

**¿Por qué es importante?** `React.memo` solo ayuda cuando un componente recibe las mismas props con frecuencia significativa; aplicarlo indiscriminadamente agrega overhead de comparación sin beneficio real en componentes que de todas formas cambian de props frecuentemente.

**Código del ejemplo:**

```jsx
const Fila = React.memo(function Fila({ item }) {
  return <li>{item.nombre}</li>;
}); // solo se re-renderiza si `item` cambia (comparación superficial)
```

### Tema 3: Virtualización y code-splitting

#### Paso 1 · Objetivo y preparación
Al finalizar podrás investigar rendimiento React desde cero. Prerrequisitos: Node.js LTS, npm y editor. Verifica npm --version.

#### Paso 2 · Contexto y caso real
En un caso real, una lista de miles de entregas debe responder al teclado y cargar sin bloquear la pantalla.

#### Paso 3 · Teoría, modelo mental y analogía
Profiler y métricas establecen baseline; React.memo evita renders si props son estables; virtualización reduce DOM; code-splitting reduce carga inicial; transitions priorizan interacción. La analogía es una carretera: medir tráfico antes de añadir carriles evita gastar donde no está el cuello de botella.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-react-m9
cd ejemplo-react-m9
npm create vite@latest app -- --template react-ts
cd app
npm install
npm run dev
```
Crea src/components/DeliveryList.tsx con 10000 filas y una medición; añade memo o virtualización y compara.

#### Paso 5 · Práctica guiada
Pista: introduce deliberadamente un cálculo costoso durante cada render para provocar un fallo deliberado de interacción; mide el bloqueo y corrígelo con transición o virtualización. Resultado esperado: mejora medida, no solo sensación.

#### Paso 6 · Práctica independiente
Añade lazy import, useDeferredValue, presupuesto de bundle y una tabla antes/después con Profiler.

#### Paso 7 · Cierre y evidencia
Guarda perfiles, métricas y bundle; como siguiente paso estudia despliegue. Errores comunes: memoizar sin medir, comparar props siempre nuevas, virtualizar contenido pequeño y optimizar microsegundos irrelevantes. Fuentes oficiales: https://react.dev/learn/render-and-commit y https://react.dev/reference/react/useTransition.
**¿Por qué es importante?** Porque rendimiento es una propiedad medible de la experiencia, no una colección de trucos.
**Evidencia de aprendizaje:** entrega baseline, perfil, cambio y comparación; explica el resultado y conserva la salida.
**Conceptos clave:** renderizar solo lo visible, dividir el bundle en chunks.

Renderizar una lista de 10,000 elementos completos en el DOM, incluso si la mayoría no son visibles en la pantalla en un momento dado, es costoso tanto en tiempo de renderizado inicial como en memoria consumida por nodos DOM que el usuario nunca ve directamente; la virtualización (`<FixedSizeList height={600} itemCount={10000} itemSize={40}>{({ index, style }) => <div style={style}>{datos[index].nombre}</div>}</FixedSizeList>` con `react-window`) renderiza únicamente los elementos actualmente visibles en el viewport (más un pequeño margen para un scroll suave), reciclando los mismos nodos DOM a medida que el usuario hace scroll, en vez de mantener los 10,000 nodos completos existiendo simultáneamente en el DOM real.

`React.lazy(() => import('./Reportes'))` combinado con `Suspense` (estudiado en profundidad en el Módulo 5 para code-splitting por ruta) divide el bundle de JavaScript en chunks separados descargados bajo demanda, reduciendo el tamaño del bundle inicial que la aplicación necesita descargar y ejecutar antes de volverse interactiva, una técnica de reducción de trabajo inicial complementaria (pero distinta) a la virtualización, que reduce el trabajo de renderizado continuo de listas largas ya cargadas.

**Analogía:** la virtualización es como un teatro que solo construye físicamente los asientos de la sección actualmente visible desde donde alguien mira, en vez de construir las 10,000 butacas completas de un estadio entero de una sola vez; el code-splitting es como entregar solo el capítulo del manual que el usuario necesita en este momento, en vez del libro completo de antemano.

**¿Por qué es importante?** La virtualización reduce drásticamente el costo de renderizar listas largas al mantener en el DOM solo los elementos visibles; el code-splitting reduce el bundle inicial descargado, mejorando el tiempo hasta que la aplicación se vuelve interactiva.

**Código del ejemplo:**

```jsx
import { FixedSizeList } from 'react-window';
<FixedSizeList height={600} itemCount={10000} itemSize={40}>
  {({ index, style }) => <div style={style}>{datos[index].nombre}</div>}
</FixedSizeList>

const Reportes = lazy(() => import('./Reportes'));
<Suspense fallback={<Spinner />}><Reportes /></Suspense>
```

### Tema 4: useTransition, useDeferredValue y Fiber

#### Paso 1 · Objetivo y preparación
Al finalizar podrás investigar rendimiento React desde cero. Prerrequisitos: Node.js LTS, npm y editor. Verifica npm --version.

#### Paso 2 · Contexto y caso real
En un caso real, una lista de miles de entregas debe responder al teclado y cargar sin bloquear la pantalla.

#### Paso 3 · Teoría, modelo mental y analogía
Profiler y métricas establecen baseline; React.memo evita renders si props son estables; virtualización reduce DOM; code-splitting reduce carga inicial; transitions priorizan interacción. La analogía es una carretera: medir tráfico antes de añadir carriles evita gastar donde no está el cuello de botella.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-react-m9
cd ejemplo-react-m9
npm create vite@latest app -- --template react-ts
cd app
npm install
npm run dev
```
Crea src/components/DeliveryList.tsx con 10000 filas y una medición; añade memo o virtualización y compara.

#### Paso 5 · Práctica guiada
Pista: introduce deliberadamente un cálculo costoso durante cada render para provocar un fallo deliberado de interacción; mide el bloqueo y corrígelo con transición o virtualización. Resultado esperado: mejora medida, no solo sensación.

#### Paso 6 · Práctica independiente
Añade lazy import, useDeferredValue, presupuesto de bundle y una tabla antes/después con Profiler.

#### Paso 7 · Cierre y evidencia
Guarda perfiles, métricas y bundle; como siguiente paso estudia despliegue. Errores comunes: memoizar sin medir, comparar props siempre nuevas, virtualizar contenido pequeño y optimizar microsegundos irrelevantes. Fuentes oficiales: https://react.dev/learn/render-and-commit y https://react.dev/reference/react/useTransition.
**¿Por qué es importante?** Porque rendimiento es una propiedad medible de la experiencia, no una colección de trucos.
**Evidencia de aprendizaje:** entrega baseline, perfil, cambio y comparación; explica el resultado y conserva la salida.
**Conceptos clave:** actualizaciones no urgentes, arquitectura de trabajo interrumpible.

`useTransition` permite marcar ciertas actualizaciones de estado como "de transición" (no urgentes), indicándole a React que puede posponer o interrumpir ese trabajo de renderizado específico en favor de actualizaciones más urgentes que ocurran mientras tanto (como seguir respondiendo instantáneamente a la escritura del usuario en un input, mientras una lista de resultados derivados de ese input, potencialmente costosa de recalcular, se actualiza en segundo plano con menor prioridad); `useDeferredValue` ofrece un mecanismo relacionado, proporcionando una versión "retrasada" de un valor que se actualiza con menor prioridad que el valor original, útil para mantener la interfaz responsiva mientras un cálculo derivado costoso se pone al día en segundo plano.

Estas APIs son posibles gracias a Fiber, la arquitectura interna de React (introducida como reescritura completa del motor de reconciliación) que representa el árbol de trabajo de renderizado como una estructura de datos que puede pausarse, reanudarse y priorizarse de forma incremental, en vez del algoritmo de reconciliación anterior (previo a Fiber), que ejecutaba el trabajo de renderizado de forma síncrona e ininterrumpible de principio a fin una vez iniciado. Reconciliation es el proceso mediante el cual React compara el árbol de elementos anterior con el nuevo (Módulo 1, Tema 2) para determinar el conjunto mínimo de cambios reales que aplicar al DOM, y Fiber es la arquitectura que permite que ese proceso de comparación se ejecute de forma interrumpible y priorizable, en vez de bloquear el hilo principal del navegador de forma ininterrumpida durante actualizaciones costosas.

**Analogía:** `useTransition` es como decirle a un asistente "esto puede esperar, atiende primero cualquier solicitud urgente que llegue mientras tanto"; Fiber es como reorganizar el flujo de trabajo de ese asistente para que pueda pausar una tarea larga en curso, atender algo urgente que acaba de llegar, y luego retomar exactamente donde la había dejado, en vez de tener que completar obligatoriamente la tarea larga en curso antes de poder atender cualquier otra cosa.

**¿Por qué es importante?** `useTransition`/`useDeferredValue` mantienen la interfaz responsiva ante actualizaciones costosas al priorizar el trabajo urgente sobre el no urgente, una capacidad habilitada estructuralmente por la arquitectura Fiber, que hace que el trabajo de renderizado sea interrumpible y priorizable.

**Diagrama:**

```
Fiber: árbol de trabajo interrumpible y priorizable (reemplaza el reconciliador síncrono anterior)
useTransition: marca una actualización como no urgente, interrumpible por trabajo más urgente
useDeferredValue: ofrece una versión "retrasada" de un valor, actualizada con menor prioridad
```

---


## Laboratorio práctico

**Objetivo del laboratorio:** medir con el Profiler, aplicar `React.memo` con criterio, y virtualizar una lista larga.

**Requisitos previos:** Módulos 0-8 completados.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Grabar una interacción con el Profiler | — | Encuentra un componente que se re-renderiza sin necesidad |
| 2 | Envolver ese componente con `React.memo` | Ver Tema 2 | Confirma con el Profiler que el render innecesario desaparece |
| 3 | Virtualizar una lista de 10,000 elementos | Ver Tema 3 | Compara el rendimiento de scroll antes/después |
| 4 | Dividir un bundle grande con `React.lazy` | Ver Tema 3 | Verifica la mejora en el tiempo de carga inicial |

**Verificación:** el laboratorio se considera exitoso si puedes mostrar una comparación concreta antes/después con el Profiler del componente optimizado, y si la lista virtualizada mantiene un scroll fluido con 10,000 elementos donde la versión sin virtualizar no lo hacía.

**Errores comunes y soluciones**

- **Optimizar sin medir primero con el Profiler.** Identifica el componente problemático real antes de aplicar cualquier optimización.
- **Envolver todo con `React.memo` sin criterio.** Solo aplícalo donde el componente recibe las mismas props con frecuencia significativa.
- **Renderizar listas largas sin virtualizar.** Usa `react-window` u otra librería de virtualización para listas de miles de elementos.

---
