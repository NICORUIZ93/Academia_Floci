# Módulo 4: Streams y programación funcional


## Aprende construyendo

### Tema 1: Stream API — map, filter, reduce, collect

#### Paso 1 · Objetivo y preparación
Al finalizar podrás transformar colecciones con este enfoque desde cero. Prerrequisitos: JDK 21 y un editor. Comprueba java --version.

#### Paso 2 · Contexto y caso real
En un caso real, se filtran entregas activas, se calculan tarifas y se agrupan resultados; una tubería clara debe preservar orden, tipos y reglas.

#### Paso 3 · Teoría, modelo mental y analogía
Un stream describe una operación perezosa sobre datos; map transforma, filter conserva y reduce combina. Optional expresa ausencia sin usar null como señal ambigua. El paralelismo solo conviene con trabajo independiente medido. La analogía es una línea de clasificación: cada estación transforma o descarta y el resultado final debe poder explicar sus pasos.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-java-m4
cd ejemplo-java-m4
mkdir -p src/main/java/com/example
```
Crea src/main/java/com/example/Main.java con una lista de entregas, un stream y un Optional; compila con javac -d out y ejecuta.

#### Paso 5 · Práctica guiada
Pista: ejecuta el programa, cambia la lista a vacía para provocar un fallo deliberado de resultado ausente y corrígelo con Optional. Resultado esperado: mensaje explícito, sin NullPointerException.

#### Paso 6 · Práctica independiente
Añade una agrupación por estado, una medición secuencial/paralela y una prueba que demuestre que la operación es asociativa.

#### Paso 7 · Cierre y evidencia
Guarda salida y mediciones; como siguiente paso estudia concurrencia. Errores comunes: efectos secundarios dentro del stream, usar paralelismo por defecto, llamar get() sin alternativa y streams consumidos dos veces. Fuentes oficiales: https://dev.java/learn/api/streams/ y https://docs.oracle.com/javase/8/docs/api/java/util/stream/Stream.html.
**¿Por qué es importante?** Porque una transformación declarativa puede hacer visible la regla, pero solo si se controlan ausencia y efectos secundarios.
**Evidencia de aprendizaje:** entrega pipeline, prueba vacía, medición y explicación de complejidad.
**Conceptos clave:** pipeline declarativo, operaciones intermedias vs terminales.

Un stream describe una secuencia de operaciones a aplicar sobre una colección de forma declarativa: `personas.stream().filter(p -> p.getEdad() >= 18).map(Persona::getNombre).collect(Collectors.toList())` expresa directamente "filtra las personas mayores de edad, transforma cada una a su nombre, y recolecta el resultado en una lista", en vez de escribir manualmente un bucle imperativo con una lista auxiliar acumulando resultados paso a paso, un estilo que se enfoca en describir qué transformación se desea, no en los detalles mecánicos de cómo iterar y acumular.

`filter` y `map` son operaciones intermedias: no ejecutan nada por sí solas, sino que describen un paso de la cadena, devolviendo un nuevo stream sobre el que se puede seguir encadenando más operaciones; `collect` (o `reduce`, `sum`, `count`, y similares) es una operación terminal, la que efectivamente dispara la ejecución de todo el pipeline completo de operaciones intermedias descritas previamente, procesando cada elemento de la colección original una única vez a través de toda la cadena, en vez de crear colecciones intermedias completas entre cada paso (`filter` no produce una lista filtrada completa antes de que `map` empiece; ambas operaciones se aplican elemento por elemento en una única pasada perezosa, disparada únicamente por la operación terminal final). `reduce()` (`empleados.stream().mapToDouble(Empleado::getSalario).sum()`) combina todos los elementos del stream en un único resultado acumulado, apropiado para agregaciones como sumas, máximos, o concatenaciones.

**Analogía:** un pipeline de streams es como una línea de ensamblaje donde cada estación (`filter`, `map`) realiza su transformación específica sobre cada pieza a medida que pasa, sin necesidad de esperar a que todas las piezas completen una estación antes de que la siguiente estación comience a trabajar con las primeras piezas ya procesadas; la operación terminal es la que efectivamente enciende la línea de ensamblaje completa.

**¿Por qué es importante?** El estilo declarativo de Streams describe qué transformación se desea en vez de los detalles mecánicos de iteración manual, y su evaluación perezosa (solo disparada por la operación terminal) evita crear colecciones intermedias innecesarias entre cada paso de la cadena.

**Código del ejemplo:**

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

#### Paso 1 · Objetivo y preparación
Al finalizar podrás transformar colecciones con este enfoque desde cero. Prerrequisitos: JDK 21 y un editor. Comprueba java --version.

#### Paso 2 · Contexto y caso real
En un caso real, se filtran entregas activas, se calculan tarifas y se agrupan resultados; una tubería clara debe preservar orden, tipos y reglas.

#### Paso 3 · Teoría, modelo mental y analogía
Un stream describe una operación perezosa sobre datos; map transforma, filter conserva y reduce combina. Optional expresa ausencia sin usar null como señal ambigua. El paralelismo solo conviene con trabajo independiente medido. La analogía es una línea de clasificación: cada estación transforma o descarta y el resultado final debe poder explicar sus pasos.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-java-m4
cd ejemplo-java-m4
mkdir -p src/main/java/com/example
```
Crea src/main/java/com/example/Main.java con una lista de entregas, un stream y un Optional; compila con javac -d out y ejecuta.

#### Paso 5 · Práctica guiada
Pista: ejecuta el programa, cambia la lista a vacía para provocar un fallo deliberado de resultado ausente y corrígelo con Optional. Resultado esperado: mensaje explícito, sin NullPointerException.

#### Paso 6 · Práctica independiente
Añade una agrupación por estado, una medición secuencial/paralela y una prueba que demuestre que la operación es asociativa.

#### Paso 7 · Cierre y evidencia
Guarda salida y mediciones; como siguiente paso estudia concurrencia. Errores comunes: efectos secundarios dentro del stream, usar paralelismo por defecto, llamar get() sin alternativa y streams consumidos dos veces. Fuentes oficiales: https://dev.java/learn/api/streams/ y https://docs.oracle.com/javase/8/docs/api/java/util/stream/Stream.html.
**¿Por qué es importante?** Porque una transformación declarativa puede hacer visible la regla, pero solo si se controlan ausencia y efectos secundarios.
**Evidencia de aprendizaje:** entrega pipeline, prueba vacía, medición y explicación de complejidad.
**Conceptos clave:** ausencia de valor explícita en el tipo, `orElseThrow`.

`Optional<Persona> buscarPorId(int id) { return personas.stream().filter(p -> p.getId() == id).findFirst(); }` devuelve un `Optional<Persona>` en vez de devolver directamente `Persona` (que podría ser `null` si no se encuentra ningún resultado): esta diferencia en el tipo de retorno obliga, en el propio sistema de tipos, a que cualquier código que invoque este método considere explícitamente el caso "no hay valor", en vez de descubrir esa ausencia únicamente en producción mediante un `NullPointerException` inesperado al intentar usar un valor que resultó ser `null` sin haberlo verificado previamente.

`buscarPorId(5).orElseThrow(() -> new NoSuchElementException("No encontrado"))` es una de las formas explícitas de manejar el caso vacío de un `Optional`, lanzando una excepción con un mensaje claro y específico si efectivamente no hay valor presente; otras alternativas incluyen `orElse(valorPorDefecto)` (proporcionar un valor de reemplazo), `orElseGet(() -> calcular())` (calcular un valor de reemplazo solo si es necesario, de forma perezosa), o `ifPresent(valor -> usar(valor))` (ejecutar una acción solo si hay un valor presente, sin lanzar ninguna excepción). Cualquiera de estas formas obliga a una decisión explícita sobre qué hacer ante la ausencia de valor, en contraste con simplemente devolver `null` y confiar (sin ninguna garantía del compilador) en que quien llama recuerde verificarlo antes de usarlo.

**Analogía:** `Optional` es como una caja que explícitamente puede estar vacía o contener un objeto, obligando a quien la recibe a abrir la caja y verificar su contenido antes de intentar usarlo; devolver `null` directamente es como entregar algo que podría ser el objeto real o simplemente nada, sin ninguna indicación visible de cuál de los dos casos es, hasta que se intenta usar y potencialmente falla.

**¿Por qué es importante?** `Optional` obliga, en el propio tipo de retorno, a que el código que llama considere explícitamente el caso de ausencia de valor, reemplazando con ventaja la práctica de devolver `null` directamente y confiar en que se verifique manualmente sin ninguna garantía del compilador.

**Código del ejemplo:**

```java
Optional<Persona> buscarPorId(int id) {
    return personas.stream().filter(p -> p.getId() == id).findFirst();
}
Persona persona = buscarPorId(5).orElseThrow(() -> new NoSuchElementException("No encontrado"));
```

### Tema 3: Streams paralelos y referencias a métodos

#### Paso 1 · Objetivo y preparación
Al finalizar podrás transformar colecciones con este enfoque desde cero. Prerrequisitos: JDK 21 y un editor. Comprueba java --version.

#### Paso 2 · Contexto y caso real
En un caso real, se filtran entregas activas, se calculan tarifas y se agrupan resultados; una tubería clara debe preservar orden, tipos y reglas.

#### Paso 3 · Teoría, modelo mental y analogía
Un stream describe una operación perezosa sobre datos; map transforma, filter conserva y reduce combina. Optional expresa ausencia sin usar null como señal ambigua. El paralelismo solo conviene con trabajo independiente medido. La analogía es una línea de clasificación: cada estación transforma o descarta y el resultado final debe poder explicar sus pasos.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-java-m4
cd ejemplo-java-m4
mkdir -p src/main/java/com/example
```
Crea src/main/java/com/example/Main.java con una lista de entregas, un stream y un Optional; compila con javac -d out y ejecuta.

#### Paso 5 · Práctica guiada
Pista: ejecuta el programa, cambia la lista a vacía para provocar un fallo deliberado de resultado ausente y corrígelo con Optional. Resultado esperado: mensaje explícito, sin NullPointerException.

#### Paso 6 · Práctica independiente
Añade una agrupación por estado, una medición secuencial/paralela y una prueba que demuestre que la operación es asociativa.

#### Paso 7 · Cierre y evidencia
Guarda salida y mediciones; como siguiente paso estudia concurrencia. Errores comunes: efectos secundarios dentro del stream, usar paralelismo por defecto, llamar get() sin alternativa y streams consumidos dos veces. Fuentes oficiales: https://dev.java/learn/api/streams/ y https://docs.oracle.com/javase/8/docs/api/java/util/stream/Stream.html.
**¿Por qué es importante?** Porque una transformación declarativa puede hacer visible la regla, pero solo si se controlan ausencia y efectos secundarios.
**Evidencia de aprendizaje:** entrega pipeline, prueba vacía, medición y explicación de complejidad.
**Conceptos clave:** `parallelStream()`, overhead de paralelización, `Clase::metodo`.

`numeros.parallelStream().filter(this::esPrimo).count()` divide el procesamiento del stream entre múltiples hilos automáticamente gestionados por el framework de streams (usando internamente el mismo pool de hilos compartido `ForkJoinPool.commonPool()`), apropiado específicamente para datasets grandes combinados con operaciones genuinamente intensivas en CPU y sin efectos secundarios compartidos entre los elementos procesados (dado que la paralelización introduce el riesgo de condiciones de carrera si las operaciones del stream modifican estado compartido mutable, Módulo 5).

Para colecciones pequeñas, o para operaciones simples y rápidas, el overhead de coordinar la división del trabajo entre múltiples hilos y de recombinar los resultados parciales al final supera cualquier ganancia teórica de paralelización, resultando frecuentemente en un rendimiento peor que el equivalente secuencial (`stream()`, sin paralelizar); medir con datos reales del caso específico (en vez de asumir que "paralelo siempre es más rápido") es la única forma confiable de determinar si `parallelStream()` efectivamente aporta un beneficio neto en una situación concreta.

Las referencias a métodos (`Persona::getNombre`, equivalente exacto a la lambda `p -> p.getNombre()`) son una forma más concisa de expresar una lambda que simplemente invoca un método existente sobre su argumento, sin agregar ninguna lógica adicional propia, siendo preferibles por legibilidad en ese caso específico frente a escribir la lambda completa de forma explícita.

**Analogía:** un stream paralelo es como dividir una tarea grande entre varios trabajadores que luego deben coordinarse para combinar sus resultados parciales; para una tarea pequeña, el tiempo de organizar esa división y coordinación entre trabajadores puede superar fácilmente el tiempo que hubiera tomado simplemente completar la tarea uno mismo sin ayuda adicional.

**¿Por qué es importante?** Un stream paralelo solo mejora el rendimiento con datasets grandes y operaciones CPU-intensivas sin efectos secundarios compartidos; usarlo indiscriminadamente en casos pequeños o simples puede empeorar el rendimiento por el overhead de coordinación.

**Código del ejemplo:**

```java
long conteo = numeros.parallelStream().filter(this::esPrimo).count();
// Útil solo para datasets grandes y operaciones CPU-intensivas sin efectos secundarios

.map(Persona::getNombre)   // equivalente a .map(p -> p.getNombre())
```

---


## Construcción guiada del capítulo

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
