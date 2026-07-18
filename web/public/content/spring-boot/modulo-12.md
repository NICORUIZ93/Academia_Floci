# Módulo 12: Proyecto integrador — microservicio productivo

## Sílabo

**Objetivo general**

Unir persistencia real con migraciones, seguridad con JWT, observabilidad expuesta desde el inicio, y tests de integración con Testcontainers en un microservicio Spring Boot productivo.

**Objetivos específicos**

1. Diseñar la arquitectura por capas del microservicio completo.
2. Implementar persistencia real con Spring Data JPA y migraciones versionadas.
3. Proteger endpoints sensibles con Spring Security y JWT.
4. Exponer Actuator con al menos una métrica de negocio custom.
5. Escribir tests de integración con Testcontainers cubriendo el flujo crítico.

**Contenido**

- Arquitectura por capas.
- Seguridad con JWT.
- Persistencia con migraciones.
- Tests de integración con Testcontainers.
- Qué sigue: Arquitectura Hexagonal/DDD, CQRS y Event Sourcing, OIDC/Keycloak.

**Evaluación**

Microservicio Spring Boot con auth, persistencia real, Actuator y tests de integración, más tres ejercicios de evaluación de cierre.

---

## Comienza desde cero: prepara este capítulo

Este recorrido parte de una carpeta vacía. Al finalizar tendrás **Microservicio Spring Boot con auth, persistencia real, Actuator y tests de integración, más tres ejercicios de evaluación de cierre.** No avances ejecutando comandos que no comprendes: primero identifica la entrada, la transformación y la evidencia que comprobará el resultado.

### 1. Comprueba las herramientas

Los comandos funcionan en macOS, Linux y WSL. En PowerShell usa el equivalente indicado por la herramienta.

```bash
java --version
javac --version
curl --version
```

Si un comando no existe, detente e instala esa herramienta desde su sitio oficial. Cierra y abre la terminal después de modificar `PATH`. Las versiones deben ser compatibles entre sí antes de crear archivos.

### 2. Crea o recupera el proyecto del track

```bash
mkdir -p academia-labs && cd academia-labs
curl -G https://start.spring.io/starter.zip -d type=maven-project -d language=java -d javaVersion=21 -d artifactId=spring-api -d dependencies=web,validation -o spring-api.zip
unzip spring-api.zip -d spring-api && cd spring-api
```

Trabaja dentro de `academia-labs/spring-api`. Si ya existe, no lo vuelvas a generar: entra en la carpeta, confirma `git status` y continúa sobre una rama propia.

### 3. Ubica cada tema antes de escribir

```text
academia-labs/spring-api/
├─ src/main/java/io/academia/rutaflow/
│  └─ module-12/
├─ tests/
├─ docs/decisions/
├─ evidence/module-12/
└─ README.md
```

| Tema | Archivo o decisión | Evidencia mínima |
|---|---|---|
| 1. Arquitectura del microservicio integrador | `src/main/java/io/academia/rutaflow/module-12/topic-1-arquitectura-del-microservicio-integrador.java` | prueba + salida observable |
| 2. Integrando seguridad, persistencia y observabilidad | `src/main/java/io/academia/rutaflow/module-12/topic-2-integrando-seguridad-persistencia-y-observabilidad.java` | prueba + salida observable |
| 3. Cierre del track y próximos pasos | `src/main/java/io/academia/rutaflow/module-12/topic-3-cierre-del-track-y-proximos-pasos.java` | prueba + salida observable |

Un ejemplo técnico vive en el archivo indicado y debe tener una prueba. Un tema conceptual vive en `docs/decisions/`: compara opciones usando restricciones medibles; no escribas código decorativo solo para llenar espacio.

### 4. Ejecuta una línea base

Desde `academia-labs/spring-api`:

```bash
./mvnw test  # Windows: .\mvnw.cmd test
```

**Resultado esperado:** el comando reconoce el proyecto y termina sin errores antes de introducir el cambio del capítulo. Después del incremento, la evidencia debe demostrar: **Microservicio Spring Boot con auth, persistencia real, Actuator y tests de integración, más tres ejercicios de evaluación de cierre.**

Si falla la línea base, no continúes. Localiza el primer mensaje que indique archivo, línea o dependencia; formula una causa y compruébala con un cambio pequeño.

### 5. Provoca un fallo y recupérate

Envía una petición inválida o sustituye una dependencia por un fallo controlado; verifica estado, cuerpo y causa. Guarda en `evidence/module-12/` el comando, la salida relevante, tu hipótesis y la corrección. Revierte únicamente el cambio deliberado; no borres todo el proyecto para ocultar la causa.

### 6. Conecta el capítulo con RutaFlow

Aplica el aprendizaje de **Proyecto integrador — microservicio productivo** a un incremento vertical de RutaFlow. Define qué componente produce el dato, qué contrato lo transporta, quién lo consume y cómo observarás un fallo. La entrega final incluye archivo o decisión, prueba, salida, error corregido y una limitación que todavía validarías en producción.

---

## Contenido teórico

### Tema 1: Arquitectura del microservicio integrador

**Conceptos clave:** capas completas del track combinadas, separación clara de responsabilidades.

El proyecto integrador combina en una única aplicación todas las capas estudiadas a lo largo del track, cada una con su responsabilidad delimitada: `controller/` (`TareaController`, recibiendo peticiones HTTP y traduciendo hacia/desde DTOs, Módulo 2), `service/` (`TareaService`, con la lógica de negocio sin ningún conocimiento de HTTP), `repository/` (`TareaRepository`, acceso a datos vía Spring Data JPA, Módulo 3), `security/` (`SecurityFilterChain`, `JwtFilter`, Módulo 4), y `config/` (clases de `@ConfigurationProperties` tipadas, Módulo 5), con `db/migration/` conteniendo los scripts versionados de Flyway (Módulo 3) que gestionan el esquema real de la base de datos.

Esta arquitectura completa demuestra cómo cada módulo estudiado individualmente a lo largo del track se integra naturalmente con los demás en una aplicación real: la seguridad protege las rutas que el controller expone, el controller delega en el servicio que a su vez usa el repositorio, y la configuración tipada valida al arranque los parámetros que la seguridad y la persistencia necesitan para operar correctamente, todo dentro de una estructura de paquetes que refleja claramente estas responsabilidades separadas.

**Analogía:** el proyecto integrador es como el ensamblaje final de todas las piezas especializadas construidas por separado a lo largo de un curso de ingeniería, donde cada componente (persistencia, seguridad, observabilidad, tests) encaja en su lugar correspondiente dentro de un sistema completo y coherente, demostrando que las piezas individuales estudiadas en aislamiento efectivamente funcionan juntas en un producto real.

**¿Por qué es importante?** Integrar todas las capas del track en una única aplicación real demuestra cómo los conceptos estudiados individualmente (persistencia, seguridad, configuración) se combinan naturalmente en un microservicio productivo completo.

**Diagrama:**

```
src/main/java/com/miapp/
  controller/   ← TareaController (DTOs, validación)
  service/      ← TareaService (lógica de negocio)
  repository/   ← TareaRepository (Spring Data JPA)
  security/     ← SecurityFilterChain, JwtFilter
  config/       ← @ConfigurationProperties tipados
db/migration/    ← scripts Flyway versionados
```

### Tema 2: Integrando seguridad, persistencia y observabilidad

**Conceptos clave:** autorización combinada con lógica de negocio, endpoint protegido por rol.

`@RestController @RequestMapping("/api/tareas") public class TareaController { @PostMapping @PreAuthorize("hasRole('USER')") public ResponseEntity<TareaDTO> crear(@Valid @RequestBody CrearTareaRequest req, Authentication auth) { Tarea tarea = servicio.crear(req, auth.getName()); return ResponseEntity.status(201).body(TareaDTO.from(tarea)); } }` demuestra la integración concreta de múltiples módulos en un único endpoint: `@PreAuthorize` (Módulo 4) protege el endpoint según el rol del usuario autenticado, `@Valid` (Módulo 2) valida el DTO de entrada, `Authentication auth` (inyectado automáticamente por Spring Security tras la validación del filtro JWT) proporciona la identidad del usuario autenticado para asociarla a la tarea creada, y el servicio subyacente persiste esa tarea usando Spring Data JPA (Módulo 3), con el esquema de la tabla correspondiente ya gestionado por una migración versionada de Flyway.

Esta combinación en un único endpoint refleja el nivel de integración esperado de un microservicio productivo real: la seguridad, la validación, la persistencia y la lógica de negocio no son módulos aislados que existen independientemente unos de otros, sino capas que colaboran activamente en cada operación individual de la aplicación, cada una aportando su responsabilidad específica sin invadir la responsabilidad de las demás.

**Analogía:** este endpoint integrado es como un proceso de trámite en una oficina que combina verificación de identidad (seguridad), revisión de que el formulario esté completo (validación), y archivo final del trámite en el sistema correspondiente (persistencia), todo coordinado en una única transacción coherente donde cada paso depende correctamente del anterior.

**¿Por qué es importante?** Un endpoint real integra seguridad, validación, lógica de negocio y persistencia colaborando activamente en una única operación, reflejando cómo un microservicio productivo combina todas sus capas en cada petición individual.

**Código del ejemplo:**

```java
@RestController
@RequestMapping("/api/tareas")
public class TareaController {
    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<TareaDTO> crear(@Valid @RequestBody CrearTareaRequest req, Authentication auth) {
        Tarea tarea = servicio.crear(req, auth.getName());
        return ResponseEntity.status(201).body(TareaDTO.from(tarea));
    }
}
```

### Tema 3: Cierre del track y próximos pasos

**Conceptos clave:** microservicio productivo frente a CRUD funcional, arquitecturas avanzadas como siguiente paso.

Un microservicio Spring Boot "productivo" no se define únicamente por tener un CRUD funcional: es la combinación de seguridad declarativa protegiendo los endpoints sensibles, persistencia versionada mediante migraciones revisables (en vez de esquemas inferidos automáticamente), observabilidad expuesta desde el primer día (health checks y métricas, no agregadas como una idea tardía tras un incidente en producción), y una suite de tests que da confianza real para desplegar sin temor, verificando el flujo crítico de principio a fin contra infraestructura real mediante Testcontainers — exactamente el conjunto de prácticas que distingue un proyecto de portafolio simple de uno genuinamente listo para un equipo de ingeniería real operando en producción.

Como próximos pasos más allá de este track, la Arquitectura Hexagonal (o Arquitectura Limpia) y Domain-Driven Design (DDD) profundizan en cómo estructurar la lógica de negocio para que permanezca completamente independiente de detalles de infraestructura específicos (framework, base de datos concreta); CQRS (Command Query Responsibility Segregation) y Event Sourcing exploran modelos alternativos de persistencia donde las escrituras y las lecturas se modelan de forma completamente separada, y donde el estado se deriva de un historial completo de eventos en vez de un snapshot actual; OIDC (OpenID Connect) y Keycloak abordan autenticación federada y single sign-on (SSO) para sistemas con múltiples aplicaciones que necesitan compartir una identidad de usuario centralizada, en vez de que cada aplicación gestione su propia autenticación de forma aislada como se hizo en este track con JWT gestionado directamente por la propia aplicación.

**Analogía:** un microservicio productivo completo es como un edificio con todos sus sistemas esenciales funcionando de forma coordinada desde el primer día (seguridad, mantenimiento documentado, sensores de monitoreo, inspecciones regulares certificadas), no solo una estructura habitable básica sin ninguno de esos sistemas de soporte esenciales instalados todavía.

**¿Por qué es importante?** Un microservicio productivo combina seguridad, persistencia versionada, observabilidad desde el inicio, y tests que dan confianza real, un estándar considerablemente más alto que un simple CRUD funcional sin esas prácticas.

**Diagrama:**

```
Microservicio productivo = seguridad declarativa + persistencia versionada +
                            observabilidad desde el día 1 + tests de integración reales

Próximos pasos: Arquitectura Hexagonal/DDD | CQRS + Event Sourcing | OIDC/Keycloak (SSO)
```

---

## Proyecto transversal RutaFlow: Confirmación transaccional y outbox

RutaFlow conecta este track con una plataforma completa de paquetería. La implementación de referencia está en `examples/rutaflow/spring-boot/DeliveryService.java`; se estudia como punto de partida pequeño, no como sistema terminado.

### Capacidad y fundamento

La confirmación autoriza al conductor dentro del dominio, bloquea o versiona el agregado, registra el comando procesado y añade el evento a outbox en una sola transacción. Publicar directamente al broker antes del commit puede anunciar una entrega que luego se revierte; publicar después sin outbox puede perder el evento.

### Implementación guiada

1. Copia el contrato y escribe primero casos normales, límite, inválidos y duplicados.
2. Ejecuta la referencia, provoca un fallo y explica el mensaje antes de modificarla.
3. Implementa una mejora pequeña manteniendo nombres de dominio, efectos visibles y errores tipados.
4. Integra con el contrato del track anterior sin compartir tablas, estado mutable ni detalles de framework.
5. Registra la decisión en el README y etiqueta el hito de RutaFlow correspondiente.

### Verificación profesional

Implementa repositorios JPA y migraciones con índices/constraints. Prueba repetición, carrera, conductor no asignado, rollback y publicación tras reinicio. Expón métricas de comandos duplicados, edad de outbox y errores, sin usar el identificador de envío como etiqueta de alta cardinalidad.

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

**Objetivo del laboratorio:** construir el microservicio integrador completo con auth, persistencia real, Actuator y tests de integración.

**Requisitos previos:** Módulos 0-11 completados.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Diseñar la arquitectura por capas completa | Ver Tema 1 | controller/service/repository/dto |
| 2 | Implementar persistencia con migraciones Flyway | Módulo 3 | Sin `ddl-auto` |
| 3 | Proteger endpoints con Spring Security + JWT | Módulo 4 | Autorización por rol |
| 4 | Exponer Actuator con una métrica de negocio | Módulo 7 | Verifica en `/actuator/metrics` |
| 5 | Escribir tests de integración con Testcontainers | Módulo 6 | Cubriendo el flujo crítico completo |

**Verificación:** el laboratorio (y el track completo) se considera exitoso si el microservicio protege correctamente sus endpoints sensibles, persiste datos reales con un esquema versionado, expone al menos una métrica de negocio custom, y tiene una suite de tests de integración que verifica el flujo crítico contra infraestructura real.

**Errores comunes y soluciones**

- **Dejar endpoints sensibles sin protección de autorización.** Verifica que cada endpoint tenga la anotación de autorización apropiada según su sensibilidad.
- **Confiar en `ddl-auto` en vez de migraciones versionadas para el proyecto final.** Usa Flyway consistentemente.
- **Omitir tests de integración del flujo crítico.** Prioriza cubrir con Testcontainers el camino principal completo de la aplicación.

---

## Ejercicios de evaluación

### Ejercicio 1: Decisión de diseño al escalar 100x

**Enunciado:** ¿qué decisión de arquitectura tomarías distinto si este microservicio tuviera que escalar a 100 veces el tráfico actual?

**Solución esperada:** cualquier respuesta razonablemente justificada; respuestas comunes incluyen evaluar WebFlux o virtual threads para mayor concurrencia (Módulo 9, Módulo 5 del track de Java), introducir un circuit breaker y service discovery si el sistema se divide en más microservicios (Módulo 10), o revisar el modelo de persistencia para evitar cuellos de botella específicos bajo la nueva carga.

**Criterios de éxito:**
- Propone un cambio concreto y justificado relacionado con el aumento de escala.

### Ejercicio 2: Parte más compleja del ecosistema Spring

**Enunciado:** ¿qué parte del ecosistema Spring (Security, Data JPA, Testcontainers) te resultó más compleja de dominar?

**Solución esperada:** cualquier respuesta razonablemente justificada, vinculando la parte elegida con una dificultad concreta observada durante el desarrollo del proyecto (por ejemplo, la configuración del filtro JWT en Spring Security, o diagnosticar el problema N+1 en Spring Data JPA).

**Criterios de éxito:**
- Justifica su elección con una dificultad concreta y específica observada en el proyecto propio.

### Ejercicio 3: Cierre del track — qué distingue un microservicio productivo

**Enunciado:** ¿qué distingue un microservicio Spring Boot "productivo" de simplemente tener un CRUD funcionando?

**Solución esperada:** la combinación de seguridad declarativa protegiendo endpoints sensibles, persistencia versionada con migraciones revisables en vez de esquemas inferidos automáticamente, observabilidad (health checks y métricas) expuesta desde el inicio, y una suite de tests de integración que verifica el flujo crítico contra infraestructura real, dando confianza genuina para desplegar sin temor.

**Criterios de éxito:**
- Menciona correctamente al menos tres de los cuatro elementos (seguridad, persistencia versionada, observabilidad, tests de integración) como lo que distingue un microservicio productivo.

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

- El proyecto integrador combina todas las capas del track (controller, service, repository, security, config) en una arquitectura coherente.
- Un endpoint real integra seguridad, validación, lógica de negocio y persistencia colaborando en una única operación.
- Un microservicio productivo se distingue por seguridad declarativa, persistencia versionada, observabilidad desde el inicio, y tests de integración reales.

**Conceptos aprendidos**

- Arquitectura por capas de un microservicio real completo.
- Integración de seguridad, persistencia y observabilidad.
- Criterios que distinguen un microservicio productivo de un CRUD simple.

**Próximos pasos**

Con el track de Spring Boot completo, estás preparado para construir, asegurar, observar y probar microservicios Spring Boot productivos, con una base sólida para profundizar en Arquitectura Hexagonal/DDD, CQRS/Event Sourcing, y autenticación federada con OIDC/Keycloak.

**Recursos adicionales**

- Documentación oficial de Spring (spring.io/projects) como referencia continua para profundizar en cualquiera de los temas de este track.
