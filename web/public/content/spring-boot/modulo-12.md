# Módulo 12: Proyecto integrador — microservicio productivo


## Aprende construyendo

### Tema 1: Arquitectura del microservicio integrador

Fallo deliberado: interrumpe la dependencia descrita y registra el diagnóstico antes de corregirla.

#### Paso 1 · Objetivo y preparación
Al finalizar podrás ensamblar este proyecto desde cero. Prerrequisitos: JDK 21, Maven, Docker y un editor. Comprueba java --version, mvn --version y docker --version.

#### Paso 2 · Contexto y caso real
En un caso real, un servicio de entregas debe integrar HTTP, base de datos, identidad, eventos y métricas sin esconder responsabilidades ni fallos parciales.

#### Paso 3 · Teoría, modelo mental y analogía
La arquitectura integra capas, contratos y operaciones; no es pegar fragmentos. Define un caso de uso, sus puertos y adaptadores, y una ruta de evolución. La analogía es coordinar una central logística: cada estación tiene dueño, entradas, salida y protocolo de emergencia.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-spring-m12
cd ejemplo-spring-m12
curl -fsSL https://start.spring.io/starter.zip -d dependencies=web,data-jpa,security,actuator -d javaVersion=21 -o app.zip
unzip app.zip
mvn test
```
Crea `src/main/java/com/example/demo/DeliveryApplication.java` y conecta una ruta, persistencia simulada, seguridad y health; documenta el flujo completo.

#### Paso 5 · Práctica guiada
Pista: ejecuta `mvn test`, desactiva deliberadamente una dependencia para observar el fallo y corrígela. Resultado esperado: pruebas verdes, health claro y respuesta autorizada.

#### Paso 6 · Práctica independiente
Añade idempotencia, evento outbox, métrica de negocio y un escenario de rollback; escribe un README con estructura de carpetas y decisiones.

#### Paso 7 · Cierre y evidencia
Guarda código, pruebas, logs, diagrama y decisiones; como siguiente paso aplica la misma revisión a otro track. Errores comunes: mezclar capas, no definir ownership, ignorar seguridad y no medir. Fuentes oficiales: https://docs.spring.io/spring-boot/reference/ y https://12factor.net/.
**¿Por qué es importante?** Porque integrar conceptos demuestra comprensión transferible y revela huecos que una lectura aislada oculta.
**Evidencia de aprendizaje:** entrega el proyecto ejecutable, pruebas, health, diagrama y retrospectiva técnica.
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

Fallo deliberado: interrumpe la dependencia descrita y registra el diagnóstico antes de corregirla.

#### Paso 1 · Objetivo y preparación
Al finalizar podrás ensamblar este proyecto desde cero. Prerrequisitos: JDK 21, Maven, Docker y un editor. Comprueba java --version, mvn --version y docker --version.

#### Paso 2 · Contexto y caso real
En un caso real, un servicio de entregas debe integrar HTTP, base de datos, identidad, eventos y métricas sin esconder responsabilidades ni fallos parciales.

#### Paso 3 · Teoría, modelo mental y analogía
La arquitectura integra capas, contratos y operaciones; no es pegar fragmentos. Define un caso de uso, sus puertos y adaptadores, y una ruta de evolución. La analogía es coordinar una central logística: cada estación tiene dueño, entradas, salida y protocolo de emergencia.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-spring-m12
cd ejemplo-spring-m12
curl -fsSL https://start.spring.io/starter.zip -d dependencies=web,data-jpa,security,actuator -d javaVersion=21 -o app.zip
unzip app.zip
mvn test
```
Crea `src/main/java/com/example/demo/DeliveryApplication.java` y conecta una ruta, persistencia simulada, seguridad y health; documenta el flujo completo.

#### Paso 5 · Práctica guiada
Pista: ejecuta `mvn test`, desactiva deliberadamente una dependencia para observar el fallo y corrígela. Resultado esperado: pruebas verdes, health claro y respuesta autorizada.

#### Paso 6 · Práctica independiente
Añade idempotencia, evento outbox, métrica de negocio y un escenario de rollback; escribe un README con estructura de carpetas y decisiones.

#### Paso 7 · Cierre y evidencia
Guarda código, pruebas, logs, diagrama y decisiones; como siguiente paso aplica la misma revisión a otro track. Errores comunes: mezclar capas, no definir ownership, ignorar seguridad y no medir. Fuentes oficiales: https://docs.spring.io/spring-boot/reference/ y https://12factor.net/.
**¿Por qué es importante?** Porque integrar conceptos demuestra comprensión transferible y revela huecos que una lectura aislada oculta.
**Evidencia de aprendizaje:** entrega el proyecto ejecutable, pruebas, health, diagrama y retrospectiva técnica.
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

Fallo deliberado: interrumpe la dependencia descrita y registra el diagnóstico antes de corregirla.

#### Paso 1 · Objetivo y preparación
Al finalizar podrás ensamblar este proyecto desde cero. Prerrequisitos: JDK 21, Maven, Docker y un editor. Comprueba java --version, mvn --version y docker --version.

#### Paso 2 · Contexto y caso real
En un caso real, un servicio de entregas debe integrar HTTP, base de datos, identidad, eventos y métricas sin esconder responsabilidades ni fallos parciales.

#### Paso 3 · Teoría, modelo mental y analogía
La arquitectura integra capas, contratos y operaciones; no es pegar fragmentos. Define un caso de uso, sus puertos y adaptadores, y una ruta de evolución. La analogía es coordinar una central logística: cada estación tiene dueño, entradas, salida y protocolo de emergencia.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-spring-m12
cd ejemplo-spring-m12
curl -fsSL https://start.spring.io/starter.zip -d dependencies=web,data-jpa,security,actuator -d javaVersion=21 -o app.zip
unzip app.zip
mvn test
```
Crea `src/main/java/com/example/demo/DeliveryApplication.java` y conecta una ruta, persistencia simulada, seguridad y health; documenta el flujo completo.

#### Paso 5 · Práctica guiada
Pista: ejecuta `mvn test`, desactiva deliberadamente una dependencia para observar el fallo y corrígela. Resultado esperado: pruebas verdes, health claro y respuesta autorizada.

#### Paso 6 · Práctica independiente
Añade idempotencia, evento outbox, métrica de negocio y un escenario de rollback; escribe un README con estructura de carpetas y decisiones.

#### Paso 7 · Cierre y evidencia
Guarda código, pruebas, logs, diagrama y decisiones; como siguiente paso aplica la misma revisión a otro track. Errores comunes: mezclar capas, no definir ownership, ignorar seguridad y no medir. Fuentes oficiales: https://docs.spring.io/spring-boot/reference/ y https://12factor.net/.
**¿Por qué es importante?** Porque integrar conceptos demuestra comprensión transferible y revela huecos que una lectura aislada oculta.
**Evidencia de aprendizaje:** entrega el proyecto ejecutable, pruebas, health, diagrama y retrospectiva técnica.
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
