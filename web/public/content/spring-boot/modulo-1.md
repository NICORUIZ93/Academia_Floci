# Módulo 1: Spring Boot CLI y estructura de proyecto

## Sílabo

**Objetivo general**

Generar y entender la estructura estándar de un proyecto Spring Boot productivo, incluyendo starters, configuración en YAML, perfiles por entorno, y organización por capas.

**Objetivos específicos**

1. Generar un proyecto con Spring Initializr eligiendo starters apropiados.
2. Comparar `application.yml` con `application.properties`.
3. Configurar perfiles distintos para dev y prod.
4. Organizar un proyecto en capas controller/service/repository/dto.

**Contenido**

- Spring Initializr y starters.
- `application.yml` vs `application.properties`.
- Perfiles (dev/test/prod).
- Estructura por capas.

**Evaluación**

Proyecto Spring Boot con perfiles dev/prod y configuración externalizada, más tres ejercicios de evaluación.

---

## Aprende construyendo

### Tema 1: Spring Initializr y starters

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

- VMware/Broadcom, documentación de *Spring Framework* y *Spring Boot*.
- IETF, especificaciones HTTP y OAuth 2.0.
- OWASP Foundation, *Application Security Verification Standard*.
- ACM/IEEE-CS/AAAI, *Computer Science Curricula 2023*.
- IEEE Computer Society, *SWEBOK Guide V4.0*.

## Resumen del módulo

**Puntos clave**

- Los starters de Spring Initializr ofrecen conjuntos curados de dependencias compatibles entre sí para propósitos específicos.
- YAML mejora la legibilidad de configuración anidada extensa respecto a `.properties`, aunque ambos son funcionalmente equivalentes.
- Los perfiles permiten desplegar el mismo artefacto en múltiples entornos, variando solo la configuración activada.
- La estructura por capas (controller/service/repository) delimita claramente la responsabilidad de cada una.

**Conceptos aprendidos**

- Spring Initializr y starters.
- `application.yml` vs `application.properties`.
- Perfiles por entorno.
- Estructura por capas.

**Próximos pasos**

En el Módulo 2 aprenderás REST APIs con Spring Web: `@RestController`, DTOs, validación, y manejo centralizado de errores.

**Recursos adicionales**

- Documentación oficial de Spring Boot (docs.spring.io/spring-boot): "Externalized Configuration".
