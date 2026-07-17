# Módulo 10: Módulos (JPMS) y proyectos grandes

## Sílabo

**Objetivo general**

Organizar aplicaciones grandes con límites explícitos entre módulos usando el Java Platform Module System (JPMS), entendiendo su encapsulación fuerte y cuándo realmente aporta valor.

**Objetivos específicos**

1. Crear módulos JPMS con sus respectivos `module-info.java`.
2. Declarar `exports` para exponer selectivamente paquetes específicos.
3. Declarar `requires` para dependencias explícitas entre módulos.
4. Explicar cómo migrar incrementalmente un proyecto legacy sin módulos.
5. Evaluar cuándo JPMS aporta valor frente a cuándo es complejidad innecesaria.

**Contenido**

- `module-info.java`.
- Encapsulación fuerte entre módulos.
- Migración de proyectos legacy sin módulos.
- Cuándo JPMS realmente aporta valor.
- `opens` para acceso reflexivo controlado de frameworks.

**Evaluación**

Proyecto dividido en al menos dos módulos JPMS con dependencias explícitas, más tres ejercicios de evaluación.

---

## Contenido teórico

### Tema 1: module-info.java y encapsulación fuerte

**Conceptos clave:** `exports`, `requires`, encapsulación más allá de `public`.

`module-info.java` es el archivo descriptor que declara explícitamente la identidad de un módulo JPMS y sus relaciones con otros módulos: `module com.miapp.core { exports com.miapp.core.dominio; }` declara que el módulo `com.miapp.core` existe, y que únicamente el paquete `com.miapp.core.dominio` está disponible para ser usado por otros módulos (`exports`), mientras cualquier otro paquete de ese mismo módulo que no aparezca explícitamente en una declaración `exports` permanece completamente inaccesible desde fuera del módulo, sin importar que sus clases individuales estén marcadas como `public`.

Esta es la encapsulación fuerte que JPMS agrega, algo que los modificadores de acceso tradicionales de Java (Módulo 1) no ofrecían por sí solos antes de la existencia de módulos: antes de JPMS, marcar una clase como `public` la hacía accesible desde absolutamente cualquier otro código presente en el classpath completo de la aplicación, sin ninguna forma de restringir ese acceso a nivel más amplio que la propia clase o paquete individual; con JPMS, un paquete completo que contenga clases `public` puede permanecer completamente inaccesible desde fuera de su propio módulo simplemente por no estar listado en `exports`, una capa adicional de encapsulación a nivel de módulo que complementa (sin reemplazar) los modificadores de acceso tradicionales a nivel de clase.

**Analogía:** antes de JPMS, marcar algo como `public` era como dejar una puerta sin ninguna cerradura en absoluto, accesible desde cualquier parte del edificio completo; con JPMS, `exports` es como decidir explícitamente cuáles puertas específicas de un departamento completo del edificio (el módulo) tienen realmente una entrada visible hacia el resto del edificio, mientras el resto de las puertas de ese mismo departamento, aunque técnicamente sin cerradura interna, simplemente no tienen ningún acceso visible desde fuera del propio departamento.

**¿Por qué es importante?** JPMS agrega encapsulación fuerte a nivel de módulo, más allá de lo que los modificadores de acceso tradicionales `public`/`private` ofrecían por sí solos, permitiendo ocultar paquetes completos (incluso con clases `public`) del resto de la aplicación.

**Diagrama:**

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

### Tema 2: Migración incremental y cuándo JPMS aporta valor

**Conceptos clave:** módulos "hoja" primero, `requires transitive`, costo/beneficio.

Migrar un proyecto legacy grande sin módulos hacia JPMS es un proceso incremental, no un cambio de una sola vez: comenzar por los módulos "hoja" del árbol de dependencias (aquellos sin dependencias internas propias hacia otras partes del mismo proyecto) agregándoles su `module-info.java` correspondiente, y subir progresivamente en el árbol de dependencias agregando módulos hasta cubrir eventualmente el proyecto completo, un enfoque que permite verificar en cada paso que la migración parcial hasta ese punto sigue funcionando correctamente, en vez de intentar convertir todo el proyecto de una sola vez con un riesgo mucho mayor de introducir errores difíciles de aislar.

`requires transitive` se usa cuando un módulo expone en su propia API pública tipos que en realidad provienen de otro módulo del que depende (por ejemplo, si un método público de `api` devuelve un tipo definido en `core`), garantizando que cualquier módulo que dependa de `api` también obtenga automáticamente acceso a `core` sin necesidad de declarar esa dependencia por separado explícitamente. En cuanto a cuándo JPMS aporta valor real: para bibliotecas grandes y de larga vida con muchos consumidores externos (como el propio JDK, que usa JPMS internamente desde Java 9), o para sistemas con muchos equipos distintos compartiendo una misma base de código grande, JPMS impone límites arquitectónicos verificados por el compilador que previenen dependencias no deseadas entre partes del sistema; para un proyecto pequeño o un microservicio independiente con pocos módulos internos, la ceremonia adicional de gestionar `module-info.java` en cada módulo suele ser complejidad sin un beneficio proporcional real.

**Analogía:** migrar a JPMS incrementalmente es como renovar la instalación eléctrica de un edificio habitación por habitación, comenzando por las habitaciones que no dependen de ninguna otra, en vez de cortar la electricidad de todo el edificio simultáneamente para una renovación completa de una sola vez; evaluar si JPMS aporta valor es como decidir si vale la pena instalar un sistema de seguridad departamental completo en una casa pequeña habitada por una única familia, frente a un edificio grande compartido por muchas familias distintas donde esos límites de seguridad claramente sí aportan valor real.

**¿Por qué es importante?** Migrar incrementalmente desde los módulos "hoja" acota el riesgo de cada paso de la migración; evaluar correctamente cuándo JPMS aporta valor real evita imponer su ceremonia adicional en proyectos donde esos límites arquitectónicos no son genuinamente necesarios.

**Diagrama:**

```
Paso 1: módulos "hoja" (sin dependencias internas) obtienen su module-info.java primero
Paso 2: sube en el árbol de dependencias agregando módulos hasta cubrir todo el proyecto
requires transitive: cuando un módulo expone tipos de otro módulo en su propia API pública
```

### Tema 3: `opens` para acceso reflexivo controlado de frameworks

**Conceptos clave:** `exports` da acceso en tiempo de compilación, `opens` da acceso reflexivo en tiempo de ejecución; son declaraciones independientes.

`exports` resuelve el acceso normal de compilación y llamada directa entre módulos, pero no basta para frameworks como Spring, Jackson o Hibernate, que necesitan inspeccionar y construir objetos de tus propias clases mediante reflexión (leer campos privados, invocar constructores sin argumentos, anotar campos) sin que tu código llame a esos frameworks directamente. Si un paquete solo está `exports`, la reflexión profunda de esos frameworks sobre tus clases falla en tiempo de ejecución con `InaccessibleObjectException`, aunque el mismo paquete compile y funcione perfectamente con llamadas directas de código. `opens com.miapp.dominio;` concede ese acceso reflexivo adicional; `opens com.miapp.dominio to com.fasterxml.jackson.databind;` lo restringe a un módulo específico en vez de abrirlo a cualquiera, igual que `exports ... to ...` restringe el acceso de compilación a módulos concretos.

Es habitual necesitar ambas declaraciones sobre el mismo paquete a la vez: `exports` para que otros módulos llamen directamente a tus clases de dominio, y `opens` (normalmente acotado con `to`) para que el framework de serialización o el ORM pueda además inspeccionarlas por reflexión. Un módulo completo puede además declararse `open module com.miapp.dominio { ... }`, lo que abre todos sus paquetes a reflexión sin necesidad de una línea `opens` por paquete — una opción más simple pero que renuncia a la encapsulación fuerte del Tema 1 para todo el módulo, útil sobre todo durante una migración incremental (Tema 2) mientras terminas de identificar exactamente qué paquetes necesitan reflexión.

**Analogía:** `exports` es como dar a alguien una llave para entrar por la puerta principal y usar las habitaciones normalmente; `opens` es un permiso aparte para que un inspector concreto pueda además revisar los cajones y closets sin necesidad de pedirte permiso cada vez — son dos autorizaciones independientes, y dar la llave de la puerta no incluye automáticamente el permiso de inspección.

**¿Por qué es importante?** La mayoría de los frameworks Java del ecosistema real (inyección de dependencias, serialización JSON, ORMs) dependen de reflexión profunda sobre tus propias clases; olvidar `opens` es la causa más común de que una aplicación que compila perfectamente falle en tiempo de ejecución al integrarla con JPMS.

**Diagrama:**

```java
module com.miapp.dominio {
    exports com.miapp.dominio;                                    // llamada directa desde otros módulos
    opens com.miapp.dominio to com.fasterxml.jackson.databind;     // reflexión, solo para Jackson
}
```

---

## Laboratorio práctico

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

## Ejercicios de evaluación

### Ejercicio 1: Encapsulación adicional de JPMS

**Enunciado:** ¿qué encapsulación adicional da JPMS que los modificadores `public`/`private` de Java no daban antes?

**Solución esperada:** JPMS permite ocultar paquetes completos (incluso con clases marcadas como `public`) del resto de la aplicación, simplemente no incluyéndolos en la declaración `exports` del módulo; antes de JPMS, cualquier clase `public` era accesible desde cualquier otro código en el classpath completo, sin ninguna forma de restringir ese acceso a nivel de paquete o módulo completo.

**Criterios de éxito:**
- Explica correctamente la ocultación de paquetes completos vía `exports` como la encapsulación adicional de JPMS.

### Ejercicio 2: Cuándo JPMS aporta valor

**Enunciado:** ¿en qué tipo de proyecto JPMS realmente aporta valor frente a uno donde es complejidad innecesaria?

**Solución esperada:** JPMS aporta valor real en bibliotecas grandes y de larga vida con muchos consumidores externos, o en sistemas grandes con muchos equipos compartiendo una misma base de código, donde los límites arquitectónicos verificados por el compilador previenen dependencias no deseadas; en un proyecto pequeño o un microservicio independiente, la ceremonia adicional de gestionar módulos suele ser complejidad sin beneficio proporcional.

**Criterios de éxito:**
- Distingue correctamente el caso de proyecto grande/biblioteca de larga vida (valor real) del caso pequeño (complejidad innecesaria).

### Ejercicio 3: requires transitive

**Enunciado:** ¿cuándo es necesario usar `requires transitive` en vez de un `requires` simple?

**Solución esperada:** cuando un módulo expone en su propia API pública tipos que en realidad provienen de otro módulo del que depende, `requires transitive` garantiza que cualquier módulo que dependa del primero también obtenga automáticamente acceso al segundo, sin necesidad de declarar esa dependencia adicional por separado explícitamente.

**Criterios de éxito:**
- Explica correctamente el caso de exposición de tipos de un módulo dependiente en la API pública propia como razón para usar `requires transitive`.

### Ejercicio 4: exports vs. opens

**Enunciado:** tu módulo `exports com.miapp.dominio;` y compila sin errores, pero al integrar Jackson para serializar esas clases a JSON, la aplicación falla en tiempo de ejecución con `InaccessibleObjectException`. ¿Qué falta, y por qué `exports` no fue suficiente?

**Solución esperada:** falta declarar `opens com.miapp.dominio to com.fasterxml.jackson.databind;` (o `opens` sin `to` si se acepta abrirlo a cualquier módulo). `exports` solo concede acceso de compilación y llamada directa entre módulos; el acceso reflexivo que Jackson necesita para inspeccionar y construir instancias de esas clases es una autorización independiente que solo otorga `opens`.

**Criterios de éxito:**
- Identifica `opens` (no una variante de `exports`) como la declaración faltante.
- Explica que `exports` y `opens` conceden dos tipos de acceso distintos (compilación/llamada directa vs. reflexión).

---

## Resumen del módulo

**Puntos clave**

- `module-info.java` declara la identidad de un módulo y sus relaciones (`exports`, `requires`) con otros módulos.
- JPMS agrega encapsulación fuerte a nivel de módulo, más allá de los modificadores de acceso tradicionales.
- La migración incremental comienza por los módulos "hoja" y sube progresivamente en el árbol de dependencias.
- JPMS aporta valor real en proyectos grandes de larga vida, y suele ser complejidad innecesaria en proyectos pequeños.
- `opens` concede acceso reflexivo a frameworks, independiente y adicional al acceso de compilación que da `exports`.

**Conceptos aprendidos**

- `module-info.java`, `exports` y `requires`.
- Encapsulación fuerte entre módulos.
- Migración incremental de proyectos legacy.
- `opens` para acceso reflexivo de frameworks (Jackson, Hibernate, Spring).
- Criterios para decidir cuándo JPMS aporta valor.

**Próximos pasos**

En el Módulo 11 aprenderás la JVM interna: recolectores de basura, profiling con JFR, y JIT compilation.

**Recursos adicionales**

- Documentación oficial de Java (docs.oracle.com/en/java): "The Java Platform Module System".
