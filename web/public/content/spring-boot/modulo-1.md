# Módulo 1: Spring Boot CLI y estructura de proyecto


## Aprende construyendo

### Tema 1: Spring Initializr y starters

#### Paso 1 · Objetivo y preparación
Al finalizar podrás aplicar este tema desde cero. Prerrequisitos: JDK 21, Maven y un editor. Comprueba `java --version` y `mvn --version`.

#### Paso 2 · Contexto y caso real
En un caso real de entregas, el servicio necesita dependencias, configuración y capas separadas para cambiar de ambiente sin modificar el código.

#### Paso 3 · Teoría, modelo mental y analogía
Spring Boot automatiza configuración razonable, pero cada starter añade responsabilidades y debe revisarse. YAML y properties representan configuración tipada; los perfiles seleccionan valores por ambiente. La analogía es preparar una ruta con un vehículo y combustible adecuados: el destino no cambia, los recursos sí.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-spring-m1
cd ejemplo-spring-m1
curl -fsSL https://start.spring.io/starter.zip -d dependencies=web -d javaVersion=21 -o app.zip
unzip app.zip
mvn spring-boot:run
```
Crea `src/main/resources/application.yml` y un endpoint `/health`; explica qué starter, propiedad y capa intervienen.

#### Paso 5 · Práctica guiada
Pista: ejecuta `mvn spring-boot:run`, consulta `curl http://localhost:8080/health`, cambia una propiedad para provocar un fallo deliberado y corrígela. Resultado esperado: respuesta HTTP 200.

#### Paso 6 · Práctica independiente
Crea perfiles `local` y `test`, mueve el puerto y el nivel de logs, y demuestra qué archivo gana cuando ambos existen.

#### Paso 7 · Cierre y evidencia
Entrega estructura, comandos, respuesta y log; como siguiente paso añade una prueba de contexto. Errores comunes: mezclar secretos en YAML, duplicar propiedades, crear starters innecesarios y acoplar capas. Fuentes oficiales: https://docs.spring.io/spring-boot/docs/current/reference/html/ y https://start.spring.io/.
**¿Por qué es importante?** Porque una configuración reproducible evita que el mismo código funcione solo en el ordenador del autor.
**Evidencia de aprendizaje:** conserva la salida de Maven, el endpoint y la comparación de perfiles.
**Conceptos clave:** dependencias preconfiguradas por starter, generación de la estructura base.

[start.spring.io](https://start.spring.io) genera la estructura base de un proyecto Spring Boot a partir de un conjunto de starters seleccionados (`web`, `data-jpa`, `security`, `postgresql`, etc.), donde cada starter es en realidad un conjunto curado de dependencias preconfiguradas que trabajan juntas de forma coherente para un propósito específico: `spring-boot-starter-web` trae todo lo necesario para exponer APIs HTTP (Módulo 0), `spring-boot-starter-data-jpa` trae Hibernate y la infraestructura de Spring Data para persistencia, sin que el desarrollador tenga que investigar y ensamblar manualmente cada dependencia individual compatible entre sí (una tarea considerablemente más propensa a errores de versión incompatible que confiar en un starter ya curado y probado para esa combinación específica).

Esta curación de dependencias compatibles es precisamente el valor añadido de los starters sobre simplemente agregar dependencias sueltas manualmente: Spring Boot gestiona internamente qué versiones específicas de cada dependencia individual son compatibles entre sí para una versión dada de Spring Boot, eliminando la necesidad de que el desarrollador investigue y resuelva manualmente esa matriz de compatibilidad de versiones, un problema conocido como "dependency hell" que Spring Boot resuelve de fábrica mediante su gestión centralizada de versiones (el "Bill of Materials" o BOM de Spring Boot).

**Analogía:** un starter es como un kit de herramientas preensamblado para un propósito específico (por ejemplo, un kit completo de electricista), donde todas las herramientas incluidas ya están verificadas para trabajar bien juntas, en vez de tener que comprar cada herramienta individual por separado y verificar manualmente su compatibilidad entre sí.

**¿Por qué es importante?** Los starters de Spring Boot eliminan el "dependency hell" de resolver manualmente qué versiones de cada dependencia individual son compatibles entre sí, ofreciendo conjuntos curados y probados de dependencias para propósitos específicos comunes.

**Diagrama:**

```
start.spring.io: elige starters (web, data-jpa, security, postgresql) → 
genera estructura base con dependencias preconfiguradas y compatibles entre sí
```

### Tema 2: application.yml vs application.properties

#### Paso 1 · Objetivo y preparación
Al finalizar podrás aplicar este tema desde cero. Prerrequisitos: JDK 21, Maven y un editor. Comprueba `java --version` y `mvn --version`.

#### Paso 2 · Contexto y caso real
En un caso real de entregas, el servicio necesita dependencias, configuración y capas separadas para cambiar de ambiente sin modificar el código.

#### Paso 3 · Teoría, modelo mental y analogía
Spring Boot automatiza configuración razonable, pero cada starter añade responsabilidades y debe revisarse. YAML y properties representan configuración tipada; los perfiles seleccionan valores por ambiente. La analogía es preparar una ruta con un vehículo y combustible adecuados: el destino no cambia, los recursos sí.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-spring-m1
cd ejemplo-spring-m1
curl -fsSL https://start.spring.io/starter.zip -d dependencies=web -d javaVersion=21 -o app.zip
unzip app.zip
mvn spring-boot:run
```
Crea `src/main/resources/application.yml` y un endpoint `/health`; explica qué starter, propiedad y capa intervienen.

#### Paso 5 · Práctica guiada
Pista: ejecuta `mvn spring-boot:run`, consulta `curl http://localhost:8080/health`, cambia una propiedad para provocar un fallo deliberado y corrígela. Resultado esperado: respuesta HTTP 200.

#### Paso 6 · Práctica independiente
Crea perfiles `local` y `test`, mueve el puerto y el nivel de logs, y demuestra qué archivo gana cuando ambos existen.

#### Paso 7 · Cierre y evidencia
Entrega estructura, comandos, respuesta y log; como siguiente paso añade una prueba de contexto. Errores comunes: mezclar secretos en YAML, duplicar propiedades, crear starters innecesarios y acoplar capas. Fuentes oficiales: https://docs.spring.io/spring-boot/docs/current/reference/html/ y https://start.spring.io/.
**¿Por qué es importante?** Porque una configuración reproducible evita que el mismo código funcione solo en el ordenador del autor.
**Evidencia de aprendizaje:** conserva la salida de Maven, el endpoint y la comparación de perfiles.
**Conceptos clave:** legibilidad para configuración anidada, jerarquía visual.

`application.properties` expresa configuración como pares clave-valor planos con notación de puntos (`spring.datasource.url=jdbc:postgresql://localhost:5432/app`), un formato simple pero que se vuelve visualmente repetitivo cuando existe configuración anidada extensa, donde el mismo prefijo se repite en cada línea sin ninguna indicación visual de jerarquía; `application.yml` expresa la misma configuración usando indentación jerárquica (`spring: datasource: url: jdbc:postgresql://localhost:5432/app`), agrupando visualmente las claves relacionadas bajo su nodo padre común, generalmente más legible cuanto más profunda y extensa es la configuración anidada del proyecto.

Ambos formatos son completamente válidos y Spring Boot los soporta indistintamente (incluso es posible mezclar ambos en el mismo proyecto, aunque no es una práctica recomendada por claridad), siendo la elección entre uno u otro principalmente una cuestión de preferencia de legibilidad del equipo, sin ninguna diferencia funcional real en cuanto a qué configuración es posible expresar con cada formato.

**Analogía:** `application.properties` es como una lista plana de instrucciones con prefijos repetidos en cada línea; `application.yml` es como un índice jerárquico con subcategorías anidadas visualmente bajo su categoría padre, generalmente más fácil de navegar visualmente cuanto más profunda es la jerarquía de información representada.

**¿Por qué es importante?** YAML mejora la legibilidad visual de configuración anidada extensa mediante indentación jerárquica, aunque ambos formatos sean funcionalmente equivalentes y completamente soportados por Spring Boot.

**Configuración del ejemplo:**

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/app
server:
  port: 8080
```

### Tema 3: Perfiles y estructura por capas

#### Paso 1 · Objetivo y preparación
Al finalizar podrás aplicar este tema desde cero. Prerrequisitos: JDK 21, Maven y un editor. Comprueba `java --version` y `mvn --version`.

#### Paso 2 · Contexto y caso real
En un caso real de entregas, el servicio necesita dependencias, configuración y capas separadas para cambiar de ambiente sin modificar el código.

#### Paso 3 · Teoría, modelo mental y analogía
Spring Boot automatiza configuración razonable, pero cada starter añade responsabilidades y debe revisarse. YAML y properties representan configuración tipada; los perfiles seleccionan valores por ambiente. La analogía es preparar una ruta con un vehículo y combustible adecuados: el destino no cambia, los recursos sí.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-spring-m1
cd ejemplo-spring-m1
curl -fsSL https://start.spring.io/starter.zip -d dependencies=web -d javaVersion=21 -o app.zip
unzip app.zip
mvn spring-boot:run
```
Crea `src/main/resources/application.yml` y un endpoint `/health`; explica qué starter, propiedad y capa intervienen.

#### Paso 5 · Práctica guiada
Pista: ejecuta `mvn spring-boot:run`, consulta `curl http://localhost:8080/health`, cambia una propiedad para provocar un fallo deliberado y corrígela. Resultado esperado: respuesta HTTP 200.

#### Paso 6 · Práctica independiente
Crea perfiles `local` y `test`, mueve el puerto y el nivel de logs, y demuestra qué archivo gana cuando ambos existen.

#### Paso 7 · Cierre y evidencia
Entrega estructura, comandos, respuesta y log; como siguiente paso añade una prueba de contexto. Errores comunes: mezclar secretos en YAML, duplicar propiedades, crear starters innecesarios y acoplar capas. Fuentes oficiales: https://docs.spring.io/spring-boot/docs/current/reference/html/ y https://start.spring.io/.
**¿Por qué es importante?** Porque una configuración reproducible evita que el mismo código funcione solo en el ordenador del autor.
**Evidencia de aprendizaje:** conserva la salida de Maven, el endpoint y la comparación de perfiles.
**Conceptos clave:** configuración específica por entorno, separación controller/service/repository.

Un perfil (`application-dev.yml`, `application-prod.yml`) sobreescribe únicamente los valores específicos que declara explícitamente, manteniendo intacto el resto de la configuración base definida en `application.yml`, permitiendo que valores como la URL de la base de datos difieran entre entornos (desarrollo apuntando a una base local, producción apuntando a la base real) sin necesidad de mantener archivos de configuración completos y duplicados por entorno; `java -jar app.jar --spring.profiles.active=dev` activa el perfil correspondiente en el momento del arranque, seleccionando qué configuración específica de entorno aplicar sin necesidad de recompilar la aplicación para cada entorno distinto.

Externalizar configuración por perfil, en vez de mantener un único `application.properties` con valores fijos hardcodeados, permite desplegar exactamente el mismo artefacto compilado en múltiples entornos distintos, simplemente variando qué perfil se activa en cada despliegue específico, una práctica alineada con el principio de "build once, deploy many" que evita el riesgo de que el artefacto probado en un entorno sea sutilmente distinto al que efectivamente se despliega en producción. La estructura por capas (`controller/` recibiendo peticiones HTTP y traduciendo hacia/desde DTOs, `service/` con la lógica de negocio sin ningún conocimiento de HTTP, `repository/` con el acceso a datos vía Spring Data JPA) establece responsabilidades claramente delimitadas: el `controller` no debería contener lógica de negocio, y el `service` no debería tener ningún conocimiento de detalles HTTP como códigos de estado o headers, cada capa dependiendo únicamente de la capa inferior sin conocer detalles de la capa superior que la invoca.

**Analogía:** los perfiles son como distintos conjuntos de ajustes preconfigurados para el mismo dispositivo, seleccionables según el contexto de uso, sin tener que reconfigurar manualmente cada ajuste individual cada vez que cambia el contexto; la estructura por capas es como una cadena de producción donde cada estación tiene una responsabilidad claramente delimitada y no necesita conocer los detalles internos de las demás estaciones, solo qué recibe y qué debe entregar.

**¿Por qué es importante?** Externalizar configuración por perfil permite desplegar el mismo artefacto en múltiples entornos variando solo qué perfil se activa; la estructura por capas delimita claramente qué responsabilidad tiene (y no tiene) cada capa del proyecto.

**Configuración del ejemplo:**

```yaml
# application-dev.yml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/app_dev
```
```bash
java -jar app.jar --spring.profiles.active=dev
```
```
src/main/java/com/miapp/
  controller/   ← recibe HTTP, traduce a/desde DTOs
  service/      ← lógica de negocio, sin saber nada de HTTP
  repository/   ← acceso a datos vía Spring Data JPA
  dto/
  entity/
```

---


## Laboratorio práctico

**Objetivo del laboratorio:** generar un proyecto Spring Boot con perfiles dev/prod y estructura por capas.

**Requisitos previos:** Módulo 0 completado.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Generar el proyecto con Spring Initializr | web, data-jpa, postgresql | Verifica las dependencias generadas |
| 2 | Convertir a `application.yml` | Ver Tema 2 | Compara la legibilidad |
| 3 | Crear `application-dev.yml`/`application-prod.yml` | Ver Tema 3 | Arranca con `--spring.profiles.active=dev` |
| 4 | Organizar en paquetes por capa | Ver Tema 3 | `controller/`, `service/`, `repository/`, `dto/` |
| 5 | Verificar el perfil activo | `/actuator/env` | Si está habilitado |

**Verificación:** el laboratorio se considera exitoso si el proyecto arranca correctamente con cada perfil aplicando su configuración específica, y si la estructura por capas separa claramente controller/service/repository sin lógica de negocio filtrada en el controller.

**Errores comunes y soluciones**

- **Hardcodear valores de configuración distintos por entorno en el código.** Usa perfiles para externalizar esa configuración.
- **Poner lógica de negocio en el controller.** El controller solo debe traducir HTTP hacia/desde DTOs, delegando la lógica al service.
- **Mezclar `.properties` y `.yml` sin necesidad.** Elige un formato y sé consistente en todo el proyecto.

---
