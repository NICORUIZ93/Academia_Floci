# Módulo 2: Hooks esenciales


## Aprende construyendo

### Tema 1: useEffect — dependencias y limpieza

#### Paso 1 · Objetivo y preparación
Al finalizar podrás manejar efectos React desde cero. Prerrequisitos: Node.js LTS, npm y editor. Verifica npm --version.

#### Paso 2 · Contexto y caso real
En un caso real, una pantalla consulta entregas, escucha cambios y limpia recursos al desmontarse sin repetir solicitudes infinitas.

#### Paso 3 · Teoría, modelo mental y analogía
useEffect sincroniza con sistemas externos y su cleanup libera recursos; useRef guarda un valor mutable sin render; useMemo y useCallback optimizan solo con evidencia; useReducer modela transiciones. La analogía es una suscripción: se abre, se usa y se cancela con el mismo identificador.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-react-m2
cd ejemplo-react-m2
npm create vite@latest app -- --template react-ts
cd app
npm install
npm run dev
```
Crea src/components/DeliveryEffect.tsx con un effect que usa AbortController y cleanup; documenta dependencias y cleanup.

#### Paso 5 · Práctica guiada
Pista: elimina deliberadamente la limpieza para provocar un fallo deliberado de solicitudes o listeners duplicados; observa el diagnóstico y corrígelo. Resultado esperado: un recurso activo por componente.

#### Paso 6 · Práctica independiente
Añade useReducer para estados loading/success/error, memoización medida y una prueba que desmonte el componente.

#### Paso 7 · Cierre y evidencia
Guarda código, logs y medición; como siguiente paso estudia contexto. Errores comunes: effect para datos derivados, array de dependencias incompleto, memoizar todo y leer ref esperando render. Fuentes oficiales: https://react.dev/reference/react/useEffect y https://react.dev/learn/reusing-logic-with-custom-hooks.
**¿Por qué es importante?** Porque los efectos son la frontera donde React toca red, DOM y recursos externos.
**Evidencia de aprendizaje:** entrega effect, cleanup, fallo, reducer y medición.
**Conceptos clave:** sincronización con sistemas externos, array de dependencias, función de limpieza.

`useEffect` es el mecanismo de React para sincronizar un componente con un sistema externo al propio modelo de React: suscribirse a un evento del navegador (`window.addEventListener('resize', handler)`), establecer una conexión (un WebSocket, un temporizador), o cualquier operación que necesite ejecutarse como reacción a que el componente se montó o a que cierto valor cambió, en vez de como parte directa del cálculo de qué renderizar (que pertenece al cuerpo de la función componente en sí, no a un efecto).

El array de dependencias, segundo argumento de `useEffect`, controla exactamente cuándo el efecto se vuelve a ejecutar: sin ningún array (`useEffect(() => {...})`), el efecto se ejecuta después de cada render, sin excepción; con un array vacío (`useEffect(() => {...}, [])`), se ejecuta una única vez, inmediatamente después del primer montaje del componente; con un array que contiene valores específicos (`useEffect(() => {...}, [valor])`), se ejecuta después del montaje inicial y de nuevo cada vez que cualquiera de esos valores listados cambia entre un render y el siguiente, comparando cada valor mediante igualdad referencial (`Object.is`).

La función que un efecto puede devolver opcionalmente es su función de limpieza, ejecutada por React inmediatamente antes de que el efecto se vuelva a ejecutar (si sus dependencias cambiaron) y también cuando el componente se desmonta definitivamente (`return () => window.removeEventListener('resize', handler)`), garantizando que cualquier suscripción, temporizador o conexión establecida por el efecto se libere correctamente antes de establecer una nueva, o antes de que el componente deje de existir, evitando fugas de memoria del mismo tipo conceptual estudiadas para suscripciones de RxJS en el Módulo 6 del track de Angular, aunque aquí aplicado al modelo de efectos de React en vez de a Observables.

**Analogía:** un efecto sin limpieza es como suscribirse a una lista de correo sin nunca darse de baja, incluso después de mudarse de dirección; la función de limpieza es el mecanismo explícito de darse de baja correctamente antes de suscribirse a una nueva lista o de abandonar definitivamente esa dirección.

**¿Por qué es importante?** El array de dependencias controla con precisión cuándo un efecto se re-ejecuta; la función de limpieza evita fugas de recursos externos (suscripciones, temporizadores, conexiones) que sobrevivirían innecesariamente al componente o a un cambio de dependencias.

**Código del ejemplo:**

```jsx
useEffect(() => {
  const handler = () => console.log(window.innerWidth);
  window.addEventListener('resize', handler);
  return () => window.removeEventListener('resize', handler); // limpieza al desmontar
}, []); // array vacío: solo se ejecuta al montar
```

### Tema 2: useRef — valores mutables sin re-render

#### Paso 1 · Objetivo y preparación
Al finalizar podrás manejar efectos React desde cero. Prerrequisitos: Node.js LTS, npm y editor. Verifica npm --version.

#### Paso 2 · Contexto y caso real
En un caso real, una pantalla consulta entregas, escucha cambios y limpia recursos al desmontarse sin repetir solicitudes infinitas.

#### Paso 3 · Teoría, modelo mental y analogía
useEffect sincroniza con sistemas externos y su cleanup libera recursos; useRef guarda un valor mutable sin render; useMemo y useCallback optimizan solo con evidencia; useReducer modela transiciones. La analogía es una suscripción: se abre, se usa y se cancela con el mismo identificador.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-react-m2
cd ejemplo-react-m2
npm create vite@latest app -- --template react-ts
cd app
npm install
npm run dev
```
Crea src/components/DeliveryEffect.tsx con un effect que usa AbortController y cleanup; documenta dependencias y cleanup.

#### Paso 5 · Práctica guiada
Pista: elimina deliberadamente la limpieza para provocar un fallo deliberado de solicitudes o listeners duplicados; observa el diagnóstico y corrígelo. Resultado esperado: un recurso activo por componente.

#### Paso 6 · Práctica independiente
Añade useReducer para estados loading/success/error, memoización medida y una prueba que desmonte el componente.

#### Paso 7 · Cierre y evidencia
Guarda código, logs y medición; como siguiente paso estudia contexto. Errores comunes: effect para datos derivados, array de dependencias incompleto, memoizar todo y leer ref esperando render. Fuentes oficiales: https://react.dev/reference/react/useEffect y https://react.dev/learn/reusing-logic-with-custom-hooks.
**¿Por qué es importante?** Porque los efectos son la frontera donde React toca red, DOM y recursos externos.
**Evidencia de aprendizaje:** entrega effect, cleanup, fallo, reducer y medición.
**Conceptos clave:** persistencia entre renders sin disparar actualización, acceso a nodos del DOM.

`useRef` crea un objeto mutable (`{ current: valorInicial }`) que persiste con la misma identidad a través de renders sucesivos del componente, con una diferencia crucial respecto a `useState`: modificar `.current` (`renderCount.current++`) no dispara un nuevo render del componente, a diferencia de llamar a un setter de `useState`, que sí lo hace siempre. Esto hace a `useRef` apropiado específicamente para valores que el componente necesita recordar entre renders pero que no deben influir en lo que se renderiza visualmente (un contador interno de cuántas veces se renderizó el componente con fines de depuración, el valor anterior de una prop para compararlo con el actual, o un identificador de un temporizador activo que debe poder cancelarse después).

Otro uso extremadamente común de `useRef` es obtener una referencia directa a un nodo del DOM real renderizado por el componente (`<input ref={inputRef} />`, permitiendo después llamar `inputRef.current.focus()` imperativamente), un escape hatch deliberado hacia manipulación imperativa del DOM para casos donde el modelo declarativo de React no ofrece una forma directa de expresar la operación deseada (poner foco en un campo, medir sus dimensiones reales, iniciar una animación imperativa con una librería externa).

**Analogía:** `useRef` es como una libreta personal que el componente puede modificar libremente sin tener que anunciar públicamente cada cambio (sin disparar un re-render); `useState`, en cambio, es como un anuncio público formal que notifica a todos los interesados (incluyendo al propio proceso de renderizado) cada vez que cambia.

**¿Por qué es importante?** `useRef` permite mantener valores mutables persistentes entre renders (o acceder directamente a nodos del DOM) sin el costo ni la semántica de disparar un nuevo render cada vez que cambian.

**Código del ejemplo:**

```jsx
const renderCount = useRef(0);
renderCount.current++; // no causa re-render, a diferencia de useState
```

### Tema 3: useMemo y useCallback con criterio

#### Paso 1 · Objetivo y preparación
Al finalizar podrás manejar efectos React desde cero. Prerrequisitos: Node.js LTS, npm y editor. Verifica npm --version.

#### Paso 2 · Contexto y caso real
En un caso real, una pantalla consulta entregas, escucha cambios y limpia recursos al desmontarse sin repetir solicitudes infinitas.

#### Paso 3 · Teoría, modelo mental y analogía
useEffect sincroniza con sistemas externos y su cleanup libera recursos; useRef guarda un valor mutable sin render; useMemo y useCallback optimizan solo con evidencia; useReducer modela transiciones. La analogía es una suscripción: se abre, se usa y se cancela con el mismo identificador.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-react-m2
cd ejemplo-react-m2
npm create vite@latest app -- --template react-ts
cd app
npm install
npm run dev
```
Crea src/components/DeliveryEffect.tsx con un effect que usa AbortController y cleanup; documenta dependencias y cleanup.

#### Paso 5 · Práctica guiada
Pista: elimina deliberadamente la limpieza para provocar un fallo deliberado de solicitudes o listeners duplicados; observa el diagnóstico y corrígelo. Resultado esperado: un recurso activo por componente.

#### Paso 6 · Práctica independiente
Añade useReducer para estados loading/success/error, memoización medida y una prueba que desmonte el componente.

#### Paso 7 · Cierre y evidencia
Guarda código, logs y medición; como siguiente paso estudia contexto. Errores comunes: effect para datos derivados, array de dependencias incompleto, memoizar todo y leer ref esperando render. Fuentes oficiales: https://react.dev/reference/react/useEffect y https://react.dev/learn/reusing-logic-with-custom-hooks.
**¿Por qué es importante?** Porque los efectos son la frontera donde React toca red, DOM y recursos externos.
**Evidencia de aprendizaje:** entrega effect, cleanup, fallo, reducer y medición.
**Conceptos clave:** memoización de valores frente a memoización de funciones, costo real frente a beneficio real.

`useMemo(() => calculoCostoso(datos), [datos])` memoiza el resultado (el valor) de un cálculo, recalculándolo únicamente cuando alguna de las dependencias listadas cambia, en vez de recalcularlo en cada render del componente sin importar si sus entradas relevantes efectivamente cambiaron; `useCallback(() => hacer(id), [id])` es conceptualmente equivalente pero memoiza específicamente una función (una referencia estable a esa función) en vez de un valor arbitrario, siendo `useCallback(fn, deps)` sintácticamente equivalente a `useMemo(() => fn, deps)`.

Ambos hooks solo valen genuinamente la pena en dos escenarios concretos: cuando el cálculo memoizado es realista y mensurablemente costoso en tiempo de ejecución (no una suma trivial de dos números, donde recalcular es más barato que el propio overhead de comparar dependencias), o cuando memoizar una función previene el re-render innecesario de un componente hijo envuelto en `React.memo` (Módulo 9) que de otro modo recibiría una nueva referencia de función distinta en cada render del padre (dado que una función definida dentro del cuerpo del componente se recrea en cada ejecución, con una nueva identidad referencial cada vez, incluso si su lógica interna es idéntica), rompiendo la comparación superficial de props que `React.memo` realiza para decidir si evitar un re-render.

Usar `useMemo`/`useCallback` indiscriminadamente en todo el código, sin evidencia real de que resuelven un problema mensurable de rendimiento (idealmente confirmado con el Profiler, Módulo 9), agrega complejidad de lectura del código y un pequeño overhead de comparación de dependencias en cada render, sin ningún beneficio real a cambio — un antipatrón de optimización prematura que conviene evitar hasta tener evidencia concreta de que el problema que se busca resolver efectivamente existe.

**Analogía:** `useMemo`/`useCallback` son como guardar en el refrigerador solo la comida que realmente sobra y vale la pena conservar, en vez de intentar guardar cada pequeño resto de comida, gastando más esfuerzo en organizar el refrigerador que el que se ahorraría no volviendo a cocinar esos restos triviales.

**¿Por qué es importante?** `useMemo`/`useCallback` solo aportan beneficio real cuando el cálculo es genuinamente costoso o cuando previenen un re-render mensurable de un hijo memoizado; usarlos sin esa justificación agrega complejidad sin beneficio.

**Código del ejemplo:**

```jsx
const resultado = useMemo(() => calculoCostoso(datos), [datos]); // memoiza un VALOR
const manejarClick = useCallback(() => hacer(id), [id]);          // memoiza una FUNCIÓN
```

### Tema 4: Reglas de los hooks, useReducer y useImperativeHandle

#### Paso 1 · Objetivo y preparación
Al finalizar podrás manejar efectos React desde cero. Prerrequisitos: Node.js LTS, npm y editor. Verifica npm --version.

#### Paso 2 · Contexto y caso real
En un caso real, una pantalla consulta entregas, escucha cambios y limpia recursos al desmontarse sin repetir solicitudes infinitas.

#### Paso 3 · Teoría, modelo mental y analogía
useEffect sincroniza con sistemas externos y su cleanup libera recursos; useRef guarda un valor mutable sin render; useMemo y useCallback optimizan solo con evidencia; useReducer modela transiciones. La analogía es una suscripción: se abre, se usa y se cancela con el mismo identificador.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-react-m2
cd ejemplo-react-m2
npm create vite@latest app -- --template react-ts
cd app
npm install
npm run dev
```
Crea src/components/DeliveryEffect.tsx con un effect que usa AbortController y cleanup; documenta dependencias y cleanup.

#### Paso 5 · Práctica guiada
Pista: elimina deliberadamente la limpieza para provocar un fallo deliberado de solicitudes o listeners duplicados; observa el diagnóstico y corrígelo. Resultado esperado: un recurso activo por componente.

#### Paso 6 · Práctica independiente
Añade useReducer para estados loading/success/error, memoización medida y una prueba que desmonte el componente.

#### Paso 7 · Cierre y evidencia
Guarda código, logs y medición; como siguiente paso estudia contexto. Errores comunes: effect para datos derivados, array de dependencias incompleto, memoizar todo y leer ref esperando render. Fuentes oficiales: https://react.dev/reference/react/useEffect y https://react.dev/learn/reusing-logic-with-custom-hooks.
**¿Por qué es importante?** Porque los efectos son la frontera donde React toca red, DOM y recursos externos.
**Evidencia de aprendizaje:** entrega effect, cleanup, fallo, reducer y medición.
**Conceptos clave:** orden consistente de llamadas, reducers para estado complejo, exponer una API imperativa controlada.

Las reglas de los hooks establecen que los hooks deben llamarse siempre en el mismo orden, en el nivel superior de la función componente, nunca dentro de un `if`, un bucle, o una función anidada condicional: React asocia internamente cada hook con su estado correspondiente basándose estrictamente en el orden en que fueron llamados durante el render (no en un nombre o identificador explícito), por lo que llamar un hook condicionalmente (a veces sí, a veces no, según una rama de código) rompería esa asociación posicional, causando que React confunda el estado de un hook con el de otro en renders sucesivos, un error que React detecta y reporta explícitamente en desarrollo cuando ocurre.

`useReducer` modela transiciones de estado más complejas que un simple `useState` mediante el mismo patrón de reducer estudiado para NgRx en el Módulo 9 del track de Angular (aunque aquí sin la infraestructura completa de una librería dedicada): una función reducer pura que recibe el estado actual y una "action" describiendo qué ocurrió, devolviendo el nuevo estado sin mutar el original, invocada mediante `dispatch(action)` en vez de un setter directo, apropiado cuando las transiciones de estado de un componente son numerosas o interdependientes de forma no trivial (por ejemplo, un formulario multi-paso con reglas de transición complejas entre pasos).

`useImperativeHandle`, usado junto con `forwardRef`, permite a un componente controlar exactamente qué API imperativa expone hacia un componente padre que sostiene una referencia (`ref`) hacia él, en vez de exponer automáticamente el nodo DOM completo o la instancia interna completa del componente, un mecanismo deliberadamente restrictivo que preserva la encapsulación del componente hijo, exponiendo únicamente los métodos imperativos específicos que el diseño del componente decide hacer públicos (por ejemplo, un método `focus()` personalizado, sin exponer el resto de la implementación interna del componente).

**Analogía:** las reglas de los hooks son como una lista de tareas diarias que deben ejecutarse siempre en el mismo orden estricto, porque un sistema externo lleva la cuenta de cada tarea únicamente por su posición en la secuencia, no por su nombre; `useImperativeHandle` es como una recepción que solo permite a los visitantes acceder a ciertos servicios específicos autorizados del edificio, sin darles acceso irrestricto a todas las instalaciones internas.

**¿Por qué es importante?** Respetar las reglas de los hooks garantiza que React asocie correctamente cada hook con su estado interno entre renders; `useImperativeHandle` preserva la encapsulación de un componente incluso cuando expone cierta API imperativa controlada hacia su padre.

**Diagrama:**

```
Reglas de los hooks: mismo orden, nivel superior, nunca dentro de if/loop/función anidada
useReducer: dispatch(action) → reducer puro(estado, action) → nuevo estado
useImperativeHandle: expone SOLO la API imperativa explícitamente decidida, no toda la instancia
```

---


## Laboratorio práctico

**Objetivo del laboratorio:** construir un componente con un efecto de suscripción externa correctamente limpiado, y aplicar memoización con criterio.

**Requisitos previos:** Módulo 1 completado.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Suscribirse al evento `resize` de `window` | Ver Tema 1 | Verifica que se limpia al desmontar |
| 2 | Guardar el valor anterior de una prop con `useRef` | Ver Tema 2 | Sin causar un re-render adicional |
| 3 | Medir con `console.log` los recálculos sin `useMemo` | Ver Tema 3 | Luego confirma que `useMemo` evita recálculos |
| 4 | Envolver un callback con `useCallback` para un hijo memoizado | Ver Tema 3 | Verifica que evita el re-render del hijo |
| 5 | Provocar una violación de las reglas de los hooks | Ver Tema 4 | Lee el error que React reporta |

**Verificación:** el laboratorio se considera exitoso si el efecto de suscripción se limpia correctamente al desmontar (verificable sin advertencias de memory leak en consola), y si puedes demostrar con mediciones concretas que `useMemo`/`useCallback` efectivamente evitan trabajo redundante en el caso implementado.

**Errores comunes y soluciones**

- **Olvidar la función de limpieza en un efecto con suscripción.** Siempre que un efecto se suscribe a algo, debe devolver una función que se desuscriba.
- **Llamar un hook dentro de un `if`.** Mueve la condición dentro del hook, no alrededor de él.
- **Usar `useMemo`/`useCallback` en todo sin medir.** Verifica primero con el Profiler (Módulo 9) que el problema de rendimiento existe realmente.

---
