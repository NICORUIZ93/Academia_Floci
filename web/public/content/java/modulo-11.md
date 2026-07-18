# Módulo 11: JVM interna — GC, profiling y JIT

## Sílabo

**Objetivo general**

Entender qué hace la JVM por debajo (generaciones de memoria, recolectores de basura, compilación JIT) para poder diagnosticar problemas reales de memoria y rendimiento con herramientas estándar de profiling.

**Objetivos específicos**

1. Explicar la división de la heap en generaciones de memoria.
2. Comparar G1 y ZGC según su balance de throughput y pausas.
3. Grabar y analizar una sesión de Java Flight Recorder.
4. Explicar qué hace el JIT compiler y por qué una aplicación Java se acelera tras el warm-up.
5. Provocar y diagnosticar un `OutOfMemoryError` con un heap dump.

**Contenido**

- Generaciones de memoria y recolectores (G1, ZGC).
- Profiling con herramientas estándar (JFR).
- JIT compilation.
- Flags de JVM más usados.
- jconsole, jvisualvm, jstat y jmap.
- WeakReference, SoftReference, PhantomReference y ReferenceQueue.

**Evaluación**

Reporte de profiling de una aplicación propia identificando un cuello de botella real, más tres ejercicios de evaluación.

---

## Aprende construyendo

### Tema 1: Generaciones de memoria y recolectores

**Conceptos clave:** generación joven vs vieja, G1 frente a ZGC.

La heap de la JVM se divide típicamente en una generación joven (donde se crean los objetos recién instanciados, recolectada frecuentemente y de forma rápida) y una generación vieja (donde terminan los objetos que sobrevivieron varias rondas de recolección de la generación joven, recolectada con menor frecuencia pero de forma más costosa), una división basada en la observación empírica conocida como "hipótesis generacional débil": la gran mayoría de los objetos creados en cualquier programa mueren jóvenes (dejan de ser referenciados poco después de crearse), por lo que concentrar el esfuerzo de recolección frecuente específicamente en esa generación joven, donde efectivamente se encuentra la mayoría de la basura recolectable, es considerablemente más eficiente que recorrer la heap completa con la misma frecuencia sin distinción.

G1 (Garbage-First, el recolector por defecto desde Java 9) ofrece un buen balance general entre throughput (cantidad total de trabajo útil que la aplicación puede realizar) y pausas predecibles y razonablemente cortas, apropiado para la gran mayoría de aplicaciones sin requisitos extremos de latencia; ZGC ofrece pausas ultra-cortas, del orden de sub-milisegundo, incluso con heaps extremadamente grandes, a cambio de algo más de overhead general de procesamiento, siendo la elección apropiada específicamente para aplicaciones muy sensibles a la latencia donde incluso una pausa breve de G1 sería inaceptable, aceptando a cambio un throughput total potencialmente algo menor.

**Analogía:** la generación joven es como una bandeja de entrada que se revisa y se vacía frecuentemente, dado que la mayoría de sus elementos se resuelven o descartan rápidamente; la generación vieja es como un archivo de largo plazo revisado con mucha menor frecuencia, dado que lo que llega ahí ya demostró que probablemente permanecerá relevante por más tiempo. G1 es como un equipo de limpieza que hace rondas regulares y predecibles sin detener completamente las operaciones normales del edificio; ZGC es como un sistema de limpieza casi instantáneo e imperceptible, a costa de requerir algo más de recursos generales para operar de esa forma.

**¿Por qué es importante?** La división generacional concentra el esfuerzo de recolección frecuente donde efectivamente se encuentra la mayoría de la basura recolectable; elegir G1 frente a ZGC depende de si la aplicación prioriza throughput general o latencia mínima extrema.

**Prueba en terminal:**

```bash
java -XX:+UseZGC -jar mi-app.jar
```
```
Generación joven: objetos recién creados, recolectada frecuente y rápidamente
Generación vieja: objetos que sobrevivieron, recolectada con menor frecuencia
G1: buen balance throughput/pausas | ZGC: pausas sub-milisegundo, algo más de overhead
```

### Tema 2: Java Flight Recorder y JIT compilation

**Conceptos clave:** perfilado de bajo overhead en producción, compilación en caliente.

Java Flight Recorder (JFR) graba eventos detallados de la JVM (uso de CPU por método, actividad de memoria, contención de locks) con un overhead deliberadamente mínimo, diseñado específicamente para poder usarse de forma segura en producción sin degradar significativamente el rendimiento de la aplicación mientras se graba: `java -XX:StartFlightRecording=filename=perfil.jfr -jar mi-app.jar` inicia una grabación que produce un archivo `.jfr` analizable posteriormente, permitiendo diagnosticar problemas reales de rendimiento observados directamente en producción bajo carga real, en vez de tener que intentar reproducir artificialmente esas condiciones en un entorno de pruebas separado, que frecuentemente no logra replicar exactamente las condiciones específicas que causan el problema real observado.

La JVM inicialmente interpreta el bytecode (Módulo 0) en vez de compilarlo directamente a código máquina, pero identifica dinámicamente el código "caliente" (métodos ejecutados con muchísima frecuencia durante la ejecución real) y lo compila en caliente a código máquina nativo altamente optimizado específicamente para el patrón de uso observado en esa ejecución concreta, un proceso llamado compilación JIT (Just-In-Time); esta es precisamente la razón por la que una aplicación Java típica suele acelerarse notablemente después de sus primeros segundos de ejecución (el período de "warm-up"): el código que efectivamente se ejecuta con mayor frecuencia progresivamente deja de interpretarse y pasa a ejecutarse como código máquina nativo ya optimizado por el JIT.

**Analogía:** JFR es como una caja negra de un avión, registrando datos detallados de la operación con un impacto mínimo en el propio funcionamiento del avión, permitiendo analizar exactamente qué ocurrió durante un vuelo real específico en vez de solo poder estudiar simulaciones de vuelo separadas; el JIT es como un traductor que inicialmente interpreta un discurso frase por frase en tiempo real, pero que, al notar que ciertas frases se repiten constantemente, memoriza y perfecciona progresivamente una traducción óptima específica para esas frases frecuentes, acelerando notablemente la traducción de esas partes recurrentes con el paso del tiempo.

**¿Por qué es importante?** JFR permite diagnosticar problemas de rendimiento con evidencia real de producción, con overhead mínimo; el JIT explica por qué el rendimiento de una aplicación Java mejora progresivamente tras sus primeros momentos de ejecución.

**Prueba en terminal:**

```bash
java -XX:StartFlightRecording=filename=perfil.jfr -jar mi-app.jar
```
```
JVM interpreta bytecode inicialmente → identifica código "caliente" → 
compila JIT a código máquina optimizado → la app se acelera tras el warm-up
```

### Tema 3: Referencias especiales y heap dumps

**Conceptos clave:** `WeakReference`/`SoftReference`/`PhantomReference`, análisis de un heap dump.

`WeakReference` permite mantener una referencia a un objeto sin impedir que el recolector de basura lo elimine si esa es la única referencia restante hacia él (a diferencia de una referencia normal, "fuerte", que sí impide la recolección mientras exista), apropiada para estructuras como cachés donde se desea que ciertos objetos puedan liberarse automáticamente si la memoria se vuelve escasa y ya no hay otras referencias reales activas hacia ellos; `SoftReference` es similar pero más conservadora, permitiendo que el recolector la elimine solo bajo presión real de memoria, no tan agresivamente como una `WeakReference`; `PhantomReference`, junto con una `ReferenceQueue` asociada, permite ejecutar cierta lógica de limpieza específica justo después de que un objeto ha sido efectivamente finalizado por el recolector, un mecanismo más avanzado y de uso considerablemente menos común que los dos anteriores.

Provocar intencionalmente un `OutOfMemoryError` (acumulando objetos indefinidamente en una estructura sin nunca liberar sus referencias) y analizar el heap dump generado en ese momento (un volcado completo del contenido de la heap en el instante del error) permite identificar exactamente qué objetos específicos consumían la memoria disponible en el momento del fallo, y con qué frecuencia y desde qué puntos del código se estaban creando, información considerablemente más específica y accionable que la que los logs normales de la aplicación proporcionarían, dado que los logs típicamente no capturan el estado completo detallado de la memoria en el instante exacto de un fallo de memoria.

**Analogía:** una `WeakReference` es como una nota adhesiva que recuerda dónde está un objeto, pero que no impide que ese objeto se deseche si nadie más lo necesita realmente; un heap dump es como una fotografía forense detallada tomada exactamente en el momento de un colapso, mostrando con precisión qué había acumulado y en qué cantidades exactas, información que un simple registro de eventos anteriores al colapso no podría ofrecer con el mismo nivel de detalle específico del instante del fallo.

**¿Por qué es importante?** Las referencias especiales (`WeakReference`, `SoftReference`) permiten estructuras que cooperan con el recolector de basura en vez de impedir siempre su trabajo; un heap dump proporciona información detallada y específica sobre el estado exacto de la memoria en el momento de un fallo, información que los logs normales no capturan.

**Diagrama:**

```
-Xmx2g          # heap máximo
-Xms2g          # heap inicial
-XX:+PrintGCDetails  # logs detallados del recolector
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

**Objetivo del laboratorio:** generar un reporte de profiling identificando un cuello de botella real, y analizar un heap dump tras un `OutOfMemoryError` provocado intencionalmente.

**Requisitos previos:** Módulos 0-10 completados.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Ejecutar con G1 y con ZGC, comparar pausas | Ver Tema 1 | `-XX:+UseG1GC` vs `-XX:+UseZGC` |
| 2 | Grabar una sesión de JFR bajo carga | Ver Tema 2 | Analiza el método que más CPU consume |
| 3 | Provocar un `OutOfMemoryError` intencional | Ver Tema 3 | Analiza el heap dump generado |
| 4 | Documentar qué hace el JIT compiler | Ver Tema 2 | Compilación en caliente del código frecuente |

**Verificación:** el laboratorio se considera exitoso si el reporte de JFR identifica correctamente el método real que más tiempo de CPU consume bajo la carga simulada, y si el heap dump analizado identifica correctamente qué objetos causaron el `OutOfMemoryError`.

**Errores comunes y soluciones**

- **Asumir que ZGC siempre es mejor que G1 sin medir.** ZGC prioriza latencia mínima a costa de throughput; mide según las necesidades reales de tu aplicación.
- **Intentar diagnosticar un problema de producción solo con logs normales.** Usa JFR o un heap dump para obtener el detalle específico necesario.
- **Usar referencias fuertes normales para una caché que debería liberarse bajo presión de memoria.** Considera `SoftReference` para ese caso específico.

---



## Bibliografía y fundamento académico

Estas fuentes sustentan los conceptos y deben consultarse para verificar detalles que cambian entre versiones:

- Oracle, *Java Language Specification* y *Java Virtual Machine Specification*.
- OpenJDK, documentación de Java SE, JFR y JMH.
- Bloch, J., *Effective Java*.
- ACM/IEEE-CS/AAAI, *Computer Science Curricula 2023*.
- IEEE Computer Society, *SWEBOK Guide V4.0*.

## Resumen del módulo

**Puntos clave**

- La heap se divide en generación joven y vieja, concentrando el esfuerzo de recolección donde efectivamente está la mayoría de la basura.
- G1 balancea throughput y pausas predecibles; ZGC prioriza pausas ultra-cortas a costa de algo más de overhead.
- JFR permite perfilar con overhead mínimo, seguro para producción; el JIT compila código caliente a código máquina optimizado en tiempo de ejecución.
- Las referencias especiales (`WeakReference`, `SoftReference`) cooperan con el recolector; un heap dump ofrece detalle específico del estado de memoria en un fallo.

**Conceptos aprendidos**

- Generaciones de memoria y recolectores G1/ZGC.
- Java Flight Recorder y JIT compilation.
- Flags de JVM comunes.
- Referencias especiales y heap dumps.

**Próximos pasos**

En el Módulo 12 aprenderás buenas prácticas y patrones de diseño: Builder, Factory, Strategy, y principios SOLID.

**Recursos adicionales**

- Documentación oficial de Java (docs.oracle.com/en/java): "Garbage Collection Tuning Guide" y "Java Flight Recorder".
