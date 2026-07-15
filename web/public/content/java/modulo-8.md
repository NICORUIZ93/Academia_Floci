# Módulo 8: Build tools — Maven y Gradle

## Sílabo

**Objetivo general**

Gestionar dependencias y el ciclo de vida de build de un proyecto Java real con Maven y Gradle, entendiendo scopes de dependencias y estructuras multi-módulo.

**Objetivos específicos**

1. Crear proyectos con Maven y con Gradle, comparando su estructura.
2. Agregar una dependencia externa en ambos formatos.
3. Ejecutar el ciclo de vida completo de build de Maven.
4. Configurar un scope de dependencia exclusivo para pruebas.
5. Estructurar un proyecto multi-módulo.

**Contenido**

- `pom.xml` vs `build.gradle.kts`.
- Ciclo de vida de build.
- Gestión de dependencias y scopes.
- Multi-módulo.

**Evaluación**

Proyecto multi-módulo con Gradle (o Maven) y dependencias bien acotadas, más tres ejercicios de evaluación.

---

## Contenido teórico

### Tema 1: pom.xml vs build.gradle.kts

**Conceptos clave:** declaración de dependencias, XML declarativo frente a DSL de Kotlin.

Maven declara dependencias en un archivo `pom.xml` estructurado en XML: `<dependency><groupId>com.fasterxml.jackson.core</groupId><artifactId>jackson-databind</artifactId><version>2.17.0</version></dependency>`, un formato completamente declarativo donde el orden de las secciones sigue una convención estricta impuesta por Maven, con relativamente poca flexibilidad para lógica de configuración condicional o dinámica dentro del propio archivo de configuración.

Gradle, usando su Kotlin DSL, declara las mismas dependencias con una sintaxis considerablemente más concisa (`implementation("com.fasterxml.jackson.core:jackson-databind:2.17.0")`) y, al ser efectivamente código Kotlin ejecutable (no solo datos declarativos estáticos), permite expresar lógica de configuración condicional o programática cuando resulta necesaria (por ejemplo, aplicar cierta configuración solo bajo ciertas condiciones específicas del entorno de build), una flexibilidad que el XML puramente declarativo de Maven no ofrece con la misma naturalidad, aunque a cambio de una curva de aprendizaje inicial ligeramente mayor para quien no está familiarizado con Kotlin como lenguaje de configuración.

**Analogía:** `pom.xml` es como un formulario impreso con casillas fijas y un orden estricto predefinido, apropiado para casos estándar pero rígido ante necesidades especiales; el DSL de Gradle es como una hoja de cálculo programable donde se pueden escribir fórmulas y lógica condicional según se necesite, ofreciendo mayor flexibilidad a costa de requerir familiaridad con su sintaxis de programación.

**¿Por qué es importante?** Gradle (Kotlin DSL) ofrece mayor flexibilidad para lógica de configuración condicional que el XML puramente declarativo de Maven, a cambio de una curva de aprendizaje ligeramente mayor y menor previsibilidad estructural que la rigidez estándar de Maven.

**Diagrama:**

```xml
<dependencies>
  <dependency>
    <groupId>com.fasterxml.jackson.core</groupId>
    <artifactId>jackson-databind</artifactId>
    <version>2.17.0</version>
  </dependency>
</dependencies>
```
```kotlin
dependencies {
    implementation("com.fasterxml.jackson.core:jackson-databind:2.17.0")
    testImplementation("org.junit.jupiter:junit-jupiter:5.10.0")
}
```

### Tema 2: Ciclo de vida de build y scopes

**Conceptos clave:** fases secuenciales, `mvn clean compile test package`, dependencias por scope.

Maven define un ciclo de vida de build compuesto por fases secuenciales estándar y predefinidas: `mvn clean compile test package` ejecuta, en orden, la limpieza de artefactos de builds anteriores, la compilación del código fuente, la ejecución de las pruebas, y el empaquetado del resultado final (típicamente un `.jar`), donde cada fase posterior implica automáticamente la ejecución de todas las fases anteriores necesarias (invocar `package` directamente ejecuta también `compile` y `test` primero, sin necesidad de invocarlas explícitamente por separado).

Las dependencias declaradas para un proyecto pueden restringirse a un scope específico según en qué momento del ciclo de vida son necesarias: `testImplementation` en Gradle (o `<scope>test</scope>` en Maven) declara que una dependencia (como JUnit) es necesaria únicamente para compilar y ejecutar las pruebas, no para el artefacto final de producción, garantizando que esa dependencia no se incluya en el `.jar` final que efectivamente se despliega, reduciendo su tamaño y evitando exponer dependencias de testing (que podrían tener sus propias vulnerabilidades de seguridad o simplemente peso innecesario) en el artefacto que efectivamente llega a producción.

**Analogía:** el ciclo de vida de build es como una línea de producción con etapas secuenciales obligatorias (limpiar, ensamblar, probar, empaquetar), donde solicitar el producto empaquetado final automáticamente implica que todas las etapas anteriores necesarias ya se completaron; un scope de dependencia es como especificar que cierta herramienta solo se necesita durante el control de calidad interno de la línea de producción, sin que esa herramienta específica se incluya dentro de la caja final que efectivamente se envía al cliente.

**¿Por qué es importante?** Separar dependencias por scope (compile, test, runtime) evita incluir dependencias innecesarias en el artefacto final de producción, reduciendo su tamaño y su superficie de exposición a vulnerabilidades no relevantes para producción.

**Diagrama:**

```bash
mvn clean compile test package   # ciclo de vida: limpia, compila, prueba, empaqueta
```

### Tema 3: Proyectos multi-módulo

**Conceptos clave:** separación de responsabilidades entre módulos, dependencias explícitas entre ellos.

Un proyecto multi-módulo divide una aplicación grande en subproyectos independientes que se compilan como parte de un mismo build coordinado, pero con límites explícitos entre ellos: un módulo `core` conteniendo la lógica de dominio central, y un módulo `api` que depende de `core` para exponer esa lógica a través de HTTP, con la configuración raíz compartida (`build.gradle.kts` en la raíz del proyecto) coordinando cómo se construyen ambos módulos juntos, mientras cada módulo mantiene su propio conjunto de dependencias específicas, declaradas explícitamente según lo que ese módulo particular efectivamente necesita, sin heredar automáticamente dependencias de otros módulos que no declaró explícitamente requerir.

Esta estructura refleja a nivel de proyecto completo el mismo principio de límites explícitos estudiado para JPMS en el Módulo 10: separar `core` de `api` en módulos de build distintos (no solo en paquetes distintos dentro de un único módulo) impone una verificación adicional a nivel de herramienta de build de que `api` efectivamente declara su dependencia hacia `core` de forma explícita, y previene que código de `core` acceda accidentalmente a tipos definidos únicamente en `api` (una dirección de dependencia que normalmente no tendría sentido en una arquitectura por capas bien diseñada), dado que `core`, al no declarar una dependencia hacia `api`, simplemente no tiene acceso a su código en tiempo de compilación.

**Analogía:** un proyecto multi-módulo es como una empresa organizada en departamentos separados con presupuestos y recursos propios declarados explícitamente, donde un departamento que necesita recursos de otro debe solicitarlos formalmente (declarar la dependencia), en vez de que todos los departamentos compartan automáticamente todos los recursos de todos los demás sin ninguna distinción ni control.

**¿Por qué es importante?** Un proyecto multi-módulo impone límites explícitos de dependencia entre subproyectos, verificados por la herramienta de build, previniendo dependencias accidentales en direcciones no deseadas dentro de la arquitectura del proyecto.

**Diagrama:**

```
proyecto/
  core/        (lógica de dominio)
  api/         (depende de core, expone HTTP)
  build.gradle.kts (raíz, configuración compartida)
```

---

## Laboratorio práctico

**Objetivo del laboratorio:** construir un proyecto multi-módulo con Gradle (o Maven) con dependencias bien acotadas.

**Requisitos previos:** Módulos 0-7 completados.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Crear un proyecto con Maven y otro con Gradle | `mvn archetype:generate` / `gradle init` | Compara la estructura generada |
| 2 | Agregar una dependencia externa en ambos | Ver Tema 1 | Ejecuta el build en ambos casos |
| 3 | Ejecutar el ciclo de vida completo de Maven | `mvn clean compile test package` | Verifica el orden de las fases |
| 4 | Configurar un scope test-only | Ver Tema 2 | Verifica que no va al artefacto final |
| 5 | Estructurar un proyecto multi-módulo | Ver Tema 3 | `core` + `api` dependiente de `core` |

**Verificación:** el laboratorio se considera exitoso si el artefacto final de producción no incluye dependencias declaradas con scope de test, y si el módulo `api` compila correctamente su dependencia explícita hacia `core`.

**Errores comunes y soluciones**

- **Declarar una dependencia de testing sin el scope apropiado.** Usa `testImplementation`/`<scope>test</scope>` para que no se incluya en el artefacto final.
- **Permitir que un módulo `core` dependa de un módulo `api`.** Verifica que la dirección de dependencia refleje la arquitectura por capas deseada.
- **Confundir la sintaxis entre `pom.xml` y `build.gradle.kts`.** Practica ambos formatos hasta sentirte cómodo con sus diferencias sintácticas.

---

## Ejercicios de evaluación

### Ejercicio 1: Ventaja y desventaja de Gradle Kotlin DSL

**Enunciado:** ¿qué ventaja tiene Gradle (Kotlin DSL) sobre el XML de Maven, y qué desventaja?

**Solución esperada:** la ventaja es mayor flexibilidad para expresar lógica de configuración condicional o programática, al ser efectivamente código Kotlin ejecutable en vez de datos puramente declarativos; la desventaja es una curva de aprendizaje ligeramente mayor y menor previsibilidad estructural que la rigidez estándar y ampliamente conocida del XML de Maven.

**Criterios de éxito:**
- Menciona correctamente tanto la flexibilidad de Gradle como el costo de curva de aprendizaje/previsibilidad como desventaja.

### Ejercicio 2: Por qué separar dependencias por scope importa

**Enunciado:** ¿por qué separar dependencias por scope (compile, test, runtime) importa para el tamaño del artefacto final?

**Solución esperada:** separar por scope garantiza que dependencias necesarias únicamente para ciertas fases (como las pruebas) no se incluyan en el artefacto final de producción, reduciendo su tamaño y evitando exponer dependencias innecesarias (con su propia superficie de vulnerabilidades potenciales) en lo que efectivamente se despliega en producción.

**Criterios de éxito:**
- Explica correctamente la exclusión del artefacto final y la reducción de tamaño/superficie de exposición.

### Ejercicio 3: Límites de un proyecto multi-módulo

**Enunciado:** ¿qué garantiza un proyecto multi-módulo que un único proyecto con paquetes separados no garantiza?

**Solución esperada:** un proyecto multi-módulo impone límites de dependencia verificados por la herramienta de build entre subproyectos: un módulo debe declarar explícitamente su dependencia hacia otro para poder usar su código, previniendo que módulos accedan accidentalmente a código de otros módulos que no declararon necesitar, una verificación que simples paquetes separados dentro de un único proyecto no imponen de la misma forma.

**Criterios de éxito:**
- Explica correctamente la verificación de dependencias explícitas a nivel de build como la garantía adicional del multi-módulo.

---

## Resumen del módulo

**Puntos clave**

- Maven usa XML declarativo (`pom.xml`); Gradle usa un DSL de Kotlin más flexible pero con mayor curva de aprendizaje.
- El ciclo de vida de build ejecuta fases secuenciales, donde cada fase posterior implica las anteriores necesarias.
- Los scopes de dependencia (test, compile, runtime) evitan incluir dependencias innecesarias en el artefacto final.
- Un proyecto multi-módulo impone límites explícitos de dependencia entre subproyectos, verificados por la herramienta de build.

**Conceptos aprendidos**

- `pom.xml` vs `build.gradle.kts`.
- Ciclo de vida de build.
- Scopes de dependencias.
- Proyectos multi-módulo.

**Próximos pasos**

En el Módulo 9 aprenderás testing con JUnit 5 y Mockito: mocks, stubs, tests parametrizados y cobertura con JaCoCo.

**Recursos adicionales**

- Documentación oficial de Maven (maven.apache.org) y Gradle (docs.gradle.org).
