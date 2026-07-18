# Módulo 10: Patrones avanzados y rendimiento

## Sílabo

**Objetivo general**

Diagnosticar y resolver problemas reales de rendimiento en JavaScript basándose en evidencia medible (profiling), en vez de optimizar a ciegas, dominando debounce/throttle, memoización, Web Workers y las métricas Core Web Vitals.

**Objetivos específicos**

1. Implementar `throttle` y diferenciarlo claramente de `debounce`.
2. Implementar memoización genérica y explicar cuándo es contraproducente.
3. Mover trabajo pesado a un Web Worker sin bloquear la UI principal.
4. Usar la pestaña Performance de las DevTools para identificar cuellos de botella reales.
5. Explicar las métricas Core Web Vitals (LCP, CLS, INP) y su relevancia.
6. Explicar los conceptos básicos de seguridad web: XSS, CSRF, CSP y CORS.

**Contenido**

- Debounce y throttle.
- Memoización.
- Web Workers para trabajo pesado.
- Profiling con DevTools Performance tab.
- Core Web Vitals: LCP, CLS, INP.
- `preload`, `prefetch`, `preconnect` y carga async/defer de scripts.
- Seguridad básica: XSS, CSRF, CSP y CORS.

**Evaluación**

Una optimización medible (antes/después con métricas reales) de una función costosa, más tres ejercicios de evaluación.

---

## Comienza desde cero: prepara este capítulo

Este recorrido parte de una carpeta vacía. Al finalizar tendrás **Una optimización medible (antes/después con métricas reales) de una función costosa, más tres ejercicios de evaluación.** No avances ejecutando comandos que no comprendes: primero identifica la entrada, la transformación y la evidencia que comprobará el resultado.

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
│  └─ module-10/
├─ tests/
├─ docs/decisions/
├─ evidence/module-10/
└─ README.md
```

| Tema | Archivo o decisión | Evidencia mínima |
|---|---|---|
| 1. Debounce y throttle | `src/module-10/topic-1-debounce-y-throttle.ts` | prueba + salida observable |
| 2. Memoización | `src/module-10/topic-2-memoizacion.ts` | prueba + salida observable |
| 3. Web Workers para trabajo pesado | `src/module-10/topic-3-web-workers-para-trabajo-pesado.ts` | prueba + salida observable |
| 4. Profiling con DevTools | `src/module-10/topic-4-profiling-con-devtools.ts` | prueba + salida observable |
| 5. Core Web Vitals | `src/module-10/topic-5-core-web-vitals.ts` | prueba + salida observable |

Un ejemplo técnico vive en el archivo indicado y debe tener una prueba. Un tema conceptual vive en `docs/decisions/`: compara opciones usando restricciones medibles; no escribas código decorativo solo para llenar espacio.

### 4. Ejecuta una línea base

Desde `academia-labs/javascript`:

```bash
npm test && npm run dev
```

**Resultado esperado:** el comando reconoce el proyecto y termina sin errores antes de introducir el cambio del capítulo. Después del incremento, la evidencia debe demostrar: **Una optimización medible (antes/después con métricas reales) de una función costosa, más tres ejercicios de evaluación.**

Si falla la línea base, no continúes. Localiza el primer mensaje que indique archivo, línea o dependencia; formula una causa y compruébala con un cambio pequeño.

### 5. Provoca un fallo y recupérate

Prueba un valor límite, un tipo inesperado o una operación fuera de orden; compara la salida con tu predicción. Guarda en `evidence/module-10/` el comando, la salida relevante, tu hipótesis y la corrección. Revierte únicamente el cambio deliberado; no borres todo el proyecto para ocultar la causa.

### 6. Conecta el capítulo con RutaFlow

Aplica el aprendizaje de **Patrones avanzados y rendimiento** a un incremento vertical de RutaFlow. Define qué componente produce el dato, qué contrato lo transporta, quién lo consume y cómo observarás un fallo. La entrega final incluye archivo o decisión, prueba, salida, error corregido y una limitación que todavía validarías en producción.

---

## Contenido teórico

### Tema 1: Debounce y throttle

**Conceptos clave:** limitar frecuencia de ejecución, esperar pausa (debounce) frente a límite periódico (throttle).

`debounce` y `throttle`, ambos vistos parcialmente en módulos anteriores, resuelven el mismo problema general —limitar cuántas veces se ejecuta una función costosa ante eventos de alta frecuencia— pero con semánticas fundamentalmente distintas que conviene distinguir con precisión. `debounce(fn, ms)` retrasa la ejecución de `fn` hasta que transcurre un período de `ms` sin que se produzca una nueva invocación; cada nueva llamada reinicia el temporizador de espera, de modo que `fn` solo se ejecuta finalmente cuando la actividad se detiene por completo durante el intervalo especificado. `throttle(fn, ms)` garantiza que `fn` se ejecute como máximo una vez por cada intervalo de `ms`, sin importar cuántas veces se invoque la función devuelta durante ese intervalo, ejecutando inmediatamente en la primera invocación de cada ventana y bloqueando invocaciones adicionales hasta que la ventana actual termine.

La elección entre ambos depende de la naturaleza real del evento y del comportamiento deseado. Para un campo de búsqueda que dispara una petición al servidor en cada tecla presionada, `debounce` es la elección correcta: se quiere esperar a que el usuario termine de escribir (una pausa genuina en la actividad) antes de disparar la petición costosa, evitando peticiones innecesarias por cada tecla intermedia. Para un evento de scroll o de redimensionamiento de ventana que actualiza continuamente un indicador visual mientras el usuario interactúa, `throttle` es más apropiado: se necesita una respuesta periódica y continua durante la interacción activa (no solo al final, cuando esta se detiene), pero limitada a una frecuencia razonable que no sature el hilo principal con actualizaciones excesivamente frecuentes.

Un error conceptual común es intercambiar ambos patrones sin considerar esta diferencia semántica: usar `debounce` en un evento de scroll produciría actualizaciones solo al final del desplazamiento (sin ninguna respuesta visual durante el scroll activo, una experiencia pobre), mientras que usar `throttle` en un campo de búsqueda dispararía peticiones periódicas incluso mientras el usuario sigue escribiendo activamente (potencialmente disparando peticiones para términos de búsqueda incompletos e intermedios), en vez de esperar genuinamente a que termine.

Implementar ambos desde cero (en vez de depender siempre de una biblioteca externa como Lodash) es un ejercicio valioso para interiorizar completamente su mecánica interna basada en temporizadores y banderas de estado, un conocimiento que facilita diagnosticar comportamientos inesperados al usarlos en código real, especialmente en combinación con otras técnicas de optimización de este módulo.

**Analogía:** `debounce` es como un ascensor que espera a que nadie más pulse el botón durante unos segundos antes de finalmente cerrarse y partir, reiniciando la espera cada vez que alguien nuevo pulsa el botón mientras las puertas siguen abiertas; `throttle` es como un semáforo que permite el paso de vehículos exactamente una vez por cada ciclo fijo de tiempo, sin importar cuántos vehículos se acumulen esperando durante ese ciclo.

**¿Por qué es importante?** Elegir correctamente entre `debounce` y `throttle` según la semántica real del evento (esperar una pausa frente a limitar una frecuencia periódica sostenida) es una decisión de diseño de UX y de rendimiento con impacto directo y perceptible en la experiencia del usuario.

**Diagrama:**

```
debounce: eventos ──┤ ┤┤ ┤─────── espera ───────► fn() se ejecuta UNA vez, al final
throttle: eventos ──┤─┤─┤─┤─┤─┤─┤─┤─┤─┤─┤─┤──────► fn() se ejecuta periódicamente,
                                                     máximo una vez por intervalo
```

### Tema 2: Memoización

**Conceptos clave:** cachear resultados por argumentos, funciones puras, coste de memoria frente a coste de cómputo.

Memoizar una función significa cachear el resultado de cada invocación según sus argumentos exactos, de modo que invocaciones repetidas con los mismos argumentos devuelvan el resultado cacheado inmediatamente, sin re-ejecutar el cálculo costoso. `memoize(fn)` genérico serializa los argumentos (por ejemplo, con `JSON.stringify`) para usarlos como clave de un `Map` (recordando el Módulo 4: `Map` es apropiado aquí precisamente porque las claves son dinámicas y no se conocen de antemano), almacenando el resultado calculado la primera vez que se ve una combinación específica de argumentos, y devolviendo directamente ese resultado cacheado en cualquier invocación posterior con los mismos argumentos exactos.

La memoización solo es válida y segura para funciones puras: funciones cuyo resultado depende exclusivamente de sus argumentos de entrada, sin ningún efecto secundario ni dependencia de estado externo mutable que pueda cambiar entre invocaciones. Memoizar una función que depende de un estado externo mutable (como la hora actual del sistema, o el contenido cambiante de una variable global) produciría resultados cacheados incorrectos y desactualizados, porque el caché no tiene forma de saber que el resultado "correcto" para los mismos argumentos podría ser distinto en una invocación posterior si el estado externo del que depende cambió mientras tanto.

Fibonacci calculado de forma recursiva ingenua es el ejemplo canónico de dónde la memoización tiene un impacto dramático: sin memoización, calcular `fibonacci(35)` recalcula los mismos subproblemas (como `fibonacci(20)`) millones de veces de forma redundante durante la recursión, un desperdicio exponencial de cómputo; con memoización, cada subproblema único se calcula exactamente una vez, y las invocaciones recursivas repetidas sobre el mismo subproblema simplemente consultan el caché, reduciendo drásticamente el tiempo total de cómputo de exponencial a lineal en el tamaño del problema.

Es importante reconocer cuándo la memoización es contraproducente: para funciones que raramente se invocan con los mismos argumentos exactos más de una vez (haciendo que el caché nunca se aproveche realmente, pero sí consuma memoria adicional de forma permanente y creciente para almacenar resultados que nunca vuelven a consultarse), o para funciones cuyo cálculo es en sí mismo más barato que el coste de serializar los argumentos y consultar el caché, memoizar añade overhead sin ningún beneficio real, un ejemplo concreto de optimización aplicada sin evidencia que realmente la justifique, precisamente el antipatrón que este módulo advierte evitar.

**Analogía:** la memoización es como un asistente que anota en un cuaderno cada respuesta que calcula para preguntas específicas, y antes de recalcular cualquier pregunta nueva, primero revisa si ya la respondió exactamente igual anteriormente, ahorrando el trabajo de recalcular; pero si las preguntas casi nunca se repiten exactamente igual, mantener ese cuaderno cada vez más grande solo añade peso sin ahorrar ningún trabajo real.

**¿Por qué es importante?** La memoización puede transformar el rendimiento de funciones recursivas con subproblemas superpuestos de exponencial a lineal, pero solo es aplicable a funciones puras, y su beneficio real depende de que los mismos argumentos se repitan efectivamente con frecuencia suficiente para justificar el coste de memoria del caché.

**Diagrama:**

```js
function memoize(fn) {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (!cache.has(key)) cache.set(key, fn(...args));
    return cache.get(key);
  };
}
// fibonacci(35) sin memo: ~millones de llamadas redundantes (exponencial)
// fibonacci(35) con memo: cada subproblema calculado UNA sola vez (lineal)
```

### Tema 3: Web Workers para trabajo pesado

**Conceptos clave:** hilo separado, `postMessage`, sin acceso al DOM.

Un Web Worker ejecuta JavaScript en un hilo completamente separado del hilo principal donde corre la interfaz de usuario, permitiendo realizar cálculos computacionalmente costosos (ordenar un volumen grande de datos, procesar imágenes, cálculos matemáticos intensivos) sin bloquear ni congelar la interactividad de la página mientras ese cálculo se ejecuta. Esto es fundamentalmente distinto de mover trabajo a una macrotask o microtask (Módulo 5): esas técnicas reorganizan cuándo se ejecuta el código dentro del mismo hilo único, pero el trabajo pesado en sí, una vez que le toca su turno de ejecución, sigue bloqueando completamente ese hilo único hasta que termina; un Web Worker, en cambio, ejecuta ese trabajo en un hilo genuinamente distinto y paralelo, dejando el hilo principal completamente libre para seguir respondiendo a interacciones del usuario mientras el worker calcula en paralelo.

La comunicación entre el hilo principal y un Worker ocurre exclusivamente mediante paso de mensajes asíncronos (`postMessage` para enviar, el evento `message` para recibir), nunca mediante acceso directo compartido a variables entre ambos contextos: el hilo principal invoca `worker.postMessage(datos)` para enviar datos de entrada al worker, y el worker, tras procesar esos datos en su propio hilo aislado, invoca `self.postMessage(resultado)` para devolver el resultado calculado de vuelta al hilo principal, que lo recibe mediante su propio listener del evento `message`. Los datos intercambiados deben ser serializables (estructuras de datos simples: objetos, arrays, valores primitivos), no pudiendo pasarse directamente referencias a funciones o a elementos del DOM.

Una limitación importante y fundamental de los Web Workers es que no tienen acceso directo al DOM: no pueden leer ni modificar elementos de la página directamente, precisamente porque el DOM no está diseñado para ser manipulado de forma segura desde múltiples hilos simultáneos. Esto significa que un Worker es apropiado exclusivamente para cómputo puro (procesar datos, calcular resultados), y cualquier actualización visual resultante de ese cómputo debe realizarse de vuelta en el hilo principal, tras recibir el resultado del Worker mediante `postMessage`, nunca directamente desde dentro del propio Worker.

Identificar correctamente qué trabajo es apropiado para mover a un Worker —cómputo puro, intensivo, sin necesidad de acceso al DOM— frente a qué trabajo no lo es —cualquier cosa que necesite leer o modificar la interfaz directamente— es la decisión de diseño clave al considerar esta técnica de optimización, reservándola específicamente para los casos donde efectivamente resuelve el problema real de congelamiento de la interfaz durante cómputo pesado.

**Analogía:** el hilo principal es como el gerente de una tienda que atiende directamente a los clientes en el mostrador; un Web Worker es como un empleado en la trastienda que realiza un inventario complejo y que se comunica con el gerente únicamente mediante notas escritas entregadas y recibidas (mensajes), nunca interrumpiendo directamente la atención al cliente en el mostrador, pero tampoco pudiendo atender directamente a ningún cliente por sí mismo desde la trastienda.

**¿Por qué es importante?** Los Web Workers son la solución correcta y específica para cómputo pesado que, de otro modo, congelaría perceptiblemente la interfaz de usuario durante su ejecución en el hilo único principal, siempre que ese trabajo no requiera acceso directo al DOM.

**Diagrama:**

```js
// worker.js
self.onmessage = (e) => {
  const resultado = ordenarMillonDeNumeros(e.data);
  self.postMessage(resultado);
};
// main.js
const worker = new Worker("worker.js");
worker.postMessage(numerosSinOrdenar);
worker.onmessage = (e) => console.log("ordenado:", e.data); // UI nunca se congela
```

### Tema 4: Profiling con DevTools

**Conceptos clave:** grabación de rendimiento, flame chart, identificación de cuellos de botella reales.

La pestaña Performance de las herramientas de desarrollador del navegador permite grabar una interacción real de la aplicación (un clic, un scroll, una carga de página) y examinar exactamente qué funciones consumieron cuánto tiempo de ejecución durante esa interacción, mediante una visualización de "flame chart" (gráfico de llamas) que muestra la jerarquía de llamadas a funciones a lo largo del tiempo, con el ancho de cada bloque representando proporcionalmente cuánto tiempo consumió esa función específica. Esta herramienta convierte la optimización de rendimiento de una actividad especulativa (adivinar qué parte del código podría ser lenta) en una actividad basada en evidencia directa y medible (ver exactamente qué función específica consumió más tiempo real durante una interacción concreta y reproducible).

El flujo de trabajo recomendado es: grabar la interacción lenta específica que se quiere optimizar, identificar en el flame chart la función (o funciones) que consumen la porción más significativa del tiempo total registrado, entender por qué esa función específica es lenta (¿hace demasiado trabajo redundante? ¿podría beneficiarse de memoización? ¿bloquea el hilo principal con cómputo que podría moverse a un Worker?), aplicar la optimización específica dirigida a esa causa identificada, y finalmente volver a grabar la misma interacción para confirmar con números reales y comparables que la optimización tuvo el efecto esperado, no solo asumirlo sin verificación.

Este proceso deliberadamente evidencial contrasta con la optimización especulativa —aplicar memoización, `useMemo`, o cualquier otra técnica de optimización "porque parece buena práctica" sin haber medido primero si esa porción específica del código es realmente un cuello de botella relevante—, una práctica que Donald Knuth describió célebremente como "la raíz de todo mal" en programación quando se aplica prematuramente: optimizar código que no es realmente el cuello de botella no solo desperdicia esfuerzo, sino que frecuentemente añade complejidad innecesaria (memoización, por ejemplo, tiene un coste real de memoria y de mantenimiento) sin ningún beneficio medible real en el rendimiento percibido por el usuario final.

Practicar este flujo completo —grabar, identificar, optimizar dirigidamente, y volver a medir para confirmar— con una interacción real y lenta de una aplicación propia es la única forma de desarrollar intuición genuina y confiable sobre optimización de rendimiento basada en evidencia, en vez de depender de reglas generales memorizadas sin verificación en el contexto específico de cada aplicación real.

**Analogía:** el profiling es como un médico que ordena un examen específico (una radiografía) antes de prescribir un tratamiento, identificando exactamente dónde está el problema real, en vez de recetar un tratamiento genérico basado únicamente en una suposición sin verificación diagnóstica concreta.

**¿Por qué es importante?** Optimizar basándose en evidencia medible del profiler, en vez de intuición o convención, evita el desperdicio de esfuerzo en optimizaciones que no atacan el cuello de botella real, y proporciona números concretos y comparables para confirmar que una optimización aplicada realmente tuvo el efecto deseado.

**Diagrama:**

```
1. Grabar interacción lenta → 2. Identificar función más costosa en el flame chart
        │                                    │
        ▼                                    ▼
4. Volver a grabar y comparar ◄── 3. Aplicar optimización DIRIGIDA a esa función
   (confirmar mejora con números reales, no asumirla)
```

### Tema 5: Core Web Vitals

**Conceptos clave:** LCP, CLS, INP, métricas centradas en la experiencia real del usuario.

Core Web Vitals es un conjunto de métricas definidas por Google que cuantifican aspectos concretos de la experiencia de carga y de interactividad percibida por un usuario real, más allá de métricas técnicas genéricas menos directamente conectadas con la experiencia subjetiva real. LCP (Largest Contentful Paint) mide el tiempo hasta que el elemento visual más grande de la página (típicamente la imagen principal o el bloque de texto más prominente) termina de renderizarse, siendo una aproximación razonable de cuándo el usuario percibe que "el contenido principal ya cargó", más relevante que métricas más antiguas como el tiempo de carga completo de la página, que puede incluir contenido secundario poco relevante para la percepción inicial del usuario.

CLS (Cumulative Layout Shift) cuantifica cuánto se desplaza visualmente el contenido de la página de forma inesperada después de su renderizado inicial, un problema frecuente y molesto cuando, por ejemplo, una imagen sin dimensiones explícitas termina de cargar y empuja hacia abajo el contenido que el usuario ya estaba leyendo o a punto de tocar, causando clics accidentales sobre elementos que se movieron de posición justo antes de que el usuario completara su interacción intencionada. Reservar explícitamente el espacio esperado para elementos que cargan de forma asíncrona (como especificar las dimensiones de una imagen de antemano mediante los atributos `width`/`height` o CSS `aspect-ratio`) es la técnica principal para minimizar CLS.

INP (Interaction to Next Paint), que reemplazó a la métrica anterior FID (First Input Delay) como parte oficial de Core Web Vitals, mide cuánto tiempo transcurre entre una interacción del usuario (un clic, una pulsación de tecla) y el siguiente repintado visual que refleja la respuesta a esa interacción, capturando la responsividad percibida de la interfaz durante toda la sesión del usuario (no solo en la primera interacción, como medía FID), siendo particularmente sensible a trabajo pesado ejecutándose en el hilo principal que retrasa la respuesta visual a las acciones del usuario, precisamente el tipo de problema que Web Workers (Tema 3) y una memoización bien dirigida (Tema 2) ayudan a mitigar.

Estas tres métricas —LCP, CLS, INP— son relevantes no solo como objetivo de buena práctica técnica abstracta, sino porque Google las usa directamente como factor de ranking en su algoritmo de búsqueda, dándoles una relevancia de negocio concreta y medible más allá de la experiencia de usuario en sí misma, y son medibles directamente en producción (con datos reales de usuarios, no solo en condiciones controladas de laboratorio) mediante herramientas como Google PageSpeed Insights o el reporte de Core Web Vitals de Google Search Console.

**Analogía:** LCP es como medir cuánto tarda en servirse el plato principal de una comida (lo que el comensal realmente vino a comer); CLS es como que los cubiertos se muevan inesperadamente de posición justo cuando el comensal va a tomarlos; INP es como medir cuánto tarda el camarero en responder cada vez que el comensal hace una señal durante toda la comida, no solo la primera vez.

**¿Por qué es importante?** Core Web Vitals traduce la experiencia de rendimiento percibida por usuarios reales en métricas concretas, medibles y accionables, con impacto directo tanto en la experiencia de usuario como en el posicionamiento de búsqueda.

**Diagrama:**

```
LCP (Largest Contentful Paint): ¿cuándo apareció el contenido principal?
CLS (Cumulative Layout Shift):  ¿cuánto se desplazó el contenido inesperadamente?
INP (Interaction to Next Paint): ¿qué tan rápido responde la interfaz a cada interacción?
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

**Objetivo del laboratorio:** medir, optimizar y verificar con evidencia real (antes/después) el rendimiento de una función costosa, aplicando profiling, memoización y Web Workers según corresponda.

**Requisitos previos:** Módulos 0-9 completados, un navegador moderno con DevTools.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Implementar `throttle` y compararlo con `debounce` | Ver Tema 1 | Demuestra la diferencia con un evento de scroll real |
| 2 | Implementar `memoize` genérico | Ver Tema 2 | Aplícalo a `fibonacci` recursivo |
| 3 | Medir la diferencia con y sin memoización | `console.time`/`console.timeEnd` para `fibonacci(35)` | Compara los números reales antes y después |
| 4 | Mover un cálculo pesado a un Web Worker | Ordenar 1 millón de números | Verifica que la UI principal no se congela |
| 5 | Grabar en la pestaña Performance | Interacción lenta real de tu propia app | Identifica la función que más tiempo consume |
| 6 | Optimizar la función identificada y volver a grabar | Aplica la optimización dirigida correspondiente | Confirma la mejora con números reales |

**Verificación:** el laboratorio se considera exitoso si existe una comparación numérica concreta y documentada (antes/después) que demuestre una mejora real de rendimiento, no solo una afirmación sin evidencia de que "ahora es más rápido".

**Errores comunes y soluciones**

- **Memoizar una función impura (que depende de estado externo mutable).** Verifica primero que la función sea genuinamente pura; de lo contrario, la memoización producirá resultados incorrectos y desactualizados.
- **Optimizar sin medir primero con el profiler.** Siempre graba y confirma dónde está el cuello de botella real antes de aplicar cualquier optimización específica.
- **Intentar acceder al DOM desde dentro de un Web Worker.** Los Workers no tienen acceso al DOM; realiza cualquier actualización visual en el hilo principal tras recibir el resultado mediante `postMessage`.

---

## Ejercicios de evaluación

### Ejercicio 1: Elegir entre debounce y throttle

**Enunciado:** para cada uno de estos dos escenarios, indica si usarías `debounce` o `throttle` y justifica: (a) validar un nombre de usuario contra el servidor mientras el usuario escribe, (b) actualizar la posición de una barra de progreso de lectura mientras el usuario hace scroll por un artículo largo.

**Solución esperada:** (a) `debounce`, porque se quiere esperar a que el usuario termine de escribir antes de disparar la validación costosa contra el servidor; (b) `throttle`, porque se necesita actualizar la barra de progreso de forma continua y periódica durante todo el scroll activo, no solo al final cuando el usuario deja de desplazarse.

**Criterios de éxito:**
- Elige correctamente `debounce` para (a) y `throttle` para (b).
- Justifica cada elección en términos de "esperar una pausa" frente a "responder periódicamente durante actividad continua".

### Ejercicio 2: Cuándo memoizar es contraproducente

**Enunciado:** explica por qué memoizar una función que genera un número aleatorio distinto en cada invocación sería incorrecto, y por qué memoizar una función que casi nunca recibe los mismos argumentos dos veces sería inútil aunque no incorrecto.

**Solución esperada:** memoizar una función que genera un número aleatorio es incorrecto porque la función no es pura (su resultado no depende únicamente de sus argumentos, sino de una fuente de aleatoriedad), y el caché devolvería siempre el primer resultado aleatorio generado, en vez de un valor nuevo genuinamente aleatorio en cada invocación esperada. Memoizar una función con argumentos casi siempre distintos es inútil (no incorrecto) porque el caché prácticamente nunca tendría una coincidencia real que reutilizar, mientras consume memoria de forma creciente y permanente sin ningún beneficio real de rendimiento.

**Criterios de éxito:**
- Explica correctamente por qué la impureza hace la memoización incorrecta (no solo inútil) en el primer caso.
- Distingue correctamente "incorrecto" (primer caso) de "inútil pero no incorrecto" (segundo caso).

### Ejercicio 3: Diagnóstico basado en profiling

**Enunciado:** tras grabar una interacción lenta en la pestaña Performance, el flame chart muestra que una función `ordenarResultados()` consume el 80% del tiempo total registrado. Describe el proceso completo que seguirías desde este punto hasta confirmar una optimización exitosa.

**Solución esperada:** primero, investigar por qué `ordenarResultados()` es lenta (¿usa un algoritmo de ordenamiento ineficiente? ¿se ejecuta más veces de las necesarias? ¿podría beneficiarse de memoización si los mismos datos se ordenan repetidamente?); segundo, aplicar la optimización específica identificada (por ejemplo, memoizar si los mismos datos se ordenan repetidamente, o mover el ordenamiento a un Web Worker si bloquea perceptiblemente la UI); tercero, volver a grabar exactamente la misma interacción con la pestaña Performance y comparar el nuevo porcentaje de tiempo consumido por esa función contra el 80% original, confirmando una mejora real y medible antes de considerar la optimización exitosa.

**Criterios de éxito:**
- Propone investigar la causa específica antes de aplicar cualquier optimización genérica.
- Incluye el paso final de volver a medir y comparar con el número original, no solo asumir la mejora.

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

<!-- REQUESTED-PRACTICAL-EXAMPLES:START -->
## Ejemplos guiados de los temas solicitados

Estos ejemplos acompañan la ampliación académica. No son código para copiar sin contexto: ejecuta, modifica, provoca un fallo y conserva la evidencia.

### Ejemplo guiado: Web Workers y Service Workers

**Qué demuestra:** convierte el concepto en una evidencia pequeña, explícita y verificable dentro de RutaFlow. El ejemplo separa la decisión del framework para poder probarla y cambiarla.

```ts
type Evidence = Readonly<{ topic: string; passed: boolean; observedAt: string }>;

export function verifyWebWorkersYService(passed: boolean): Evidence {
  return Object.freeze({ topic: "Web Workers y Service Workers", passed, observedAt: new Date().toISOString() });
}
```

**Práctica:** reemplaza el resultado exitoso por un fallo realista, agrega una aserción automatizada y registra qué señal permitiría diagnosticarlo en producción.

<!-- REQUESTED-PRACTICAL-EXAMPLES:END -->

## Resumen del módulo

**Puntos clave**

- `debounce` espera una pausa en la actividad; `throttle` limita a una ejecución máxima por intervalo periódico.
- La memoización solo es válida para funciones puras, y solo beneficiosa cuando los mismos argumentos se repiten con suficiente frecuencia.
- Los Web Workers ejecutan cómputo pesado en un hilo separado, sin acceso al DOM, comunicándose mediante `postMessage`.
- El profiling con DevTools convierte la optimización en un proceso basado en evidencia medible, no en intuición o convención.
- Core Web Vitals (LCP, CLS, INP) cuantifican la experiencia de carga e interactividad percibida por usuarios reales.

**Conceptos aprendidos**

- Implementación y elección correcta entre `debounce` y `throttle`.
- Memoización genérica y sus condiciones de aplicabilidad.
- Uso de Web Workers para cómputo pesado sin bloquear la UI.
- Flujo de trabajo de profiling basado en evidencia.
- Las métricas Core Web Vitals y su relevancia práctica y de negocio.

**Próximos pasos**

En el Módulo 11 aprenderás TypeScript esencial, el puente hacia Angular, React con tipos y Node tipado, cubriendo lo justo para ser productivo desde el primer día.

**Recursos adicionales**

- web.dev (Google): documentación oficial de Core Web Vitals.
- MDN Web Docs: "Web Workers API".
- Chrome DevTools documentation: "Performance panel".
