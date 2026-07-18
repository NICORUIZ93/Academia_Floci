# Módulo 13: Proyecto integrador

## Sílabo

**Objetivo general**

Unir programación orientada a objetos, concurrencia con virtual threads, testing con JUnit y Mockito, y un build reproducible en una aplicación real de consola o servicio.

**Objetivos específicos**

1. Diseñar la arquitectura por capas de una aplicación real.
2. Implementar procesamiento concurrente con virtual threads.
3. Modelar el dominio con records y sealed interfaces donde sea apropiado.
4. Escribir tests unitarios con JUnit 5 y Mockito para la lógica crítica.
5. Configurar un build reproducible ejecutable con un solo comando.

**Contenido**

- Arquitectura por capas.
- Concurrencia con virtual threads.
- Tests con JUnit y Mockito.
- Build reproducible con Gradle/Maven.

**Evaluación**

Aplicación Java con lógica concurrente, tests y build reproducible documentado, más tres ejercicios de evaluación de cierre.

---

## Contenido teórico

### Tema 1: Arquitectura por capas del proyecto integrador

**Conceptos clave:** separación dominio/servicio/infraestructura, cohesión por responsabilidad.

El proyecto integrador organiza el código en capas claramente separadas: `dominio/` contiene los modelos de datos inmutables usando records y sealed interfaces (Módulo 7), representando los conceptos centrales del negocio sin ninguna dependencia hacia detalles de infraestructura; `servicio/` contiene la lógica de negocio propiamente dicha, incluyendo el procesamiento concurrente de tareas usando virtual threads (Módulo 5) para operaciones con I/O; `infraestructura/` contiene los detalles concretos de persistencia y clientes externos, la capa más propensa a cambiar según decisiones técnicas específicas (qué base de datos usar, qué API externa consumir) sin que ese cambio deba afectar la lógica de negocio central en `servicio/`.

Esta separación por capas refleja el mismo principio de cohesión y responsabilidad única estudiado en el Módulo 12: cada capa tiene una razón de cambio distinta y bien delimitada (el modelo de dominio cambia cuando cambian los conceptos del negocio en sí; el servicio cambia cuando cambian las reglas de negocio; la infraestructura cambia cuando cambian las decisiones técnicas de implementación), y estructurar el código según esas fronteras facilita razonar sobre qué parte del sistema se ve afectada por un cambio específico, sin tener que rastrear ese impacto a través de código mezclado sin una separación clara de responsabilidades.

**Analogía:** la arquitectura por capas es como una empresa organizada en departamentos con responsabilidades claramente delimitadas: diseño de producto (dominio), operaciones (servicio) y logística externa (infraestructura), donde un cambio en el proveedor logístico externo no debería requerir que el departamento de diseño de producto cambie nada de su propio trabajo.

**¿Por qué es importante?** Separar el código en capas con responsabilidades bien delimitadas (dominio, servicio, infraestructura) facilita razonar sobre el impacto de un cambio específico, aislando las razones de cambio de cada capa.

**Diagrama:**

```
src/main/java/com/miapp/
  dominio/        ← records, sealed interfaces (módulo 7)
  servicio/        ← lógica de negocio, usa virtual threads para I/O concurrente (módulo 5)
  infraestructura/ ← persistencia, clientes externos
  Main.java
src/test/java/com/miapp/
  servicio/        ← tests con JUnit 5 + Mockito (módulo 9)
```

### Tema 2: Integrando concurrencia, modelado y testing

**Conceptos clave:** procesamiento paralelo con resultado modelado como sealed interface, tests aislados con mocks.

El procesamiento concurrente del proyecto integrador combina virtual threads (Módulo 5) para procesar múltiples tareas en paralelo con un modelo de resultado expresado como sealed interface (Módulo 7): `sealed interface ResultadoProcesamiento permits Exito, Error {}`, con `record Exito(String datos) implements ResultadoProcesamiento {}` y `record Error(String motivo) implements ResultadoProcesamiento {}`, permitiendo que cada tarea procesada concurrentemente devuelva explícitamente si tuvo éxito o falló, sin recurrir a lanzar excepciones para el caso de fallo esperado (un fallo individual de una tarea entre muchas no debería necesariamente interrumpir el procesamiento del resto), y con el compilador garantizando, mediante pattern matching exhaustivo (Módulo 7), que el código que procesa esos resultados maneje explícitamente ambos casos posibles.

Cada tarea se envía a un `Executors.newVirtualThreadPerTaskExecutor()` (Módulo 5), permitiendo procesar un volumen considerable de tareas concurrentemente incluso si cada una involucra I/O bloqueante, sin el costo de memoria que threads de plataforma tradicionales impondrían para ese mismo volumen; la lógica de negocio que decide cómo procesar cada tarea individual se prueba de forma aislada con JUnit 5 y Mockito (Módulo 9), mockeando cualquier dependencia externa (como un repositorio o cliente de red) para verificar la lógica de decisión en sí, sin depender de infraestructura real durante las pruebas.

**Analogía:** este procesamiento integrado es como una línea de producción con múltiples estaciones de trabajo simultáneas (virtual threads) donde cada producto terminado se etiqueta explícitamente como aprobado o rechazado (el sealed interface de resultado), con inspectores de calidad (los tests) que verifican la lógica de cada estación de forma aislada, usando maquetas de las materias primas externas (los mocks) en vez de depender de que la cadena de suministro real esté disponible durante cada inspección de calidad.

**¿Por qué es importante?** Modelar el resultado de un procesamiento concurrente como una sealed interface permite manejar explícitamente éxito y error sin recurrir a excepciones para casos esperados, con el compilador garantizando el manejo exhaustivo de ambos casos; probar la lógica de negocio aislada con mocks permite verificarla sin depender de infraestructura real.

**Código del ejemplo:**

```java
sealed interface ResultadoProcesamiento permits Exito, Error {}
record Exito(String datos) implements ResultadoProcesamiento {}
record Error(String motivo) implements ResultadoProcesamiento {}

List<ResultadoProcesamiento> resultados;
try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
    resultados = tareas.stream()
        .map(t -> executor.submit(() -> procesar(t)))
        .map(this::obtenerResultado)
        .toList();
}
```

### Tema 3: Build reproducible y cierre del track

**Conceptos clave:** ejecución con un solo comando, Java moderno como reducción de boilerplate.

Configurar el build con Gradle o Maven (Módulo 8) de forma que cualquier persona pueda clonar el repositorio y ejecutar la aplicación completa con un único comando (`./gradlew run` o `mvn compile exec:java`, según la herramienta elegida) elimina la fricción de configuración manual que de otro modo requeriría instrucciones extensas y propensas a desactualizarse sobre cómo preparar el entorno correctamente; declarar explícitamente todas las dependencias necesarias en el archivo de build (en vez de asumir que están disponibles globalmente en el sistema de quien ejecuta el proyecto) garantiza que el build sea reproducible: el mismo resultado exacto sin importar en qué máquina específica se ejecute, siempre que se use la misma versión declarada de cada dependencia.

Java moderno (17 hasta 21) reduce significativamente el boilerplate que históricamente se le criticaba al lenguaje frente a alternativas más recientes, sin sacrificar ninguna de las ventajas fundamentales de la JVM (tipado fuerte verificado en compilación, rendimiento maduro tras décadas de optimización del runtime, y un ecosistema de librerías extremadamente extenso y probado en producción): records eliminan el boilerplate de clases de datos inmutables, pattern matching elimina el boilerplate del casteo manual clásico, y virtual threads eliminan la necesidad de reescribir código en un estilo asíncrono basado en callbacks solo para lograr alta concurrencia con I/O bloqueante — la combinación de estas features hace que Java se sienta hoy tan productivo como cualquier lenguaje más reciente, sin abandonar ninguna de las garantías que hicieron a Java una elección confiable durante décadas de uso en producción a gran escala.

**Analogía:** un build reproducible con un solo comando es como entregar un electrodoméstico completamente ensamblado y listo para enchufar, en vez de una caja de piezas sueltas con instrucciones ambiguas que cada persona podría interpretar y ensamblar de forma ligeramente distinta; las features modernas de Java son como actualizaciones a una herramienta tradicional confiable que eliminan pasos manuales tediosos sin comprometer la solidez fundamental que la hizo confiable durante tanto tiempo.

**¿Por qué es importante?** Un build reproducible ejecutable con un solo comando elimina fricción de configuración manual y garantiza el mismo resultado en cualquier máquina; las features modernas de Java reducen boilerplate histórico sin sacrificar el tipado fuerte ni el rendimiento maduro de la JVM.

**Prueba en terminal:**

```bash
./gradlew run   # o: mvn compile exec:java
# cualquier persona clona el repo y ejecuta con un único comando
```

---

## Proyecto transversal RutaFlow: Motor de tarifas

RutaFlow conecta este track con una plataforma completa de paquetería. La implementación de referencia está en `examples/rutaflow/java/PricingEngine.java`; se estudia como punto de partida pequeño, no como sistema terminado.

### Capacidad y fundamento

Modela dinero con `BigDecimal`, unidades en nombres y entrada validada. `PricingRule` aplica abierto/cerrado porque existen variantes reales —peso, distancia, zona, contrato—; el motor no conoce detalles de cada regla. `List.copyOf` evita que el llamador cambie reglas después de construir el motor.

### Implementación guiada

1. Copia el contrato y escribe primero casos normales, límite, inválidos y duplicados.
2. Ejecuta la referencia, provoca un fallo y explica el mensaje antes de modificarla.
3. Implementa una mejora pequeña manteniendo nombres de dominio, efectos visibles y errores tipados.
4. Integra con el contrato del track anterior sin compartir tablas, estado mutable ni detalles de framework.
5. Registra la decisión en el README y etiqueta el hito de RutaFlow correspondiente.

### Verificación profesional

Implementa reglas base, sobrepeso y zona remota; prueba bordes, escala y redondeo HALF_EVEN. Añade una regla sin modificar el motor y crea una prueba de contrato que todas las reglas deben cumplir: cargo no negativo, determinista y sin mutar la solicitud.

El capítulo se completa cuando la evidencia permite a otra persona reproducir el flujo y explicar qué garantías ofrece y cuáles todavía no.

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

**Objetivo del laboratorio:** construir la aplicación integradora completa con arquitectura por capas, procesamiento concurrente, tests y build reproducible.

**Requisitos previos:** Módulos 0-12 completados.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Diseñar la arquitectura por capas | Ver Tema 1 | `dominio/`, `servicio/`, `infraestructura/` |
| 2 | Implementar procesamiento con virtual threads | Ver Tema 2 | Modela el resultado como sealed interface |
| 3 | Modelar el dominio con records y sealed interfaces | Módulo 7 | Donde sea apropiado |
| 4 | Escribir tests con JUnit 5 y Mockito | Módulo 9 | Para la lógica de negocio crítica |
| 5 | Configurar el build reproducible | Ver Tema 3 | Ejecutable con un solo comando |

**Verificación:** el laboratorio (y el track completo) se considera exitoso si la aplicación procesa tareas concurrentemente sin condiciones de carrera, si el manejo de éxito/error está modelado explícitamente y verificado exhaustivamente por el compilador, y si cualquier persona puede clonar y ejecutar el proyecto con un único comando documentado.

**Errores comunes y soluciones**

- **Mezclar lógica de dominio con detalles de infraestructura.** Mantén el dominio libre de dependencias hacia infraestructura concreta.
- **Usar excepciones para casos de fallo esperados en procesamiento concurrente masivo.** Modela el resultado como una sealed interface con casos de éxito y error explícitos.
- **Dejar el build sin documentar el comando de ejecución.** Documenta claramente cómo clonar y ejecutar el proyecto con un solo comando.

---

## Ejercicios de evaluación

### Ejercicio 1: Decisión de diseño al escalar 10x

**Enunciado:** ¿qué decisión de diseño cambiarías si tuvieras que escalar esta aplicación a 10 veces el volumen de datos?

**Solución esperada:** cualquier respuesta razonablemente justificada; respuestas comunes incluyen reconsiderar el recolector de basura (Módulo 11) según el nuevo perfil de memoria, evaluar si la capa de infraestructura necesita paginación o procesamiento por lotes en vez de cargar todo en memoria, o revisar si el número de virtual threads lanzados simultáneamente requiere algún límite adicional para no saturar recursos externos compartidos (como una base de datos con un límite de conexiones concurrentes).

**Criterios de éxito:**
- Propone un cambio concreto y justificado con una razón técnica relacionada con el aumento de escala.

### Ejercicio 2: Feature de Java moderna con mayor impacto

**Enunciado:** ¿qué parte del proyecto te hizo apreciar más una feature de Java moderna (records, virtual threads, pattern matching)?

**Solución esperada:** cualquier respuesta razonablemente justificada, vinculando una feature específica con un beneficio concreto observado durante la construcción del proyecto (por ejemplo, virtual threads simplificando el procesamiento concurrente sin reescribir en estilo asíncrono, o records eliminando boilerplate del modelo de dominio).

**Criterios de éxito:**
- Vincula correctamente una feature específica con un beneficio concreto observado en el proyecto propio.

### Ejercicio 3: Cierre del track — habilidades combinadas

**Enunciado:** enumera las habilidades concretas del track de Java que este proyecto integrador combina en una única aplicación.

**Solución esperada:** programación orientada a objetos y modelado con records/sealed interfaces (Módulos 1 y 7), concurrencia con virtual threads (Módulo 5), manejo robusto de excepciones (Módulo 3), testing aislado con JUnit 5 y Mockito (Módulo 9), y un build reproducible con Gradle o Maven (Módulo 8).

**Criterios de éxito:**
- Enumera al menos cuatro de las cinco habilidades combinadas, vinculándolas correctamente a los módulos donde se estudiaron.

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

- La arquitectura por capas (dominio, servicio, infraestructura) separa responsabilidades con razones de cambio distintas.
- El procesamiento concurrente con virtual threads combinado con un resultado modelado como sealed interface maneja éxito/error explícitamente.
- Un build reproducible ejecutable con un solo comando elimina fricción de configuración manual.
- Java moderno (17-21) reduce boilerplate histórico sin sacrificar tipado fuerte ni el rendimiento maduro de la JVM.

**Conceptos aprendidos**

- Arquitectura por capas de un proyecto real.
- Integración de concurrencia, modelado de dominio y testing.
- Build reproducible con Gradle/Maven.

**Próximos pasos**

Con el track de Java completo, estás preparado para construir, mantener y escalar aplicaciones y servicios Java modernos, combinando POO, concurrencia con virtual threads, modelado de dominio expresivo, testing riguroso y builds reproducibles.

**Recursos adicionales**

- Documentación oficial de Java (docs.oracle.com/en/java) como referencia continua para profundizar en cualquiera de los temas de este track.
