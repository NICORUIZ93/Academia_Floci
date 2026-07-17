# Módulo 4: Streams y programación funcional

## Sílabo

**Objetivo general**

Procesar colecciones con un estilo declarativo mediante la Stream API introducida en Java 8, dominando lambdas, referencias a métodos, `Optional` para evitar `null` explícitamente, y saber cuándo un stream paralelo realmente ayuda.

**Objetivos específicos**

1. Encadenar `map`/`filter`/`collect` para transformar colecciones declarativamente.
2. Usar `reduce` para agregaciones.
3. Reemplazar lambdas verbosas por referencias a métodos.
4. Reemplazar el uso de `null` por `Optional`.
5. Determinar cuándo un stream paralelo mejora o empeora el rendimiento.

**Contenido**

- Stream API: map/filter/reduce/collect.
- Lambdas y referencias a métodos.
- Optional: evitar null de forma explícita.
- Streams paralelos: cuándo ayudan.
- peek, distinct, sorted, limit y skip.
- Collectors: groupingBy, partitioningBy y joining.
- `@FunctionalInterface` y sus reglas.

**Evaluación**

Pipeline de procesamiento de datos con Streams que reemplaza loops manuales, más tres ejercicios de evaluación.

---

## Contenido teórico

### Tema 1: Stream API — map, filter, reduce, collect

**Conceptos clave:** pipeline declarativo, operaciones intermedias vs terminales.

Un stream describe una secuencia de operaciones a aplicar sobre una colección de forma declarativa: `personas.stream().filter(p -> p.getEdad() >= 18).map(Persona::getNombre).collect(Collectors.toList())` expresa directamente "filtra las personas mayores de edad, transforma cada una a su nombre, y recolecta el resultado en una lista", en vez de escribir manualmente un bucle imperativo con una lista auxiliar acumulando resultados paso a paso, un estilo que se enfoca en describir qué transformación se desea, no en los detalles mecánicos de cómo iterar y acumular.

`filter` y `map` son operaciones intermedias: no ejecutan nada por sí solas, sino que describen un paso de la cadena, devolviendo un nuevo stream sobre el que se puede seguir encadenando más operaciones; `collect` (o `reduce`, `sum`, `count`, y similares) es una operación terminal, la que efectivamente dispara la ejecución de todo el pipeline completo de operaciones intermedias descritas previamente, procesando cada elemento de la colección original una única vez a través de toda la cadena, en vez de crear colecciones intermedias completas entre cada paso (`filter` no produce una lista filtrada completa antes de que `map` empiece; ambas operaciones se aplican elemento por elemento en una única pasada perezosa, disparada únicamente por la operación terminal final). `reduce()` (`empleados.stream().mapToDouble(Empleado::getSalario).sum()`) combina todos los elementos del stream en un único resultado acumulado, apropiado para agregaciones como sumas, máximos, o concatenaciones.

**Analogía:** un pipeline de streams es como una línea de ensamblaje donde cada estación (`filter`, `map`) realiza su transformación específica sobre cada pieza a medida que pasa, sin necesidad de esperar a que todas las piezas completen una estación antes de que la siguiente estación comience a trabajar con las primeras piezas ya procesadas; la operación terminal es la que efectivamente enciende la línea de ensamblaje completa.

**¿Por qué es importante?** El estilo declarativo de Streams describe qué transformación se desea en vez de los detalles mecánicos de iteración manual, y su evaluación perezosa (solo disparada por la operación terminal) evita crear colecciones intermedias innecesarias entre cada paso de la cadena.

**Diagrama:**

```java
List<String> nombresMayores = personas.stream()
    .filter(p -> p.getEdad() >= 18)
    .map(Persona::getNombre)
    .collect(Collectors.toList());

double totalSalarios = empleados.stream()
    .mapToDouble(Empleado::getSalario)
    .sum();
```

### Tema 2: Optional — evitar null explícitamente

**Conceptos clave:** ausencia de valor explícita en el tipo, `orElseThrow`.

`Optional<Persona> buscarPorId(int id) { return personas.stream().filter(p -> p.getId() == id).findFirst(); }` devuelve un `Optional<Persona>` en vez de devolver directamente `Persona` (que podría ser `null` si no se encuentra ningún resultado): esta diferencia en el tipo de retorno obliga, en el propio sistema de tipos, a que cualquier código que invoque este método considere explícitamente el caso "no hay valor", en vez de descubrir esa ausencia únicamente en producción mediante un `NullPointerException` inesperado al intentar usar un valor que resultó ser `null` sin haberlo verificado previamente.

`buscarPorId(5).orElseThrow(() -> new NoSuchElementException("No encontrado"))` es una de las formas explícitas de manejar el caso vacío de un `Optional`, lanzando una excepción con un mensaje claro y específico si efectivamente no hay valor presente; otras alternativas incluyen `orElse(valorPorDefecto)` (proporcionar un valor de reemplazo), `orElseGet(() -> calcular())` (calcular un valor de reemplazo solo si es necesario, de forma perezosa), o `ifPresent(valor -> usar(valor))` (ejecutar una acción solo si hay un valor presente, sin lanzar ninguna excepción). Cualquiera de estas formas obliga a una decisión explícita sobre qué hacer ante la ausencia de valor, en contraste con simplemente devolver `null` y confiar (sin ninguna garantía del compilador) en que quien llama recuerde verificarlo antes de usarlo.

**Analogía:** `Optional` es como una caja que explícitamente puede estar vacía o contener un objeto, obligando a quien la recibe a abrir la caja y verificar su contenido antes de intentar usarlo; devolver `null` directamente es como entregar algo que podría ser el objeto real o simplemente nada, sin ninguna indicación visible de cuál de los dos casos es, hasta que se intenta usar y potencialmente falla.

**¿Por qué es importante?** `Optional` obliga, en el propio tipo de retorno, a que el código que llama considere explícitamente el caso de ausencia de valor, reemplazando con ventaja la práctica de devolver `null` directamente y confiar en que se verifique manualmente sin ninguna garantía del compilador.

**Diagrama:**

```java
Optional<Persona> buscarPorId(int id) {
    return personas.stream().filter(p -> p.getId() == id).findFirst();
}
Persona persona = buscarPorId(5).orElseThrow(() -> new NoSuchElementException("No encontrado"));
```

### Tema 3: Streams paralelos y referencias a métodos

**Conceptos clave:** `parallelStream()`, overhead de paralelización, `Clase::metodo`.

`numeros.parallelStream().filter(this::esPrimo).count()` divide el procesamiento del stream entre múltiples hilos automáticamente gestionados por el framework de streams (usando internamente el mismo pool de hilos compartido `ForkJoinPool.commonPool()`), apropiado específicamente para datasets grandes combinados con operaciones genuinamente intensivas en CPU y sin efectos secundarios compartidos entre los elementos procesados (dado que la paralelización introduce el riesgo de condiciones de carrera si las operaciones del stream modifican estado compartido mutable, Módulo 5).

Para colecciones pequeñas, o para operaciones simples y rápidas, el overhead de coordinar la división del trabajo entre múltiples hilos y de recombinar los resultados parciales al final supera cualquier ganancia teórica de paralelización, resultando frecuentemente en un rendimiento peor que el equivalente secuencial (`stream()`, sin paralelizar); medir con datos reales del caso específico (en vez de asumir que "paralelo siempre es más rápido") es la única forma confiable de determinar si `parallelStream()` efectivamente aporta un beneficio neto en una situación concreta.

Las referencias a métodos (`Persona::getNombre`, equivalente exacto a la lambda `p -> p.getNombre()`) son una forma más concisa de expresar una lambda que simplemente invoca un método existente sobre su argumento, sin agregar ninguna lógica adicional propia, siendo preferibles por legibilidad en ese caso específico frente a escribir la lambda completa de forma explícita.

**Analogía:** un stream paralelo es como dividir una tarea grande entre varios trabajadores que luego deben coordinarse para combinar sus resultados parciales; para una tarea pequeña, el tiempo de organizar esa división y coordinación entre trabajadores puede superar fácilmente el tiempo que hubiera tomado simplemente completar la tarea uno mismo sin ayuda adicional.

**¿Por qué es importante?** Un stream paralelo solo mejora el rendimiento con datasets grandes y operaciones CPU-intensivas sin efectos secundarios compartidos; usarlo indiscriminadamente en casos pequeños o simples puede empeorar el rendimiento por el overhead de coordinación.

**Diagrama:**

```java
long conteo = numeros.parallelStream().filter(this::esPrimo).count();
// Útil solo para datasets grandes y operaciones CPU-intensivas sin efectos secundarios

.map(Persona::getNombre)   // equivalente a .map(p -> p.getNombre())
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

**Objetivo del laboratorio:** construir un pipeline de procesamiento de datos con Streams que reemplace loops manuales.

**Requisitos previos:** Módulos 0-3 completados.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Filtrar y transformar con `filter`/`map`/`collect` | Ver Tema 1 | Reemplaza un loop manual equivalente |
| 2 | Sumar con `reduce`/`mapToDouble().sum()` | Ver Tema 1 | Agregación declarativa |
| 3 | Reemplazar un método que devuelve `null` por `Optional` | Ver Tema 2 | Maneja el caso vacío con `orElseThrow` |
| 4 | Comparar `stream()` vs `parallelStream()` con datos grandes | Ver Tema 3 | Mide el tiempo real, no asumas |
| 5 | Reemplazar lambdas verbosas por referencias a métodos | Ver Tema 3 | Donde aplique directamente |

**Verificación:** el laboratorio se considera exitoso si el pipeline con Streams produce el mismo resultado que el loop manual equivalente, y si la comparación de `stream()` vs `parallelStream()` incluye una medición real de tiempo, no solo una suposición.

**Errores comunes y soluciones**

- **Usar `parallelStream()` para colecciones pequeñas.** El overhead de coordinación puede superar cualquier ganancia; mide con datos reales.
- **Seguir devolviendo `null` en vez de `Optional`.** Cambia la firma del método para forzar el manejo explícito del caso vacío.
- **Usar lambdas verbosas donde una referencia a método sería más clara.** Prefiere `Clase::metodo` cuando la lambda simplemente invoca ese método.

---

## Ejercicios de evaluación

### Ejercicio 1: Por qué Optional reemplaza con ventaja a null

**Enunciado:** explica por qué `Optional` reemplaza con ventaja a devolver `null` directamente.

**Solución esperada:** `Optional` obliga, en el propio tipo de retorno, a que el código que llama considere explícitamente el caso de ausencia de valor (mediante `orElseThrow`, `orElse`, `ifPresent`, etc.), en vez de descubrir esa ausencia únicamente en producción mediante un `NullPointerException` inesperado al usar un valor `null` sin haberlo verificado previamente.

**Criterios de éxito:**
- Explica correctamente la obligación explícita en el tipo frente al riesgo silencioso de `null`.

### Ejercicio 2: Cuándo un stream paralelo ayuda o empeora

**Enunciado:** ¿cuándo un stream paralelo realmente mejora el rendimiento y cuándo lo empeora?

**Solución esperada:** mejora el rendimiento con datasets grandes y operaciones genuinamente intensivas en CPU sin efectos secundarios compartidos; lo empeora en colecciones pequeñas o con operaciones simples y rápidas, donde el overhead de coordinar la división y recombinación del trabajo entre hilos supera cualquier ganancia de paralelización.

**Criterios de éxito:**
- Distingue correctamente el caso de dataset grande + CPU-intensivo (ayuda) del caso pequeño/simple (empeora).

### Ejercicio 3: Operaciones intermedias vs terminales

**Enunciado:** explica la diferencia entre una operación intermedia (como `filter`) y una operación terminal (como `collect`) en un stream.

**Solución esperada:** una operación intermedia describe un paso de la cadena sin ejecutar nada por sí sola, devolviendo un nuevo stream sobre el que se puede seguir encadenando; una operación terminal dispara la ejecución completa de todo el pipeline de operaciones intermedias descritas previamente, procesando cada elemento en una única pasada.

**Criterios de éxito:**
- Explica correctamente la evaluación perezosa de las operaciones intermedias y el disparo de ejecución de la operación terminal.

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

- Oracle, *Java Language Specification* y *Java Virtual Machine Specification*.
- OpenJDK, documentación de Java SE, JFR y JMH.
- Bloch, J., *Effective Java*.
- ACM/IEEE-CS/AAAI, *Computer Science Curricula 2023*.
- IEEE Computer Society, *SWEBOK Guide V4.0*.

## Resumen del módulo

**Puntos clave**

- Los Streams expresan transformaciones de colecciones de forma declarativa mediante operaciones intermedias y una operación terminal que dispara la ejecución.
- `Optional` obliga, en el tipo de retorno, a manejar explícitamente el caso de ausencia de valor.
- Los streams paralelos solo mejoran el rendimiento con datasets grandes y operaciones CPU-intensivas sin efectos secundarios.
- Las referencias a métodos son una forma más concisa de expresar lambdas que simplemente invocan un método existente.

**Conceptos aprendidos**

- Stream API: map/filter/reduce/collect.
- Lambdas y referencias a métodos.
- `Optional` para evitar null explícitamente.
- Streams paralelos y cuándo ayudan.

**Próximos pasos**

En el Módulo 5 aprenderás concurrencia: hilos, `ExecutorService`, `CompletableFuture`, y virtual threads de Java 21.

**Recursos adicionales**

- Documentación oficial de Java (docs.oracle.com/en/java): "Stream" y "Optional".
