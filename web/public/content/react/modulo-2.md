# Módulo 2: Hooks esenciales

## Sílabo

**Objetivo general**

Dominar los hooks fundamentales de React más allá de `useState`: `useEffect` con su ciclo de dependencias y limpieza, `useRef` para valores mutables sin re-render, `useMemo`/`useCallback` con criterio real, las reglas de los hooks, `useReducer` y `useImperativeHandle`.

**Objetivos específicos**

1. Configurar correctamente el array de dependencias de `useEffect`, incluyendo su función de limpieza.
2. Usar `useRef` para valores mutables que no deben disparar un re-render.
3. Determinar cuándo `useMemo`/`useCallback` realmente mejoran el rendimiento.
4. Explicar y respetar las reglas de los hooks.
5. Modelar estado complejo con `useReducer`.

**Contenido**

- `useEffect`: dependencias y limpieza.
- `useRef` para valores mutables sin re-render.
- `useMemo` y `useCallback`: cuándo realmente ayudan.
- Reglas de los hooks.
- `useReducer`: reducers, dispatch y action types.
- `useImperativeHandle` y `forwardRef`.

**Evaluación**

Componente con un efecto de suscripción externa correctamente limpiado al desmontar, más tres ejercicios de evaluación.

---

## Comienza desde cero: prepara este capítulo

Este recorrido parte de una carpeta vacía. Al finalizar tendrás **Componente con un efecto de suscripción externa correctamente limpiado al desmontar, más tres ejercicios de evaluación.** No avances ejecutando comandos que no comprendes: primero identifica la entrada, la transformación y la evidencia que comprobará el resultado.

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
npm create vite@latest academia-labs/react-app -- --template react-ts
cd academia-labs/react-app
npm install
git init
```

Trabaja dentro de `academia-labs/react-app`. Si ya existe, no lo vuelvas a generar: entra en la carpeta, confirma `git status` y continúa sobre una rama propia.

### 3. Ubica cada tema antes de escribir

```text
academia-labs/react-app/
├─ src/features/
│  └─ module-2/
├─ tests/
├─ docs/decisions/
├─ evidence/module-2/
└─ README.md
```

| Tema | Archivo o decisión | Evidencia mínima |
|---|---|---|
| 1. useEffect — dependencias y limpieza | `src/features/module-2/topic-1-useeffect-dependencias-y-limpieza.tsx` | prueba + salida observable |
| 2. useRef — valores mutables sin re-render | `src/features/module-2/topic-2-useref-valores-mutables-sin-re-render.tsx` | prueba + salida observable |
| 3. useMemo y useCallback con criterio | `src/features/module-2/topic-3-usememo-y-usecallback-con-criterio.tsx` | prueba + salida observable |
| 4. Reglas de los hooks, useReducer y useImperativeHandle | `src/features/module-2/topic-4-reglas-de-los-hooks-usereducer-y-useimperativehandle.tsx` | prueba + salida observable |

Un ejemplo técnico vive en el archivo indicado y debe tener una prueba. Un tema conceptual vive en `docs/decisions/`: compara opciones usando restricciones medibles; no escribas código decorativo solo para llenar espacio.

### 4. Ejecuta una línea base

Desde `academia-labs/react-app`:

```bash
npm test -- --run && npm run dev
```

**Resultado esperado:** el comando reconoce el proyecto y termina sin errores antes de introducir el cambio del capítulo. Después del incremento, la evidencia debe demostrar: **Componente con un efecto de suscripción externa correctamente limpiado al desmontar, más tres ejercicios de evaluación.**

Si falla la línea base, no continúes. Localiza el primer mensaje que indique archivo, línea o dependencia; formula una causa y compruébala con un cambio pequeño.

### 5. Provoca un fallo y recupérate

Cambia una prop o respuesta a un caso vacío o erróneo; observa el estado visual y corrige desde la primera causa. Guarda en `evidence/module-2/` el comando, la salida relevante, tu hipótesis y la corrección. Revierte únicamente el cambio deliberado; no borres todo el proyecto para ocultar la causa.

### 6. Conecta el capítulo con RutaFlow

Aplica el aprendizaje de **Hooks esenciales** a un incremento vertical de RutaFlow. Define qué componente produce el dato, qué contrato lo transporta, quién lo consume y cómo observarás un fallo. La entrega final incluye archivo o decisión, prueba, salida, error corregido y una limitación que todavía validarías en producción.

---

## Contenido teórico

### Tema 1: useEffect — dependencias y limpieza

**Conceptos clave:** sincronización con sistemas externos, array de dependencias, función de limpieza.

`useEffect` es el mecanismo de React para sincronizar un componente con un sistema externo al propio modelo de React: suscribirse a un evento del navegador (`window.addEventListener('resize', handler)`), establecer una conexión (un WebSocket, un temporizador), o cualquier operación que necesite ejecutarse como reacción a que el componente se montó o a que cierto valor cambió, en vez de como parte directa del cálculo de qué renderizar (que pertenece al cuerpo de la función componente en sí, no a un efecto).

El array de dependencias, segundo argumento de `useEffect`, controla exactamente cuándo el efecto se vuelve a ejecutar: sin ningún array (`useEffect(() => {...})`), el efecto se ejecuta después de cada render, sin excepción; con un array vacío (`useEffect(() => {...}, [])`), se ejecuta una única vez, inmediatamente después del primer montaje del componente; con un array que contiene valores específicos (`useEffect(() => {...}, [valor])`), se ejecuta después del montaje inicial y de nuevo cada vez que cualquiera de esos valores listados cambia entre un render y el siguiente, comparando cada valor mediante igualdad referencial (`Object.is`).

La función que un efecto puede devolver opcionalmente es su función de limpieza, ejecutada por React inmediatamente antes de que el efecto se vuelva a ejecutar (si sus dependencias cambiaron) y también cuando el componente se desmonta definitivamente (`return () => window.removeEventListener('resize', handler)`), garantizando que cualquier suscripción, temporizador o conexión establecida por el efecto se libere correctamente antes de establecer una nueva, o antes de que el componente deje de existir, evitando fugas de memoria del mismo tipo conceptual estudiadas para suscripciones de RxJS en el Módulo 6 del track de Angular, aunque aquí aplicado al modelo de efectos de React en vez de a Observables.

**Analogía:** un efecto sin limpieza es como suscribirse a una lista de correo sin nunca darse de baja, incluso después de mudarse de dirección; la función de limpieza es el mecanismo explícito de darse de baja correctamente antes de suscribirse a una nueva lista o de abandonar definitivamente esa dirección.

**¿Por qué es importante?** El array de dependencias controla con precisión cuándo un efecto se re-ejecuta; la función de limpieza evita fugas de recursos externos (suscripciones, temporizadores, conexiones) que sobrevivirían innecesariamente al componente o a un cambio de dependencias.

**Diagrama:**

```jsx
useEffect(() => {
  const handler = () => console.log(window.innerWidth);
  window.addEventListener('resize', handler);
  return () => window.removeEventListener('resize', handler); // limpieza al desmontar
}, []); // array vacío: solo se ejecuta al montar
```

### Tema 2: useRef — valores mutables sin re-render

**Conceptos clave:** persistencia entre renders sin disparar actualización, acceso a nodos del DOM.

`useRef` crea un objeto mutable (`{ current: valorInicial }`) que persiste con la misma identidad a través de renders sucesivos del componente, con una diferencia crucial respecto a `useState`: modificar `.current` (`renderCount.current++`) no dispara un nuevo render del componente, a diferencia de llamar a un setter de `useState`, que sí lo hace siempre. Esto hace a `useRef` apropiado específicamente para valores que el componente necesita recordar entre renders pero que no deben influir en lo que se renderiza visualmente (un contador interno de cuántas veces se renderizó el componente con fines de depuración, el valor anterior de una prop para compararlo con el actual, o un identificador de un temporizador activo que debe poder cancelarse después).

Otro uso extremadamente común de `useRef` es obtener una referencia directa a un nodo del DOM real renderizado por el componente (`<input ref={inputRef} />`, permitiendo después llamar `inputRef.current.focus()` imperativamente), un escape hatch deliberado hacia manipulación imperativa del DOM para casos donde el modelo declarativo de React no ofrece una forma directa de expresar la operación deseada (poner foco en un campo, medir sus dimensiones reales, iniciar una animación imperativa con una librería externa).

**Analogía:** `useRef` es como una libreta personal que el componente puede modificar libremente sin tener que anunciar públicamente cada cambio (sin disparar un re-render); `useState`, en cambio, es como un anuncio público formal que notifica a todos los interesados (incluyendo al propio proceso de renderizado) cada vez que cambia.

**¿Por qué es importante?** `useRef` permite mantener valores mutables persistentes entre renders (o acceder directamente a nodos del DOM) sin el costo ni la semántica de disparar un nuevo render cada vez que cambian.

**Diagrama:**

```jsx
const renderCount = useRef(0);
renderCount.current++; // no causa re-render, a diferencia de useState
```

### Tema 3: useMemo y useCallback con criterio

**Conceptos clave:** memoización de valores frente a memoización de funciones, costo real frente a beneficio real.

`useMemo(() => calculoCostoso(datos), [datos])` memoiza el resultado (el valor) de un cálculo, recalculándolo únicamente cuando alguna de las dependencias listadas cambia, en vez de recalcularlo en cada render del componente sin importar si sus entradas relevantes efectivamente cambiaron; `useCallback(() => hacer(id), [id])` es conceptualmente equivalente pero memoiza específicamente una función (una referencia estable a esa función) en vez de un valor arbitrario, siendo `useCallback(fn, deps)` sintácticamente equivalente a `useMemo(() => fn, deps)`.

Ambos hooks solo valen genuinamente la pena en dos escenarios concretos: cuando el cálculo memoizado es realista y mensurablemente costoso en tiempo de ejecución (no una suma trivial de dos números, donde recalcular es más barato que el propio overhead de comparar dependencias), o cuando memoizar una función previene el re-render innecesario de un componente hijo envuelto en `React.memo` (Módulo 9) que de otro modo recibiría una nueva referencia de función distinta en cada render del padre (dado que una función definida dentro del cuerpo del componente se recrea en cada ejecución, con una nueva identidad referencial cada vez, incluso si su lógica interna es idéntica), rompiendo la comparación superficial de props que `React.memo` realiza para decidir si evitar un re-render.

Usar `useMemo`/`useCallback` indiscriminadamente en todo el código, sin evidencia real de que resuelven un problema mensurable de rendimiento (idealmente confirmado con el Profiler, Módulo 9), agrega complejidad de lectura del código y un pequeño overhead de comparación de dependencias en cada render, sin ningún beneficio real a cambio — un antipatrón de optimización prematura que conviene evitar hasta tener evidencia concreta de que el problema que se busca resolver efectivamente existe.

**Analogía:** `useMemo`/`useCallback` son como guardar en el refrigerador solo la comida que realmente sobra y vale la pena conservar, en vez de intentar guardar cada pequeño resto de comida, gastando más esfuerzo en organizar el refrigerador que el que se ahorraría no volviendo a cocinar esos restos triviales.

**¿Por qué es importante?** `useMemo`/`useCallback` solo aportan beneficio real cuando el cálculo es genuinamente costoso o cuando previenen un re-render mensurable de un hijo memoizado; usarlos sin esa justificación agrega complejidad sin beneficio.

**Diagrama:**

```jsx
const resultado = useMemo(() => calculoCostoso(datos), [datos]); // memoiza un VALOR
const manejarClick = useCallback(() => hacer(id), [id]);          // memoiza una FUNCIÓN
```

### Tema 4: Reglas de los hooks, useReducer y useImperativeHandle

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

## Ejercicios de evaluación

### Ejercicio 1: Por qué useEffect sin dependencias corre en cada render

**Enunciado:** explica por qué un `useEffect` sin array de dependencias se ejecuta después de cada render, y en qué se diferencia de pasar un array vacío.

**Solución esperada:** sin ningún array de dependencias, React no tiene ninguna condición para decidir si debe saltarse la re-ejecución del efecto, por lo que lo ejecuta después de cada render sin excepción; un array vacío `[]` le indica explícitamente a React que no hay ninguna dependencia que vigilar, por lo que el efecto se ejecuta una única vez, tras el montaje inicial.

**Criterios de éxito:**
- Explica correctamente la diferencia entre ausencia de array (cada render) y array vacío (solo al montar).

### Ejercicio 2: Cuándo useMemo realmente ayuda

**Enunciado:** da un ejemplo donde `useMemo` NO aporta ningún beneficio real, y otro donde sí lo aporta claramente.

**Solución esperada:** `useMemo` sobre una suma trivial de dos números no aporta beneficio, dado que el propio overhead de comparar dependencias es más costoso que recalcular la suma; `useMemo` sobre un cálculo genuinamente costoso (por ejemplo, procesar y ordenar un arreglo grande de miles de elementos) sí aporta beneficio real, evitando recalcular ese trabajo costoso en cada render si sus dependencias no cambiaron.

**Criterios de éxito:**
- Da ejemplos correctos que distinguen un caso trivial (sin beneficio) de un caso genuinamente costoso (con beneficio).

### Ejercicio 3: Reglas de los hooks

**Enunciado:** explica por qué llamar un hook dentro de un `if` rompe el funcionamiento correcto de React.

**Solución esperada:** React asocia cada hook con su estado interno basándose estrictamente en el orden posicional en que fueron llamados durante el render, no en un nombre explícito; si un hook se llama condicionalmente (a veces sí, a veces no), el orden posicional de los hooks siguientes cambia entre renders, haciendo que React asocie el estado equivocado a cada hook.

**Criterios de éxito:**
- Explica correctamente la asociación posicional de hooks y por qué una llamada condicional la rompe.

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

- El array de dependencias de `useEffect` controla exactamente cuándo se re-ejecuta; su función de limpieza evita fugas de recursos externos.
- `useRef` persiste valores mutables entre renders sin disparar un nuevo render.
- `useMemo`/`useCallback` solo valen la pena con un cálculo genuinamente costoso o para prevenir re-renders de hijos memoizados.
- Las reglas de los hooks exigen orden consistente; `useReducer` modela transiciones de estado complejas; `useImperativeHandle` preserva la encapsulación al exponer una API imperativa.

**Conceptos aprendidos**

- `useEffect`, dependencias y limpieza.
- `useRef` para valores mutables sin re-render.
- `useMemo` y `useCallback` con criterio.
- Reglas de los hooks, `useReducer` y `useImperativeHandle`.

**Próximos pasos**

En el Módulo 3 aprenderás formularios y eventos: componentes controlados avanzados, React Hook Form, validación con zod, y formularios multi-paso.

**Recursos adicionales**

- Documentación oficial de React (react.dev): "Synchronizing with Effects", "Referencing Values with Refs" y "Rules of Hooks".
