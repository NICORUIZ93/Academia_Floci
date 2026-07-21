# Módulo 15: Spring Master: hexagonal, reactivo y microservicios


## Aprende construyendo

### Tema 1: WebFlux, Mono, Flux y Netty

#### Paso 1 · Objetivo y preparación
Al finalizar podrás implementar este tema desde cero. Prerrequisitos: JDK 21, Maven, Docker y un editor.

#### Paso 2 · Contexto y caso real
En un caso real de entregas, esta capacidad conecta pedidos, rutas y usuarios con contratos claros y recuperación ante fallos.

#### Paso 3 · Teoría, modelo mental y analogía
El diseño separa dominio, adaptadores y operación; cada frontera valida entradas, errores y permisos. La analogía es una central logística: cada estación tiene un responsable, protocolo y registro, no una caja de lógica mezclada.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-spring-avanzado
cd ejemplo-spring-avanzado
curl -fsSL https://start.spring.io/starter.zip -d dependencies=web,actuator -d javaVersion=21 -o app.zip
unzip app.zip
mvn test
```
Crea src/main/java/com/example/demo/Example.java con la implementación mínima y documenta cada bloque.

#### Paso 5 · Práctica guiada
Pista: ejecuta mvn test, provoca un fallo deliberado modificando una entrada o dependencia, lee el diagnóstico y corrígelo. Resultado esperado: prueba verde y salida reproducible.

#### Paso 6 · Práctica independiente
Añade un caso de éxito, un caso de error, una prueba de concurrencia y una métrica; explica qué garantía ofrece y cuál no.

#### Paso 7 · Cierre y evidencia
Guarda estructura, comandos, resultados y log; como siguiente paso integra la técnica en otro adaptador. Errores comunes: asumir configuración previa, mezclar capas, no validar fallos y omitir rollback. Fuentes oficiales: https://docs.spring.io/spring-boot/reference/ y https://spring.io/guides.
**¿Por qué es importante?** Porque una capacidad avanzada solo es útil cuando puede reproducirse y operarse con evidencia.
**Evidencia de aprendizaje:** entrega el proyecto aislado, prueba verde, fallo diagnosticado y explicación técnica.
**Conceptos clave:** propósito, modelo de ejecución, configuración, seguridad, coste, pruebas y operación.

WebFlux, Mono, Flux y Netty se estudia como una decisión de ingeniería y no como una colección de comandos. Primero identifica el problema que resuelve y los límites de la plataforma; luego construye el incremento mínimo dentro de RutaFlow. Registra entradas, salidas, dependencias y condiciones de fallo. Compara al menos una alternativa y conserva la medición que justifica la elección. Si la tecnología es experimental, se aísla del camino estable y se documenta la estrategia de retirada.

En producción debes considerar configuración por ambiente, identidad de máquina y persona, secretos, compatibilidad, telemetría y recuperación. Una demostración exitosa no prueba comportamiento bajo concurrencia, reintentos, pérdida de red o datos inválidos. Por eso el laboratorio introduce un fallo deliberado y exige una prueba de regresión. El resultado debe poder repetirse desde terminal y CI sin pasos secretos del editor.

**Analogía:** es como incorporar una nueva estación a una red logística: no basta con construirla; hay que definir rutas, capacidad, controles, contingencias y cómo sabremos que funciona.

**¿Por qué es importante?** Porque WebFlux, Mono, Flux y Netty aparece cuando el sistema crece y las decisiones dejan de ser locales. Comprender su coste evita adoptar una herramienta por popularidad o descartarla por una primera experiencia incompleta.

**Casos de uso reales:** operación normal, configuración inválida, dependencia lenta, solicitud duplicada, cambio incompatible y recuperación posterior a un despliegue fallido.

**Diagrama:**

```mermaid
flowchart LR
  A[Requisito RutaFlow] --> B[Decisión y alternativa]
  B --> C[Implementación mínima]
  C --> D[Prueba y medición]
  D --> E[Operación y recuperación]
  E -->|evidencia| B
```
### Tema 2: Testing avanzado con slices y Testcontainers

#### Paso 1 · Objetivo y preparación
Al finalizar podrás implementar este tema desde cero. Prerrequisitos: JDK 21, Maven, Docker y un editor.

#### Paso 2 · Contexto y caso real
En un caso real de entregas, esta capacidad conecta pedidos, rutas y usuarios con contratos claros y recuperación ante fallos.

#### Paso 3 · Teoría, modelo mental y analogía
El diseño separa dominio, adaptadores y operación; cada frontera valida entradas, errores y permisos. La analogía es una central logística: cada estación tiene un responsable, protocolo y registro, no una caja de lógica mezclada.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-spring-avanzado
cd ejemplo-spring-avanzado
curl -fsSL https://start.spring.io/starter.zip -d dependencies=web,actuator -d javaVersion=21 -o app.zip
unzip app.zip
mvn test
```
Crea src/main/java/com/example/demo/Example.java con la implementación mínima y documenta cada bloque.

#### Paso 5 · Práctica guiada
Pista: ejecuta mvn test, provoca un fallo deliberado modificando una entrada o dependencia, lee el diagnóstico y corrígelo. Resultado esperado: prueba verde y salida reproducible.

#### Paso 6 · Práctica independiente
Añade un caso de éxito, un caso de error, una prueba de concurrencia y una métrica; explica qué garantía ofrece y cuál no.

#### Paso 7 · Cierre y evidencia
Guarda estructura, comandos, resultados y log; como siguiente paso integra la técnica en otro adaptador. Errores comunes: asumir configuración previa, mezclar capas, no validar fallos y omitir rollback. Fuentes oficiales: https://docs.spring.io/spring-boot/reference/ y https://spring.io/guides.
**¿Por qué es importante?** Porque una capacidad avanzada solo es útil cuando puede reproducirse y operarse con evidencia.
**Evidencia de aprendizaje:** entrega el proyecto aislado, prueba verde, fallo diagnosticado y explicación técnica.
**Conceptos clave:** propósito, modelo de ejecución, configuración, seguridad, coste, pruebas y operación.

Testing avanzado con slices y Testcontainers se estudia como una decisión de ingeniería y no como una colección de comandos. Primero identifica el problema que resuelve y los límites de la plataforma; luego construye el incremento mínimo dentro de RutaFlow. Registra entradas, salidas, dependencias y condiciones de fallo. Compara al menos una alternativa y conserva la medición que justifica la elección. Si la tecnología es experimental, se aísla del camino estable y se documenta la estrategia de retirada.

En producción debes considerar configuración por ambiente, identidad de máquina y persona, secretos, compatibilidad, telemetría y recuperación. Una demostración exitosa no prueba comportamiento bajo concurrencia, reintentos, pérdida de red o datos inválidos. Por eso el laboratorio introduce un fallo deliberado y exige una prueba de regresión. El resultado debe poder repetirse desde terminal y CI sin pasos secretos del editor.

**Analogía:** es como incorporar una nueva estación a una red logística: no basta con construirla; hay que definir rutas, capacidad, controles, contingencias y cómo sabremos que funciona.

**¿Por qué es importante?** Porque Testing avanzado con slices y Testcontainers aparece cuando el sistema crece y las decisiones dejan de ser locales. Comprender su coste evita adoptar una herramienta por popularidad o descartarla por una primera experiencia incompleta.

**Casos de uso reales:** operación normal, configuración inválida, dependencia lenta, solicitud duplicada, cambio incompatible y recuperación posterior a un despliegue fallido.

**Diagrama:**

```mermaid
flowchart LR
  A[Requisito RutaFlow] --> B[Decisión y alternativa]
  B --> C[Implementación mínima]
  C --> D[Prueba y medición]
  D --> E[Operación y recuperación]
  E -->|evidencia| B
```
### Tema 3: Arquitectura hexagonal

#### Paso 1 · Objetivo y preparación
Al finalizar podrás implementar este tema desde cero. Prerrequisitos: JDK 21, Maven, Docker y un editor.

#### Paso 2 · Contexto y caso real
En un caso real de entregas, esta capacidad conecta pedidos, rutas y usuarios con contratos claros y recuperación ante fallos.

#### Paso 3 · Teoría, modelo mental y analogía
El diseño separa dominio, adaptadores y operación; cada frontera valida entradas, errores y permisos. La analogía es una central logística: cada estación tiene un responsable, protocolo y registro, no una caja de lógica mezclada.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-spring-avanzado
cd ejemplo-spring-avanzado
curl -fsSL https://start.spring.io/starter.zip -d dependencies=web,actuator -d javaVersion=21 -o app.zip
unzip app.zip
mvn test
```
Crea src/main/java/com/example/demo/Example.java con la implementación mínima y documenta cada bloque.

#### Paso 5 · Práctica guiada
Pista: ejecuta mvn test, provoca un fallo deliberado modificando una entrada o dependencia, lee el diagnóstico y corrígelo. Resultado esperado: prueba verde y salida reproducible.

#### Paso 6 · Práctica independiente
Añade un caso de éxito, un caso de error, una prueba de concurrencia y una métrica; explica qué garantía ofrece y cuál no.

#### Paso 7 · Cierre y evidencia
Guarda estructura, comandos, resultados y log; como siguiente paso integra la técnica en otro adaptador. Errores comunes: asumir configuración previa, mezclar capas, no validar fallos y omitir rollback. Fuentes oficiales: https://docs.spring.io/spring-boot/reference/ y https://spring.io/guides.
**¿Por qué es importante?** Porque una capacidad avanzada solo es útil cuando puede reproducirse y operarse con evidencia.
**Evidencia de aprendizaje:** entrega el proyecto aislado, prueba verde, fallo diagnosticado y explicación técnica.
**Conceptos clave:** propósito, modelo de ejecución, configuración, seguridad, coste, pruebas y operación.

Arquitectura hexagonal se estudia como una decisión de ingeniería y no como una colección de comandos. Primero identifica el problema que resuelve y los límites de la plataforma; luego construye el incremento mínimo dentro de RutaFlow. Registra entradas, salidas, dependencias y condiciones de fallo. Compara al menos una alternativa y conserva la medición que justifica la elección. Si la tecnología es experimental, se aísla del camino estable y se documenta la estrategia de retirada.

En producción debes considerar configuración por ambiente, identidad de máquina y persona, secretos, compatibilidad, telemetría y recuperación. Una demostración exitosa no prueba comportamiento bajo concurrencia, reintentos, pérdida de red o datos inválidos. Por eso el laboratorio introduce un fallo deliberado y exige una prueba de regresión. El resultado debe poder repetirse desde terminal y CI sin pasos secretos del editor.

**Analogía:** es como incorporar una nueva estación a una red logística: no basta con construirla; hay que definir rutas, capacidad, controles, contingencias y cómo sabremos que funciona.

**¿Por qué es importante?** Porque Arquitectura hexagonal aparece cuando el sistema crece y las decisiones dejan de ser locales. Comprender su coste evita adoptar una herramienta por popularidad o descartarla por una primera experiencia incompleta.

**Casos de uso reales:** operación normal, configuración inválida, dependencia lenta, solicitud duplicada, cambio incompatible y recuperación posterior a un despliegue fallido.

**Diagrama:**

```mermaid
flowchart LR
  A[Requisito RutaFlow] --> B[Decisión y alternativa]
  B --> C[Implementación mínima]
  C --> D[Prueba y medición]
  D --> E[Operación y recuperación]
  E -->|evidencia| B
```
### Tema 4: Spring Cloud y Resilience4j

#### Paso 1 · Objetivo y preparación
Al finalizar podrás implementar este tema desde cero. Prerrequisitos: JDK 21, Maven, Docker y un editor.

#### Paso 2 · Contexto y caso real
En un caso real de entregas, esta capacidad conecta pedidos, rutas y usuarios con contratos claros y recuperación ante fallos.

#### Paso 3 · Teoría, modelo mental y analogía
El diseño separa dominio, adaptadores y operación; cada frontera valida entradas, errores y permisos. La analogía es una central logística: cada estación tiene un responsable, protocolo y registro, no una caja de lógica mezclada.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-spring-avanzado
cd ejemplo-spring-avanzado
curl -fsSL https://start.spring.io/starter.zip -d dependencies=web,actuator -d javaVersion=21 -o app.zip
unzip app.zip
mvn test
```
Crea src/main/java/com/example/demo/Example.java con la implementación mínima y documenta cada bloque.

#### Paso 5 · Práctica guiada
Pista: ejecuta mvn test, provoca un fallo deliberado modificando una entrada o dependencia, lee el diagnóstico y corrígelo. Resultado esperado: prueba verde y salida reproducible.

#### Paso 6 · Práctica independiente
Añade un caso de éxito, un caso de error, una prueba de concurrencia y una métrica; explica qué garantía ofrece y cuál no.

#### Paso 7 · Cierre y evidencia
Guarda estructura, comandos, resultados y log; como siguiente paso integra la técnica en otro adaptador. Errores comunes: asumir configuración previa, mezclar capas, no validar fallos y omitir rollback. Fuentes oficiales: https://docs.spring.io/spring-boot/reference/ y https://spring.io/guides.
**¿Por qué es importante?** Porque una capacidad avanzada solo es útil cuando puede reproducirse y operarse con evidencia.
**Evidencia de aprendizaje:** entrega el proyecto aislado, prueba verde, fallo diagnosticado y explicación técnica.
**Conceptos clave:** propósito, modelo de ejecución, configuración, seguridad, coste, pruebas y operación.

Spring Cloud y Resilience4j se estudia como una decisión de ingeniería y no como una colección de comandos. Primero identifica el problema que resuelve y los límites de la plataforma; luego construye el incremento mínimo dentro de RutaFlow. Registra entradas, salidas, dependencias y condiciones de fallo. Compara al menos una alternativa y conserva la medición que justifica la elección. Si la tecnología es experimental, se aísla del camino estable y se documenta la estrategia de retirada.

En producción debes considerar configuración por ambiente, identidad de máquina y persona, secretos, compatibilidad, telemetría y recuperación. Una demostración exitosa no prueba comportamiento bajo concurrencia, reintentos, pérdida de red o datos inválidos. Por eso el laboratorio introduce un fallo deliberado y exige una prueba de regresión. El resultado debe poder repetirse desde terminal y CI sin pasos secretos del editor.

**Analogía:** es como incorporar una nueva estación a una red logística: no basta con construirla; hay que definir rutas, capacidad, controles, contingencias y cómo sabremos que funciona.

**¿Por qué es importante?** Porque Spring Cloud y Resilience4j aparece cuando el sistema crece y las decisiones dejan de ser locales. Comprender su coste evita adoptar una herramienta por popularidad o descartarla por una primera experiencia incompleta.

**Casos de uso reales:** operación normal, configuración inválida, dependencia lenta, solicitud duplicada, cambio incompatible y recuperación posterior a un despliegue fallido.

**Diagrama:**

```mermaid
flowchart LR
  A[Requisito RutaFlow] --> B[Decisión y alternativa]
  B --> C[Implementación mínima]
  C --> D[Prueba y medición]
  D --> E[Operación y recuperación]
  E -->|evidencia| B
```
### Tema 5: Sagas y CQRS

#### Paso 1 · Objetivo y preparación
Al finalizar podrás implementar este tema desde cero. Prerrequisitos: JDK 21, Maven, Docker y un editor.

#### Paso 2 · Contexto y caso real
En un caso real de entregas, esta capacidad conecta pedidos, rutas y usuarios con contratos claros y recuperación ante fallos.

#### Paso 3 · Teoría, modelo mental y analogía
El diseño separa dominio, adaptadores y operación; cada frontera valida entradas, errores y permisos. La analogía es una central logística: cada estación tiene un responsable, protocolo y registro, no una caja de lógica mezclada.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-spring-avanzado
cd ejemplo-spring-avanzado
curl -fsSL https://start.spring.io/starter.zip -d dependencies=web,actuator -d javaVersion=21 -o app.zip
unzip app.zip
mvn test
```
Crea src/main/java/com/example/demo/Example.java con la implementación mínima y documenta cada bloque.

#### Paso 5 · Práctica guiada
Pista: ejecuta mvn test, provoca un fallo deliberado modificando una entrada o dependencia, lee el diagnóstico y corrígelo. Resultado esperado: prueba verde y salida reproducible.

#### Paso 6 · Práctica independiente
Añade un caso de éxito, un caso de error, una prueba de concurrencia y una métrica; explica qué garantía ofrece y cuál no.

#### Paso 7 · Cierre y evidencia
Guarda estructura, comandos, resultados y log; como siguiente paso integra la técnica en otro adaptador. Errores comunes: asumir configuración previa, mezclar capas, no validar fallos y omitir rollback. Fuentes oficiales: https://docs.spring.io/spring-boot/reference/ y https://spring.io/guides.
**¿Por qué es importante?** Porque una capacidad avanzada solo es útil cuando puede reproducirse y operarse con evidencia.
**Evidencia de aprendizaje:** entrega el proyecto aislado, prueba verde, fallo diagnosticado y explicación técnica.
**Conceptos clave:** propósito, modelo de ejecución, configuración, seguridad, coste, pruebas y operación.

Sagas y CQRS se estudia como una decisión de ingeniería y no como una colección de comandos. Primero identifica el problema que resuelve y los límites de la plataforma; luego construye el incremento mínimo dentro de RutaFlow. Registra entradas, salidas, dependencias y condiciones de fallo. Compara al menos una alternativa y conserva la medición que justifica la elección. Si la tecnología es experimental, se aísla del camino estable y se documenta la estrategia de retirada.

En producción debes considerar configuración por ambiente, identidad de máquina y persona, secretos, compatibilidad, telemetría y recuperación. Una demostración exitosa no prueba comportamiento bajo concurrencia, reintentos, pérdida de red o datos inválidos. Por eso el laboratorio introduce un fallo deliberado y exige una prueba de regresión. El resultado debe poder repetirse desde terminal y CI sin pasos secretos del editor.

**Analogía:** es como incorporar una nueva estación a una red logística: no basta con construirla; hay que definir rutas, capacidad, controles, contingencias y cómo sabremos que funciona.

**¿Por qué es importante?** Porque Sagas y CQRS aparece cuando el sistema crece y las decisiones dejan de ser locales. Comprender su coste evita adoptar una herramienta por popularidad o descartarla por una primera experiencia incompleta.

**Casos de uso reales:** operación normal, configuración inválida, dependencia lenta, solicitud duplicada, cambio incompatible y recuperación posterior a un despliegue fallido.

**Diagrama:**

```mermaid
flowchart LR
  A[Requisito RutaFlow] --> B[Decisión y alternativa]
  B --> C[Implementación mínima]
  C --> D[Prueba y medición]
  D --> E[Operación y recuperación]
  E -->|evidencia| B
```
### Tema 6: Event Sourcing y Outbox

#### Paso 1 · Objetivo y preparación
Al finalizar podrás implementar este tema desde cero. Prerrequisitos: JDK 21, Maven, Docker y un editor.

#### Paso 2 · Contexto y caso real
En un caso real de entregas, esta capacidad conecta pedidos, rutas y usuarios con contratos claros y recuperación ante fallos.

#### Paso 3 · Teoría, modelo mental y analogía
El diseño separa dominio, adaptadores y operación; cada frontera valida entradas, errores y permisos. La analogía es una central logística: cada estación tiene un responsable, protocolo y registro, no una caja de lógica mezclada.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-spring-avanzado
cd ejemplo-spring-avanzado
curl -fsSL https://start.spring.io/starter.zip -d dependencies=web,actuator -d javaVersion=21 -o app.zip
unzip app.zip
mvn test
```
Crea src/main/java/com/example/demo/Example.java con la implementación mínima y documenta cada bloque.

#### Paso 5 · Práctica guiada
Pista: ejecuta mvn test, provoca un fallo deliberado modificando una entrada o dependencia, lee el diagnóstico y corrígelo. Resultado esperado: prueba verde y salida reproducible.

#### Paso 6 · Práctica independiente
Añade un caso de éxito, un caso de error, una prueba de concurrencia y una métrica; explica qué garantía ofrece y cuál no.

#### Paso 7 · Cierre y evidencia
Guarda estructura, comandos, resultados y log; como siguiente paso integra la técnica en otro adaptador. Errores comunes: asumir configuración previa, mezclar capas, no validar fallos y omitir rollback. Fuentes oficiales: https://docs.spring.io/spring-boot/reference/ y https://spring.io/guides.
**¿Por qué es importante?** Porque una capacidad avanzada solo es útil cuando puede reproducirse y operarse con evidencia.
**Evidencia de aprendizaje:** entrega el proyecto aislado, prueba verde, fallo diagnosticado y explicación técnica.
**Conceptos clave:** propósito, modelo de ejecución, configuración, seguridad, coste, pruebas y operación.

Event Sourcing y Outbox se estudia como una decisión de ingeniería y no como una colección de comandos. Primero identifica el problema que resuelve y los límites de la plataforma; luego construye el incremento mínimo dentro de RutaFlow. Registra entradas, salidas, dependencias y condiciones de fallo. Compara al menos una alternativa y conserva la medición que justifica la elección. Si la tecnología es experimental, se aísla del camino estable y se documenta la estrategia de retirada.

En producción debes considerar configuración por ambiente, identidad de máquina y persona, secretos, compatibilidad, telemetría y recuperación. Una demostración exitosa no prueba comportamiento bajo concurrencia, reintentos, pérdida de red o datos inválidos. Por eso el laboratorio introduce un fallo deliberado y exige una prueba de regresión. El resultado debe poder repetirse desde terminal y CI sin pasos secretos del editor.

**Analogía:** es como incorporar una nueva estación a una red logística: no basta con construirla; hay que definir rutas, capacidad, controles, contingencias y cómo sabremos que funciona.

**¿Por qué es importante?** Porque Event Sourcing y Outbox aparece cuando el sistema crece y las decisiones dejan de ser locales. Comprender su coste evita adoptar una herramienta por popularidad o descartarla por una primera experiencia incompleta.

**Casos de uso reales:** operación normal, configuración inválida, dependencia lenta, solicitud duplicada, cambio incompatible y recuperación posterior a un despliegue fallido.

**Diagrama:**

```mermaid
flowchart LR
  A[Requisito RutaFlow] --> B[Decisión y alternativa]
  B --> C[Implementación mínima]
  C --> D[Prueba y medición]
  D --> E[Operación y recuperación]
  E -->|evidencia| B
```


## Trazabilidad de la auditoría original

- **Spring WebFlux**: cubierto mediante fundamento, laboratorio y evidencia del capítulo.
- **Testing Avanzado**: cubierto mediante fundamento, laboratorio y evidencia del capítulo.
- **Arquitectura Hexagonal**: cubierto mediante fundamento, laboratorio y evidencia del capítulo.
- **Microservicios Avanzado**: cubierto mediante fundamento, laboratorio y evidencia del capítulo.
- **Spring Cloud Avanzado**: cubierto mediante fundamento, laboratorio y evidencia del capítulo.
