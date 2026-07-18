# Módulo 14: Java en producción — memoria, benchmarks y runtime seguro

El proyecto anterior usa concurrencia y produce un artefacto reproducible. Para operarlo profesionalmente todavía debes demostrar que los hilos observan estado válido, que las optimizaciones no engañan tus mediciones, que datos hostiles no construyen objetos arbitrarios y que el runtime puede actualizarse y diagnosticarse. Este módulo trabaja esas fronteras con experimentos.

## Sílabo

1. Java Memory Model, happens-before y publicación segura.
2. JMH, JIT y benchmarks que miden lo que declaran.
3. Fronteras de datos, deserialización y cadena de suministro.
4. Runtime mínimo, contenedores, observabilidad y actualización.
5. Proyecto: endurecimiento del servicio concurrente.

## Aprende construyendo

### Tema 1: Compartir memoria requiere orden y visibilidad

**Conceptos clave:** Java Memory Model, action, read, write, data race, happens-before, monitor, synchronized, volatile, atomicidad, visibilidad, orden, final, safe publication, inmutabilidad y jcstress.

Cada hilo ejecuta según su semántica local, pero compilador, JIT y CPU pueden reordenar operaciones si el resultado observable de un solo hilo no cambia. Sin sincronización, otro hilo puede ver valores antiguos o combinaciones sorprendentes. El Java Memory Model define qué ejecuciones son legales; no promete que “eventualmente todos ven lo último” por intuición.

Una escritura es garantizadamente visible a una lectura cuando existe relación **happens-before**. Acciones importantes que la crean incluyen: orden dentro del mismo hilo; desbloquear y luego bloquear el mismo monitor; escribir y luego leer el mismo `volatile`; acciones anteriores a `Thread.start`; y acciones del hilo antes de que otro `join` retorne.

```java
final class WorkerControl {
    private volatile boolean stopped;

    void stop() {
        stopped = true;
    }

    void runLoop() {
        while (!stopped) {
            doOneUnit();
        }
    }
}
```

`volatile` hace visible la escritura y establece orden alrededor del acceso, pero no vuelve atómica una secuencia read-modify-write. `counter++` lee, suma y escribe; dos hilos pueden perder actualización. Usa `AtomicLong`, `LongAdder` para contención apropiada o un lock que proteja el invariante completo.

Los campos `final` correctamente construidos tienen garantías especiales, pero publicar `this` desde el constructor —registrándolo en un callback, por ejemplo— permite observar el objeto antes de terminar. Publica objetos completos mediante campo final de un contenedor seguro, colección concurrente, volatile, lock o mecanismos de `java.util.concurrent`.

```java
public record PriceTable(Map<String, BigDecimal> prices) {
    public PriceTable {
        prices = Map.copyOf(prices); // copia defensiva, estructura inmutable
    }
}
```

Un record no vuelve inmutables sus componentes. Copiar colecciones evita que otro hilo modifique el mapa por una referencia externa. Prefiere mensajes y valores inmutables antes que sincronización dispersa.

Las pruebas unitarias raramente encuentran intercalados. OpenJDK jcstress ejecuta escenarios y clasifica outcomes permitidos/prohibidos. Aun así, una prueba sin fallo no demuestra corrección; conecta la implementación con una relación formal y usa stress como evidencia empírica.

**Analogía:** dos pizarras privadas no se sincronizan porque alguien “ya escribió”. Happens-before es el protocolo de entrega que garantiza que la segunda persona recibió una versión antes de leer.

**¿Por qué es importante?** porque los defectos de visibilidad dependen de optimizaciones, arquitectura y timing; pueden desaparecer al agregar logs o debugger y reaparecer bajo carga.

**Casos de uso reales:** flags de shutdown, singleton mal publicado, cache mutable, contador, configuración recargada, callback escapado del constructor y cola productor/consumidor.

**Diagrama:**

```text
Hilo A: construir estado -> write volatile ready=true
                                  | happens-before
Hilo B:                  read volatile ready -> leer estado completo

counter++ = read -> add -> write; visible no significa atómico
```

### Tema 2: La JVM optimiza y puede invalidar un cronómetro ingenuo

**Conceptos clave:** benchmark, warmup, JIT, tiered compilation, dead-code elimination, constant folding, escape analysis, allocation, fork, iteration, Blackhole, throughput, latency, percentil y JMH.

Medir `System.nanoTime()` alrededor de un método una vez mezcla arranque, carga de clases, compilación, GC, scheduler y trabajo. La JVM observa código caliente y lo optimiza. Si el resultado no se usa, puede eliminar el cálculo; si entradas son constantes, puede precalcularlo; si un objeto no escapa, puede evitar asignarlo.

JMH organiza warmup, iteraciones, forks y consumo de resultados. Un fork inicia otra JVM y reduce contaminación entre configuraciones. El estado define alcance y los parámetros evitan un benchmark para un único valor.

```java
@State(Scope.Thread)
public class SearchBenchmark {
    @Param({"100", "10000"})
    int size;
    List<Integer> values;

    @Setup
    public void setup() {
        values = IntStream.range(0, size).boxed().toList();
    }

    @Benchmark
    public int linearSearch(Blackhole blackhole) {
        int result = values.indexOf(size - 1);
        blackhole.consume(result);
        return result;
    }
}
```

No incluyas preparación si no es parte de la operación medida. Si estudias parsing completo, sí debe incluirse; declara la pregunta. Mide varias distribuciones, no solo caso favorable. Reporta versión JDK, flags, CPU, SO, frecuencia, forks, error e intervalo.

Microbenchmark explica una función, no experiencia de servicio. Confirma con JFR y prueba de carga end-to-end. Una mejora de nanosegundos puede aumentar memoria, complejidad o latencia de cola. Distingue throughput, tiempo promedio y percentiles. Nunca elijas recolector o flag basándote en una sola ejecución local.

JMH también puede engañarse: setup incorrecto, estado compartido con contención accidental, entradas previsibles y benchmark distinto al workload. Revisa assembly/profilers solo cuando la pregunta lo requiere y conserva código reproducible.

**Analogía:** cronometrar a un atleta mientras se ata zapatos y luego concluir sobre velocidad de carrera mezcla fases. JMH organiza calentamiento y repeticiones, pero aún debes diseñar la prueba correcta.

**¿Por qué es importante?** porque optimizar con una medición falsa empeora código y enseña explicaciones inventadas sobre el JIT.

**Casos de uso reales:** comparar colecciones, serializadores, asignaciones, locks, parsers, algoritmos, flags de GC y regresiones entre versiones JDK.

**Diagrama:**

```text
pregunta -> workload representativo -> warmup -> forks/iteraciones -> distribución
                              JIT puede: plegar | eliminar | desvirtualizar
microbenchmark -> hipótesis local -> JFR/carga servicio -> impacto de usuario
```

### Tema 3: Deserializar es permitir construcción y comportamiento

**Conceptos clave:** frontera de confianza, allowlist, serialización nativa, ObjectInputStream, gadget, ObjectInputFilter, profundidad, referencias, bytes, JSON schema, polymorphic typing, secreto, criptografía, dependencia, SBOM y firma.

La serialización nativa puede ejecutar callbacks como `readObject` mientras reconstruye grafos. Deserializar datos no confiables es inherentemente peligroso. Prefiere formatos simples con DTO explícito y validación. JSON no es automáticamente seguro: tipos polimórficos abiertos, estructuras enormes, profundidad y campos inesperados también atacan.

Si un protocolo legacy exige `ObjectInputStream`, configura filtro por flujo o JVM y limita clases, profundidad, referencias, tamaño de arrays y bytes. Los filtros no están activos por arte de magia.

```java
ObjectInputFilter filter = ObjectInputFilter.Config.createFilter(
    "maxdepth=8;maxrefs=1000;maxbytes=1048576;" +
    "com.academia.dto.*;java.base/java.lang.*;!*"
);

try (ObjectInputStream input = new ObjectInputStream(stream)) {
    input.setObjectInputFilter(filter);
    Object value = input.readObject();
    if (!(value instanceof ImportBatch batch)) {
        throw new InvalidObjectException("tipo no permitido");
    }
    validate(batch);
}
```

Una allowlist estrecha es más defendible que enumerar gadgets conocidos. Valida invariantes después de construir y antes de usar. Para Jackson, deshabilita tipado polimórfico global con clases arbitrarias; usa discriminador cerrado y subtipos explícitos. Limita tamaño en servidor/proxy antes de parsear.

No inventes criptografía. Usa APIs y algoritmos actuales, `SecureRandom`, almacenamiento de claves externo y comparación adecuada. No hardcodees secretos en JAR, properties incluidas ni Docker layer. Rotación significa que la aplicación acepta transición controlada y registra versión, no que cambia un string manualmente.

El build descarga código. Fija versiones, verifica repositorios, revisa plugins, genera inventario/SBOM y escanea, pero prioriza por alcanzabilidad y exposición. Una actualización de seguridad necesita tests y procedimiento; ignorar el lock o checksum por urgencia crea otro riesgo.

**Analogía:** deserializar no es leer una carta; es aceptar un kit que puede ensamblar máquinas y ejecutar instrucciones durante el desembalaje. Limitar tamaño y piezas es esencial.

**¿Por qué es importante?** porque la frontera convierte bytes controlados externamente en objetos con métodos, memoria y acceso al proceso.

**Casos de uso reales:** import legacy, sesión serializada, RMI/JMX, JSON polimórfico, zip bomb lógica, secreto en resources y plugin Maven comprometido.

**Diagrama:**

```text
bytes externos -> límite tamaño -> parser/formato -> tipos permitidos -> invariantes
ObjectInputStream excepcional -> ObjectInputFilter: clase/profundidad/referencias/bytes
dependencias/plugins -> repositorio verificado -> SBOM -> análisis -> actualización probada
```

### Tema 4: El runtime es parte del artefacto y necesita ciclo de vida

**Conceptos clave:** module graph, jdeps, jlink, runtime image, jpackage, CDS, container awareness, heap limit, native memory, PID 1, signal, graceful shutdown, JFR, unified logging, health, update y rollback.

Un JAR no define por sí solo el runtime. Versión y módulos JDK cambian comportamiento y superficie. `jdeps` descubre dependencias; `jlink` enlaza módulos y sus dependencias en una imagen personalizada. Esto reduce tamaño y elimina módulos no usados, pero el equipo se vuelve responsable de reconstruirla cuando el JDK recibe correcciones.

```bash
jdeps --print-module-deps --ignore-missing-deps app.jar
jlink --add-modules java.base,java.logging,java.net.http \
  --strip-debug --no-header-files --no-man-pages \
  --output build/runtime
build/runtime/bin/java -jar app.jar
```

Comprueba que la lista proviene del artefacto real y reflexión/ServiceLoader. `jpackage` crea paquetes nativos cuando la distribución de escritorio lo necesita. Class Data Sharing puede reducir arranque/memoria compartiendo metadatos; mide en el entorno objetivo.

En contenedor, ejecuta usuario no root, filesystem de solo lectura cuando sea posible y volumen solo donde se requiere. Define límites y observa heap, metaspace, code cache, direct buffers, stacks y memoria nativa; `-Xmx` no representa todo RSS. Deja margen respecto al límite del cgroup. Virtual threads reducen stack por tarea, no vuelven infinito el pool de conexiones.

La forma exec garantiza señales al proceso Java. Al recibir SIGTERM, deja de aceptar, espera trabajo con deadline, cierra executors y recursos y termina con estado observable. Un shutdown hook no debe esperar indefinidamente ni depender de otro hook sin orden garantizado.

JFR ofrece eventos de CPU, allocations, locks, I/O y GC con overhead diseñado para diagnóstico. Configura grabación circular o bajo demanda, protege archivos porque pueden contener nombres/paths y correlaciona con logs y métricas. Unified logging (`-Xlog`) es más fiable que una colección de flags históricos.

El despliegue versiona JAR **y runtime**. Prueba compatibilidad de datos y contratos, usa canary, conserva imagen anterior y define rollback. Una migración destructiva no se deshace al volver al contenedor anterior.

**Analogía:** jlink construye una caja de herramientas a medida. Es más liviana, pero ya no recibe automáticamente herramientas reparadas: quien la empacó debe reconstruirla y reemplazarla.

**¿Por qué es importante?** porque diagnósticos, seguridad y uso de memoria dependen del runtime exacto que llega a producción, no del JDK instalado en el portátil.

**Casos de uso reales:** imagen mínima, arranque serverless, límite Kubernetes, OOMKill con heap aparentemente bajo, SIGTERM, JFR durante incidente y parche crítico de JDK.

**Diagrama:**

```text
fuentes -> build -> JAR + grafo módulos -> jlink runtime -> imagen inmutable
                                                   |
                                         límites/señales/JFR
CVEs JDK -> reconstruir runtime -> canary -> métricas -> promover/rollback
```

## Revisión oficial de plataforma — julio de 2026

### Java LTS frente a entregas semestrales

La base de producción recomendada para el curso es **Java 25 LTS**; **JDK 26** sirve para estudiar la evolución semestral sin confundir previews con contratos permanentes. JDK 26 incorpora el cliente **HTTP/3**, mejoras AOT/GC y nuevas iteraciones preview/incubator de concurrencia estructurada, patrones, PEM y Vector API. Una preview requiere flags, puede cambiar y no debe filtrarse a una API pública estable.

**Aplicación al proyecto:** compila y prueba en 25 y 26, experimenta HTTP/3 contra un servidor compatible con fallback medido, registra JEP/estado de cada función y evita publicar artefactos que necesiten preview salvo decisión explícita.

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

### Proyecto: endurecimiento medible del procesador concurrente

Parte del proyecto 13 y conserva un tag funcional anterior.

1. Identifica cada estado compartido, su invariante y mecanismo happens-before. Elimina publicación de colecciones mutables.
2. Crea un ejemplo defectuoso de visibilidad y un test jcstress con outcomes aceptables/prohibidos; corrige con el mecanismo mínimo.
3. Compara `volatile`, `AtomicLong`, `LongAdder` y lock únicamente para workloads donde tengan semántica equivalente.
4. Escribe dos benchmarks JMH: uno ingenuo deliberadamente y otro con forks, warmup, parámetros y resultados consumidos. Explica la diferencia.
5. Contrasta la optimización elegida bajo carga del servicio y JFR; revierte si no mejora el objetivo.
6. Sustituye serialización nativa en una entrada por DTO JSON cerrado. Si conservas un caso legacy, aplica filtro y límites.
7. Prueba tipo no permitido, profundidad, array enorme, JSON extra, payload inválido y secreto ausente.
8. Genera SBOM, registra procedencia de dependencias y corrige una vulnerabilidad simulada mediante actualización con tests.
9. Usa `jdeps` y `jlink` para crear runtime mínimo. Compara módulos, tamaño y arranque con JDK completo.
10. Construye contenedor no root con límite de memoria, healthcheck y JFR habilitable. Fuerza carga, SIGTERM y presión de memoria.
11. Documenta reconstrucción ante parche JDK, canary, compatibilidad, backup y rollback.

**Verificación:** entrega grafo happens-before, resultados jcstress, salida JMH con entorno, JFR antes/después, pruebas hostiles, SBOM, módulos jlink, tamaños y runbook. CI ejecuta unitarias, stress acotado, verificación de dependencias y smoke test del runtime personalizado.

**Errores comunes y soluciones**

- Marcar todo volatile: protege visibilidad, no invariantes compuestos; diseña dueño y atomicidad.
- Confiar en que no falló el stress: justifica con JMM y usa stress para buscar ejecuciones.
- Cronometrar un loop: usa JMH y evita trabajo eliminado, constantes y falta de warmup.
- Deserializar y validar después sin límites: limita antes/durante construcción del grafo.
- Activar filtro global amplio: usa allowlist contextual y prueba clases y complejidad.
- Fijar `-Xmx` igual al límite: deja memoria para metaspace, stacks, buffers, JIT y nativa.
- Crear jlink una vez: versiona y reconstruye runtime ante cada actualización relevante.


## Rúbrica del proyecto

| Criterio | Inicial | Competente | Experto |
|---|---|---|---|
| Memoria | Usa volatile por intuición | Relación happens-before explícita | Invariante, publicación y outcomes jcstress demostrados |
| Medición | nanoTime aislado | JMH reproducible | JMH, JFR y efecto de servicio reconciliados |
| Fronteras | Deserializa cualquier objeto | DTO/schema o filtro limitado | Complejidad, tipos, secretos y supply chain auditados |
| Runtime | JDK completo implícito | jlink y contenedor no root | Memoria total, señales, JFR y compatibilidad probadas |
| Actualización | Reemplazo manual | Runtime versionado y rollback | Parches, canary y migraciones ensayados |

## Bibliografía y fundamento académico

- Java Language Specification, capítulo 17: Threads and Locks y Java Memory Model.
- Oracle Java Core Libraries Guide: serialization filtering, concurrency y herramientas.
- OpenJDK Code Tools: JMH, jcstress, JOL y herramientas de medición.
- Documentación oficial de `jlink`, JFR, unified logging y módulos.
- Goetz et al., *Java Concurrency in Practice*; Shipilev, materiales sobre JVM y benchmarking.
- CS2023: Systems Fundamentals, Parallel and Distributed Computing, Security y Software Engineering.
- SWEBOK V4: Construction, Testing, Quality, Security y Engineering Operations.

Los resultados observables son justificar visibilidad, reproducir/corregir una carrera de memoria, refutar un benchmark falso, rechazar grafos hostiles y desplegar/actualizar un runtime mínimo con diagnóstico.

<!-- OFFICIAL-TOPIC-ATLAS:START -->
## Atlas completo de temas oficiales

Derivado de la [documentación oficial](https://docs.oracle.com/en/java/javase/25/), sus referencias, migraciones y guías de operación. Inventariar no equivale a dominar: cada selección se demuestra con código, prueba, medición y explicación. **Cobertura: 49 temas.**

| Área | Temas que deben poder explicarse y aplicarse | Evidencia práctica |
|---|---|---|
| Lenguaje | `tipos y control` · `objetos` · `records` · `sealed types` · `pattern matching` · `genéricos` · `anotaciones` · `JPMS` | tarifas RutaFlow |
| Biblioteca | `colecciones` · `streams` · `Optional` · `fechas` · `i18n` · `regex` · `NIO.2` · `HTTP Client` · `serialización segura` | tarifas RutaFlow |
| Concurrencia | `Java Memory Model` · `locks` · `atomics` · `concurrent collections` · `CompletableFuture` · `virtual threads` · `scoped values` · `structured concurrency` | tarifas RutaFlow |
| JVM | `bytecode` · `class loading` · `JIT` · `memoria` · `garbage collectors` · `Flight Recorder` · `jcmd y jstack` · `heap dumps` · `CDS y AOT` | tarifas RutaFlow |
| Integración | `JDBC` · `transacciones` · `ServiceLoader` · `reflection` · `method handles` · `Foreign Function and Memory API` · `JNI` | tarifas RutaFlow |
| Calidad | `JUnit` · `property testing` · `JMH` · `profiling` · `secure coding` · `criptografía` · `jlink y jpackage` · `migración LTS` | tarifas RutaFlow |

### Método de estudio y proyecto de ampliación

Para cada tema responde qué problema resuelve, cuál es su modelo mental, cómo falla, cómo se verifica y cuándo no conviene. Elige uno por área e intégralos en una vertical RutaFlow. Entrega diagrama, ADR, pruebas de éxito y fallo, una medición, una amenaza y el enlace oficial con versión y fecha. Una API preview se aísla en laboratorio y nunca se presenta como base estable.
<!-- OFFICIAL-TOPIC-ATLAS:END -->

## Resumen del módulo

- El Java Memory Model define visibilidad y orden; el tiempo de pared no crea happens-before.
- `volatile` no vuelve atómicas las operaciones compuestas y un record no congela objetos mutables.
- JMH controla warmup, forks y eliminación; la pregunta y workload siguen siendo responsabilidad humana.
- Deserializar datos no confiables es peligroso; prefiere DTO cerrado y limita cualquier caso legacy.
- jlink reduce el runtime y transfiere al equipo la responsabilidad de reconstruirlo y parchearlo.
- Heap no es toda la memoria; contenedores requieren margen, señales y observabilidad del runtime real.
