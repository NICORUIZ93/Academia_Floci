# Módulo 10: Módulos (JPMS) y proyectos grandes


## Aprende construyendo

### Tema 1: module-info.java y encapsulación fuerte

#### Paso 1 · Objetivo y preparación
Al finalizar podrás modularizar un proyecto Java desde cero. Prerrequisitos: JDK 21, Maven y un editor. Comprueba java --version.

#### Paso 2 · Contexto y caso real
En un caso real, una plataforma grande necesita limitar qué paquetes se exportan y detectar dependencias ilegales antes de desplegar.

#### Paso 3 · Teoría, modelo mental y analogía
JPMS declara módulos, requires, exports y opens; la encapsulación fuerte evita acceso accidental. opens se reserva para reflexión de frameworks y debe ser específico. La analogía es un edificio con puertas registradas: cada permiso tiene destinatario y propósito.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-java-m10
cd ejemplo-java-m10
mkdir -p src/com.example.main/com/example
```
Crea src/com.example.main/module-info.java y una clase Main; compila con javac --module-source-path src -d out y ejecuta con java --module-path out.

#### Paso 5 · Práctica guiada
Pista: elimina deliberadamente un exports para provocar un fallo deliberado de acceso; lee el diagnóstico y corrígelo. Resultado esperado: solo el paquete público es visible.

#### Paso 6 · Práctica independiente
Divide una clase interna y un API público, añade requires/exports mínimos y documenta qué framework necesita opens y por qué.

#### Paso 7 · Cierre y evidencia
Guarda árbol, comandos y diagnóstico; como siguiente paso evalúa módulos en CI. Errores comunes: exportar todo, abrir todos los paquetes, mezclar classpath y modulepath y migrar sin inventario. Fuentes oficiales: https://dev.java/learn/modules/ y https://openjdk.org/jeps/261.
**¿Por qué es importante?** Porque los límites explícitos reducen acoplamiento y sorpresas en tiempo de ejecución.
**Evidencia de aprendizaje:** entrega module-info, compilación modular, fallo y matriz de accesos.
**Conceptos clave:** `exports`, `requires`, encapsulación más allá de `public`.

`module-info.java` es el archivo descriptor que declara explícitamente la identidad de un módulo JPMS y sus relaciones con otros módulos: `module com.miapp.core { exports com.miapp.core.dominio; }` declara que el módulo `com.miapp.core` existe, y que únicamente el paquete `com.miapp.core.dominio` está disponible para ser usado por otros módulos (`exports`), mientras cualquier otro paquete de ese mismo módulo que no aparezca explícitamente en una declaración `exports` permanece completamente inaccesible desde fuera del módulo, sin importar que sus clases individuales estén marcadas como `public`.

Esta es la encapsulación fuerte que JPMS agrega, algo que los modificadores de acceso tradicionales de Java (Módulo 1) no ofrecían por sí solos antes de la existencia de módulos: antes de JPMS, marcar una clase como `public` la hacía accesible desde absolutamente cualquier otro código presente en el classpath completo de la aplicación, sin ninguna forma de restringir ese acceso a nivel más amplio que la propia clase o paquete individual; con JPMS, un paquete completo que contenga clases `public` puede permanecer completamente inaccesible desde fuera de su propio módulo simplemente por no estar listado en `exports`, una capa adicional de encapsulación a nivel de módulo que complementa (sin reemplazar) los modificadores de acceso tradicionales a nivel de clase.

**Analogía:** antes de JPMS, marcar algo como `public` era como dejar una puerta sin ninguna cerradura en absoluto, accesible desde cualquier parte del edificio completo; con JPMS, `exports` es como decidir explícitamente cuáles puertas específicas de un departamento completo del edificio (el módulo) tienen realmente una entrada visible hacia el resto del edificio, mientras el resto de las puertas de ese mismo departamento, aunque técnicamente sin cerradura interna, simplemente no tienen ningún acceso visible desde fuera del propio departamento.

**¿Por qué es importante?** JPMS agrega encapsulación fuerte a nivel de módulo, más allá de lo que los modificadores de acceso tradicionales `public`/`private` ofrecían por sí solos, permitiendo ocultar paquetes completos (incluso con clases `public`) del resto de la aplicación.

**Código del ejemplo:**

```java
// core/src/main/java/module-info.java
module com.miapp.core {
    exports com.miapp.core.dominio; // solo este paquete es visible para otros módulos
}
// app/src/main/java/module-info.java
module com.miapp.app {
    requires com.miapp.core;
}
```

#### Construcción RutaFlow: encapsulación comprobada por el compilador

Crea `rutaflow-domain/src/main/java/module-info.java`, exportando solo `com.rutaflow.domain.api`, y `rutaflow-cli/src/main/java/module-info.java`, requiriendo `com.rutaflow.domain`. Coloca una clase pública interna en `com.rutaflow.domain.internal` e intenta importarla desde CLI. Ejecuta `./gradlew build`; el resultado esperado es un error de acceso al paquete no exportado.

Mueve el comportamiento necesario detrás de una clase de la API y conserva el paquete interno oculto; el build debe pasar. Como modificación, usa `jdeps --module-path ...` para listar dependencias reales y compáralas con los descriptores. No exportes todo para silenciar el error: RutaFlow adopta JPMS únicamente si esos límites aportan valor adicional al multi-módulo de Gradle.

### Tema 2: Migración incremental y cuándo JPMS aporta valor

#### Paso 1 · Objetivo y preparación
Al finalizar podrás modularizar un proyecto Java desde cero. Prerrequisitos: JDK 21, Maven y un editor. Comprueba java --version.

#### Paso 2 · Contexto y caso real
En un caso real, una plataforma grande necesita limitar qué paquetes se exportan y detectar dependencias ilegales antes de desplegar.

#### Paso 3 · Teoría, modelo mental y analogía
JPMS declara módulos, requires, exports y opens; la encapsulación fuerte evita acceso accidental. opens se reserva para reflexión de frameworks y debe ser específico. La analogía es un edificio con puertas registradas: cada permiso tiene destinatario y propósito.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-java-m10
cd ejemplo-java-m10
mkdir -p src/com.example.main/com/example
```
Crea src/com.example.main/module-info.java y una clase Main; compila con javac --module-source-path src -d out y ejecuta con java --module-path out.

#### Paso 5 · Práctica guiada
Pista: elimina deliberadamente un exports para provocar un fallo deliberado de acceso; lee el diagnóstico y corrígelo. Resultado esperado: solo el paquete público es visible.

#### Paso 6 · Práctica independiente
Divide una clase interna y un API público, añade requires/exports mínimos y documenta qué framework necesita opens y por qué.

#### Paso 7 · Cierre y evidencia
Guarda árbol, comandos y diagnóstico; como siguiente paso evalúa módulos en CI. Errores comunes: exportar todo, abrir todos los paquetes, mezclar classpath y modulepath y migrar sin inventario. Fuentes oficiales: https://dev.java/learn/modules/ y https://openjdk.org/jeps/261.
**¿Por qué es importante?** Porque los límites explícitos reducen acoplamiento y sorpresas en tiempo de ejecución.
**Evidencia de aprendizaje:** entrega module-info, compilación modular, fallo y matriz de accesos.
**Conceptos clave:** módulos "hoja" primero, `requires transitive`, costo/beneficio.

Migrar un proyecto legacy grande sin módulos hacia JPMS es un proceso incremental, no un cambio de una sola vez: comenzar por los módulos "hoja" del árbol de dependencias (aquellos sin dependencias internas propias hacia otras partes del mismo proyecto) agregándoles su `module-info.java` correspondiente, y subir progresivamente en el árbol de dependencias agregando módulos hasta cubrir eventualmente el proyecto completo, un enfoque que permite verificar en cada paso que la migración parcial hasta ese punto sigue funcionando correctamente, en vez de intentar convertir todo el proyecto de una sola vez con un riesgo mucho mayor de introducir errores difíciles de aislar.

`requires transitive` se usa cuando un módulo expone en su propia API pública tipos que en realidad provienen de otro módulo del que depende (por ejemplo, si un método público de `api` devuelve un tipo definido en `core`), garantizando que cualquier módulo que dependa de `api` también obtenga automáticamente acceso a `core` sin necesidad de declarar esa dependencia por separado explícitamente. En cuanto a cuándo JPMS aporta valor real: para bibliotecas grandes y de larga vida con muchos consumidores externos (como el propio JDK, que usa JPMS internamente desde Java 9), o para sistemas con muchos equipos distintos compartiendo una misma base de código grande, JPMS impone límites arquitectónicos verificados por el compilador que previenen dependencias no deseadas entre partes del sistema; para un proyecto pequeño o un microservicio independiente con pocos módulos internos, la ceremonia adicional de gestionar `module-info.java` en cada módulo suele ser complejidad sin un beneficio proporcional real.

**Analogía:** migrar a JPMS incrementalmente es como renovar la instalación eléctrica de un edificio habitación por habitación, comenzando por las habitaciones que no dependen de ninguna otra, en vez de cortar la electricidad de todo el edificio simultáneamente para una renovación completa de una sola vez; evaluar si JPMS aporta valor es como decidir si vale la pena instalar un sistema de seguridad departamental completo en una casa pequeña habitada por una única familia, frente a un edificio grande compartido por muchas familias distintas donde esos límites de seguridad claramente sí aportan valor real.

**¿Por qué es importante?** Migrar incrementalmente desde los módulos "hoja" acota el riesgo de cada paso de la migración; evaluar correctamente cuándo JPMS aporta valor real evita imponer su ceremonia adicional en proyectos donde esos límites arquitectónicos no son genuinamente necesarios.

**Diagrama:**

```mermaid
flowchart LR
    LEAF["1. rutaflow-domain"] --> APP["2. application"]
    APP --> ADAPTERS["3. adapters"]
    ADAPTERS --> API["4. runtime"]
```

#### Construcción RutaFlow: migración reversible

Crea `docs/migracion-jpms.md` con el grafo actual, módulos hoja, dependencias automáticas y criterio de salida. Convierte primero `rutaflow-domain`, ejecuta `./gradlew test` y `jdeps --check com.rutaflow.domain`; registra el resultado antes de tocar application. El hito esperado es dominio modular sin cambios funcionales.

Declara `requires transitive` sin exponer tipos del módulo requerido y observa que amplía innecesariamente la API legible. Cámbialo a `requires` normal. Como modificación, prueba la aplicación en classpath y module-path durante la transición. Si el costo supera el beneficio para este despliegue, documenta la decisión de detener la migración: profesional no significa usar JPMS obligatoriamente.

### Tema 3: `opens` para acceso reflexivo controlado de frameworks

#### Paso 1 · Objetivo y preparación
Al finalizar podrás modularizar un proyecto Java desde cero. Prerrequisitos: JDK 21, Maven y un editor. Comprueba java --version.

#### Paso 2 · Contexto y caso real
En un caso real, una plataforma grande necesita limitar qué paquetes se exportan y detectar dependencias ilegales antes de desplegar.

#### Paso 3 · Teoría, modelo mental y analogía
JPMS declara módulos, requires, exports y opens; la encapsulación fuerte evita acceso accidental. opens se reserva para reflexión de frameworks y debe ser específico. La analogía es un edificio con puertas registradas: cada permiso tiene destinatario y propósito.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-java-m10
cd ejemplo-java-m10
mkdir -p src/com.example.main/com/example
```
Crea src/com.example.main/module-info.java y una clase Main; compila con javac --module-source-path src -d out y ejecuta con java --module-path out.

#### Paso 5 · Práctica guiada
Pista: elimina deliberadamente un exports para provocar un fallo deliberado de acceso; lee el diagnóstico y corrígelo. Resultado esperado: solo el paquete público es visible.

#### Paso 6 · Práctica independiente
Divide una clase interna y un API público, añade requires/exports mínimos y documenta qué framework necesita opens y por qué.

#### Paso 7 · Cierre y evidencia
Guarda árbol, comandos y diagnóstico; como siguiente paso evalúa módulos en CI. Errores comunes: exportar todo, abrir todos los paquetes, mezclar classpath y modulepath y migrar sin inventario. Fuentes oficiales: https://dev.java/learn/modules/ y https://openjdk.org/jeps/261.
**¿Por qué es importante?** Porque los límites explícitos reducen acoplamiento y sorpresas en tiempo de ejecución.
**Evidencia de aprendizaje:** entrega module-info, compilación modular, fallo y matriz de accesos.
**Conceptos clave:** `exports` da acceso en tiempo de compilación, `opens` da acceso reflexivo en tiempo de ejecución; son declaraciones independientes.

`exports` resuelve el acceso normal de compilación y llamada directa entre módulos, pero no basta para frameworks como Spring, Jackson o Hibernate, que necesitan inspeccionar y construir objetos de tus propias clases mediante reflexión (leer campos privados, invocar constructores sin argumentos, anotar campos) sin que tu código llame a esos frameworks directamente. Si un paquete solo está `exports`, la reflexión profunda de esos frameworks sobre tus clases falla en tiempo de ejecución con `InaccessibleObjectException`, aunque el mismo paquete compile y funcione perfectamente con llamadas directas de código. `opens com.miapp.dominio;` concede ese acceso reflexivo adicional; `opens com.miapp.dominio to com.fasterxml.jackson.databind;` lo restringe a un módulo específico en vez de abrirlo a cualquiera, igual que `exports ... to ...` restringe el acceso de compilación a módulos concretos.

Es habitual necesitar ambas declaraciones sobre el mismo paquete a la vez: `exports` para que otros módulos llamen directamente a tus clases de dominio, y `opens` (normalmente acotado con `to`) para que el framework de serialización o el ORM pueda además inspeccionarlas por reflexión. Un módulo completo puede además declararse `open module com.miapp.dominio { ... }`, lo que abre todos sus paquetes a reflexión sin necesidad de una línea `opens` por paquete — una opción más simple pero que renuncia a la encapsulación fuerte del Tema 1 para todo el módulo, útil sobre todo durante una migración incremental (Tema 2) mientras terminas de identificar exactamente qué paquetes necesitan reflexión.

**Analogía:** `exports` es como dar a alguien una llave para entrar por la puerta principal y usar las habitaciones normalmente; `opens` es un permiso aparte para que un inspector concreto pueda además revisar los cajones y closets sin necesidad de pedirte permiso cada vez — son dos autorizaciones independientes, y dar la llave de la puerta no incluye automáticamente el permiso de inspección.

**¿Por qué es importante?** La mayoría de los frameworks Java del ecosistema real (inyección de dependencias, serialización JSON, ORMs) dependen de reflexión profunda sobre tus propias clases; olvidar `opens` es la causa más común de que una aplicación que compila perfectamente falle en tiempo de ejecución al integrarla con JPMS.

**Código del ejemplo:**

```java
module com.miapp.dominio {
    exports com.miapp.dominio;                                    // llamada directa desde otros módulos
    opens com.miapp.dominio to com.fasterxml.jackson.databind;     // reflexión, solo para Jackson
}
```

#### Construcción RutaFlow: abrir solo para Jackson

En `rutaflow-domain/src/main/java/module-info.java`, añade `opens com.rutaflow.domain.dto to com.fasterxml.jackson.databind;` y conserva el paquete sin exportar si ningún consumidor lo llama directamente. Deserializa `GuiaDto` desde `rutaflow-cli` y ejecuta la aplicación por module-path; el resultado esperado es un objeto válido sin abrir todo el módulo.

Elimina `opens` y reproduce `InaccessibleObjectException`; lee el módulo solicitante y el paquete bloqueado en el mensaje. Evita `open module` como solución permanente y restaura la apertura calificada. Como modificación, intenta acceder directamente al DTO desde otro módulo para comprobar que reflexión y API pública siguen siendo permisos distintos. RutaFlow limita la superficie accesible al framework concreto.

---


## Construcción guiada del capítulo

**Objetivo del laboratorio:** dividir un proyecto en al menos dos módulos JPMS con dependencias explícitas.

**Requisitos previos:** Módulos 0-9 completados.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Crear módulos `core` y `app` con sus `module-info.java` | Ver Tema 1 | Declara la identidad de cada módulo |
| 2 | Declarar `exports` en `core` para un paquete específico | Ver Tema 1 | Verifica que un paquete no exportado es inaccesible |
| 3 | Declarar `requires` en `app` hacia `core` | Ver Tema 1 | Dependencia explícita entre módulos |
| 4 | Documentar la migración incremental de un proyecto legacy | Ver Tema 2 | Módulos "hoja" primero |

**Verificación:** el laboratorio se considera exitoso si un paquete de `core` no exportado explícitamente resulta inaccesible desde `app`, incluso si sus clases son `public`, y si `app` compila correctamente su dependencia declarada hacia `core`.

**Errores comunes y soluciones**

- **Exportar todos los paquetes de un módulo sin necesidad.** Exporta únicamente los paquetes que realmente forman parte de la API pública del módulo.
- **Aplicar JPMS a un proyecto pequeño sin necesidad real.** Evalúa primero si el beneficio de límites arquitectónicos verificados justifica la ceremonia adicional.
- **Intentar migrar todo el proyecto a JPMS de una sola vez.** Migra incrementalmente comenzando por los módulos "hoja".
- **`InaccessibleObjectException` en tiempo de ejecución con un framework (Jackson, Hibernate, Spring) aunque el proyecto compile bien.** Al paquete le falta una declaración `opens` (además de `exports`): la reflexión que usan estos frameworks internamente necesita ese permiso adicional, independiente del acceso normal de compilación.

---
