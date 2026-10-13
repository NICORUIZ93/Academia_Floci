# Exámenes integradores y proyecto final

Este cuaderno acompaña los roadmaps de 30 pasos. Cada bloque termina con una evaluación práctica; no es un examen de memoria: entrega código, pruebas, mediciones, diagramas o decisiones reproducibles según el tema.

## Rúbrica por tema

Puntúa cada criterio de 0 a 3: **0** sin evidencia; **1** con ayuda o con defectos importantes; **2** correcto en el caso normal y sus límites; **3** correcto, reproducible y defendido con evidencia. Cuatro criterios suman 12 puntos. Aprobación sugerida: 9/12, sin obtener 0 en corrección ni en diagnóstico. Repite únicamente la parte que no alcance el criterio.

## Bloque 1: Fundamentos de programación

**Caso integrador:** automatizar una regla de pedidos de una tienda. Entrega un incremento que use algoritmos, variables, tipos, operadores, control, funciones y alcance «programa pequeño trazable con entradas, salidas y pruebas».

### Reto 1.1: Fundamentos de programación

1. **Construye:** resuelve implementar una función de precio con decisiones y casos límite para el escenario «automatizar una regla de pedidos de una tienda».
2. **Diagnostica:** reproduce «confundir asignación con comparación o ignorar el límite», explica la causa y demuestra la corrección.
3. **Justifica:** muestra cómo algoritmos, variables, tipos, operadores, control, funciones se conecta con algoritmos y lógica como base para elegir cualquier lenguaje; compara una alternativa.
4. **Entrega:** presenta programa pequeño trazable con entradas, salidas y pruebas, sus pruebas y las fuentes consultadas: Python Tutorial: control flow, data structures y functions.

**Cierre del bloque:** ejecuta una revisión integrada de los retos, registra dependencias entre entregables y describe un fallo que atraviese más de un tema.

## Bloque 2: Java

**Caso integrador:** compilar y ejecutar una orden logística en Java. Entrega un incremento que use JDK/JRE/JVM, source-to-bytecode, main, classpath, packages, LTS 8/11/17/21, historia y Virtual Threads y alcance «proyecto Java con build reproducible, CI y plan de 30 días por hitos».

### Reto 2.1: Java — Fundamentos

1. **Construye:** resuelve compilar con javac, inspeccionar bytecode y ejecutar la misma tarea en una versión LTS objetivo para el escenario «compilar y ejecutar una orden logística en Java».
2. **Diagnostica:** reproduce «confundir JDK con JVM o asumir que todo Java moderno corre en Java 8», explica la causa y demuestra la corrección.
3. **Justifica:** muestra cómo JDK/JRE/JVM, source-to-bytecode, main, classpath, packages, LTS 8/11/17/21, historia y Virtual Threads se conecta con fundamentos de programación, Maven y Spring; compara una alternativa.
4. **Entrega:** presenta proyecto Java ejecutable con matriz de versiones y notas de compatibilidad, sus pruebas y las fuentes consultadas: dev.java/learn y documentación de Oracle Java.

### Reto 2.2: Java — POO

1. **Construye:** resuelve implementar un dominio con invariantes y extensiones comprobadas mediante tests para el escenario «proteger invariantes de una guía de envío».
2. **Diagnostica:** reproduce «crear jerarquías solo para reutilizar código o exponer setters inválidos», explica la causa y demuestra la corrección.
3. **Justifica:** muestra cómo clases, objetos, constructores, this, encapsulamiento, herencia, super, polimorfismo, abstracción, modifiers, static/final y SOLID se conecta con tipos, diseño, patrones y Spring DI; compara una alternativa.
4. **Entrega:** presenta modelo Java con pruebas que demuestran principios SOLID aplicados con criterio, sus pruebas y las fuentes consultadas: dev.java/learn/classes-objects y dev.java/learn/inheritance.

### Reto 2.3: Java — Colecciones y estructuras de datos

1. **Construye:** resuelve medir operaciones representativas en estructuras ordenadas y no ordenadas para el escenario «buscar y priorizar paquetes en un centro logístico».
2. **Diagnostica:** reproduce «elegir una colección por moda sin considerar operaciones y orden», explica la causa y demuestra la corrección.
3. **Justifica:** muestra cómo ArrayList/LinkedList, Sets, Maps, Queue/Deque/PriorityQueue/Stack, iteradores, comparadores y Big-O se conecta con POO, algoritmos y persistencia; compara una alternativa.
4. **Entrega:** presenta benchmark reproducible con elección de colección y complejidad explicada, sus pruebas y las fuentes consultadas: dev.java/learn/api/collections y documentación de java.util.

### Reto 2.4: Java — Excepciones y APIs modernas

1. **Construye:** resuelve procesar un archivo con errores recuperables, pipeline y tests de fechas para el escenario «importar escaneos de entrega y resumir retrasos por fecha y zona».
2. **Diagnostica:** reproduce «tragar excepciones, usar Optional en campos indiscriminadamente o ignorar zona horaria», explica la causa y demuestra la corrección.
3. **Justifica:** muestra cómo try/catch/finally, throw/throws, checked/unchecked, resources, custom exceptions, Streams, Optional y Date/Time se conecta con colecciones, lambdas, IO y backend; compara una alternativa.
4. **Entrega:** presenta pipeline de importación con errores explícitos, recursos cerrados y zona horaria probada, sus pruebas y las fuentes consultadas: dev.java/learn/api/streams y Java Date-Time API.

### Reto 2.5: Java — Multithreading y concurrencia

1. **Construye:** resuelve reproducir race condition, detectarla y resolverla con sincronización o actoría apropiada para el escenario «consultar proveedores en paralelo y actualizar una orden compartida».
2. **Diagnostica:** reproduce «suponer que volatile hace atómica una operación compuesta», explica la causa y demuestra la corrección.
3. **Justifica:** muestra cómo Thread/Runnable/Callable, lifecycle, races, locks, volatile, atomics, executors, pools, CompletableFuture y deadlocks se conecta con Java API, Kafka y resiliencia; compara una alternativa.
4. **Entrega:** presenta servicio concurrente con tests de carrera, timeout, cancelación y estrategia para deadlocks, sus pruebas y las fuentes consultadas: dev.java/learn/concurrency y Java Concurrency Utilities.

### Reto 2.6: Java — Generics y programación funcional

1. **Construye:** resuelve crear un pipeline tipado con flatMap y reducción sin efectos laterales innecesarios para el escenario «componer filtros y transformaciones tipadas para paquetes».
2. **Diagnostica:** reproduce «abusar de wildcards o esconder efectos laterales dentro de una lambda», explica la causa y demuestra la corrección.
3. **Justifica:** muestra cómo generics, bounds, wildcards, Function/Predicate/Consumer/Supplier, lambdas, method references y Streams se conecta con colecciones, Streams y diseño reusable; compara una alternativa.
4. **Entrega:** presenta librería Java de funciones de dominio con tests y contratos genéricos, sus pruebas y las fuentes consultadas: dev.java/learn/generics y dev.java/learn/lambdas.

### Reto 2.7: Java — Build y proyectos

1. **Construye:** resuelve configurar wrapper, build verify, tests y comparación acotada con Gradle para el escenario «entregar un proyecto Java repetible para varios entornos».
2. **Diagnostica:** reproduce «confundir lifecycle phases con goals o depender de Maven global; saltar fundamentos por perseguir frameworks o medir progreso por temas leídos», explica la causa y demuestra la corrección.
3. **Justifica:** muestra cómo Maven lifecycle y comandos, Gradle, proyecto por etapas y plan Java de 30 días se conecta con fundamentos, POO, API y despliegue; compara una alternativa.
4. **Entrega:** presenta proyecto Java con build reproducible, CI y plan de 30 días por hitos, sus pruebas y las fuentes consultadas: maven.apache.org/guides/introduction/introduction-to-the-lifecycle.html; dev.java/learn, JEP Index y OpenJDK release roadmap.

**Cierre del bloque:** ejecuta una revisión integrada de los retos, registra dependencias entre entregables y describe un fallo que atraviese más de un tema.

## Bloque 3: Spring y arquitectura de backend

**Caso integrador:** ensamblar un servicio de pedidos con dependencias inyectadas. Entrega un incremento que use IoC/DI, Beans, ApplicationContext, stereotype annotations, autoconfiguración, starters y configuration files y alcance «flujo probado por partición, idempotent producer y DLT con alerta y replay controlado».

### Reto 3.1: Spring — Fundamentos

1. **Construye:** resuelve crear beans y probar inyección por constructor y condiciones de autoconfiguración para el escenario «ensamblar un servicio de pedidos con dependencias inyectadas».
2. **Diagnostica:** reproduce «confundir anotaciones con arquitectura o inyectar por campo por defecto», explica la causa y demuestra la corrección.
3. **Justifica:** muestra cómo IoC/DI, Beans, ApplicationContext, stereotype annotations, autoconfiguración, starters y configuration files se conecta con Java, interfaces, REST y persistencia; compara una alternativa.
4. **Entrega:** presenta app Spring Boot mínima con configuración tipada y pruebas de contexto, sus pruebas y las fuentes consultadas: docs.spring.io/spring-framework/reference/core/beans.html.

### Reto 3.2: Spring — Estructura enterprise

1. **Construye:** resuelve trazar dependencias y probar un use case sin inicializar Spring para el escenario «organizar un flujo de compra que permita cambiar adaptadores sin filtrar framework al dominio».
2. **Diagnostica:** reproduce «crear carpetas domain sin respetar dirección de dependencias», explica la causa y demuestra la corrección.
3. **Justifica:** muestra cómo domain/application/infrastructure/api/shared, entidades y puertos, usecases, DTO/mappers, adapters, Clean Architecture, DDD y Hexagonal se conecta con POO, SOLID, Spring DI y microservicios; compara una alternativa.
4. **Entrega:** presenta feature vertical con dominio puro, puerto y adaptador reemplazable, sus pruebas y las fuentes consultadas: docs.spring.io/spring-modulith/reference/; martinfowler.com/bliki/HexagonalArchitecture.html.

### Reto 3.3: Spring — APIs REST

1. **Construye:** resuelve crear endpoint idempotente con validación y contrato de error para el escenario «exponer pedidos a web, Android e iOS con contratos estables».
2. **Diagnostica:** reproduce «devolver entidades JPA o responder 200 a todos los resultados», explica la causa y demuestra la corrección.
3. **Justifica:** muestra cómo HTTP verbs/status, mappings, path/body/query, DTO/entity, validation, advice y versioning se conecta con HTTP, seguridad, JPA y QA automation; compara una alternativa.
4. **Entrega:** presenta API versionada con pruebas de contrato, validación y errores consistentes, sus pruebas y las fuentes consultadas: docs.spring.io/spring-framework/reference/web/webmvc.html.

### Reto 3.4: Spring — Acceso a datos (JPA/Hibernate)

1. **Construye:** resuelve reproducir N+1 con fixture real, contar consultas y comparar planes LAZY/EAGER para el escenario «cargar pedidos y líneas de pedido midiendo exactamente el SQL generado».
2. **Diagnostica:** reproduce «cambiar todo a EAGER, serializar entidades o asumir que LAZY siempre evita consultas», explica la causa y demuestra la corrección.
3. **Justifica:** muestra cómo entities/IDs/relations, LAZY/EAGER, N+1, fetch joins/EntityGraph, cascades/orphan removal, transaction, repositories/query methods y migrations se conecta con modelado SQL, REST, transacciones y rendimiento; compara una alternativa.
4. **Entrega:** presenta API JPA con migración versionada, caso N+1 medido y fetch plan explícito por caso de uso, sus pruebas y las fuentes consultadas: docs.spring.io/spring-data/jpa/reference/ y jakarta.ee/specifications/persistence/.

### Reto 3.5: Spring — Seguridad

1. **Construye:** resuelve verificar firma, issuer, audience, expiry y permisos con pruebas de autorización negativa para el escenario «autorizar a cliente y operador sin confiar en datos enviados por el cliente».
2. **Diagnostica:** reproduce «confiar en claims sin validar firma o tratar OAuth2 y OIDC como sinónimos», explica la causa y demuestra la corrección.
3. **Justifica:** muestra cómo Spring Security, JWT header/payload/signature, HMAC/RSA, login/token/filter, roles, OAuth2/OIDC, Keycloak, CORS y Cognito comparison se conecta con identidad, HTTP, secretos y zero trust; compara una alternativa.
4. **Entrega:** presenta API con matriz de roles y login local IdP documentado, sus pruebas y las fuentes consultadas: docs.spring.io/spring-security/reference/ y keycloak.org/documentation.

### Reto 3.6: Spring — Servicios avanzados

1. **Construye:** resuelve implementar tarea idempotente y evento de dominio comprobable con fake clock para el escenario «ejecutar tareas programadas, reaccionar a cambios y evitar cálculos repetidos».
2. **Diagnostica:** reproduce «publicar emails duplicados o usar cache sin política de invalidación», explica la causa y demuestra la corrección.
3. **Justifica:** muestra cómo Scheduling, ApplicationEvent/@EventListener, Batch, cache y email se conecta con transacciones, idempotencia, Batch y observabilidad; compara una alternativa.
4. **Entrega:** presenta servicios de aplicación con scheduler, listener, cache y email reemplazables en tests, sus pruebas y las fuentes consultadas: docs.spring.io/spring-framework/reference/integration.html; docs.spring.io/spring-batch/reference/.

### Reto 3.7: Spring — Integración y APIs externas

1. **Construye:** resuelve simular timeout, 429 y respuesta inválida sin llamar un tercero real para el escenario «consultar transportistas y manejar latencia, errores y cambios de contrato».
2. **Diagnostica:** reproduce «reintentar POST no idempotente o confundir cliente HTTP bloqueante con reactivo», explica la causa y demuestra la corrección.
3. **Justifica:** muestra cómo RestTemplate legado, WebClient, Feign, APIs externas y llamadas entre servicios se conecta con REST, microservicios, resiliencia y secretos; compara una alternativa.
4. **Entrega:** presenta adaptador externo con timeout, mapping de errores y tests contractuales, sus pruebas y las fuentes consultadas: docs.spring.io/spring-framework/reference/integration/rest-clients.html.

### Reto 3.8: Spring — Monitoreo y observabilidad

1. **Construye:** resuelve propagar trace/correlation ID y conectar un span HTTP a una dependencia lenta para el escenario «diagnosticar un retraso que cruza API, base de datos y broker».
2. **Diagnostica:** reproduce «registrar tokens/PII o confundir logs con trazas distribuidas», explica la causa y demuestra la corrección.
3. **Justifica:** muestra cómo Actuator, Prometheus/Grafana, ELK, Sentry, logs, métricas y trazas se conecta con microservicios, Kafka, Kubernetes y respuesta a incidentes; compara una alternativa.
4. **Entrega:** presenta dashboard mínimo con SLI definidos, trazas correlacionadas y política de redacción, sus pruebas y las fuentes consultadas: docs.spring.io/spring-boot/reference/actuator/; opentelemetry.io/docs/.

### Reto 3.9: Spring — Ecosistema y milestones

1. **Construye:** resuelve comprobar coordenada, estado GA/RC/M y compatibilidad antes de habilitar un BOM para el escenario «evaluar una actualización del ecosistema sin desplegar una milestone accidentalmente».
2. **Diagnostica:** reproduce «copiar números de milestone del cuaderno como versiones estables o ignorar compatibilidad», explica la causa y demuestra la corrección.
3. **Justifica:** muestra cómo Spring AI/Data/Security/Integration/AMQP/Cloud, SemVer/prerelease, BOM y compatibilidad se conecta con Maven, Spring Boot, seguridad de cadena de suministro; compara una alternativa.
4. **Entrega:** presenta ADR de upgrade con fuentes fechadas, dependency tree y plan de rollback, sus pruebas y las fuentes consultadas: spring.io/projects; github.com/spring-projects.

### Reto 3.10: Spring Batch

1. **Construye:** resuelve fallar entre chunks, reanudar y probar idempotencia de escrituras para el escenario «conciliar millones de eventos reiniciando tras una falla».
2. **Diagnostica:** reproduce «procesar todo en memoria o llamar restartable a un job con efectos duplicables», explica la causa y demuestra la corrección.
3. **Justifica:** muestra cómo Job/Step/JobRepository, chunk, reader/processor/writer, skip, retry, restart, partitioning y parallelism se conecta con base de datos, transacciones, scheduler y operación; compara una alternativa.
4. **Entrega:** presenta job con restart comprobado, métrica por chunk y política de errores, sus pruebas y las fuentes consultadas: docs.spring.io/spring-batch/reference/.

### Reto 3.11: Arquitectura de microservicios

1. **Construye:** resuelve mapear fallos y costes operativos antes de separar un bounded context para el escenario «decidir si separar pedidos de facturación o mantener un monolito modular».
2. **Diagnostica:** reproduce «llamar microservicio a cualquier Spring Boot con REST y Docker», explica la causa y demuestra la corrección.
3. **Justifica:** muestra cómo monolith comparison, bounded contexts, gateway, sync/async, circuit breaker, bulkhead, observability, DB-per-service, deployment, Saga se conecta con DDD, REST, Kafka, Saga, CQRS y Outbox; compara una alternativa.
4. **Entrega:** presenta ADR que demuestra por qué Spring Boot + REST + Docker no es criterio suficiente para microservicios, sus pruebas y las fuentes consultadas: microservices.io y docs.spring.io/spring-cloud/reference/.

### Reto 3.12: Apache Kafka

1. **Construye:** resuelve provocar fallo de consumer y seguir offset→retry topic→DLT→replay para el escenario «propagar el estado de paquetes con retries acotados y DLQ operable».
2. **Diagnostica:** reproduce «confundir orden global con orden por partición o asumir exactly-once extremo a extremo», explica la causa y demuestra la corrección.
3. **Justifica:** muestra cómo broker/topic/partition/offset/group, KafkaTemplate/listener, replication, retries/backoff, DLT/@DltHandler, idempotency y Kafka vs REST se conecta con Outbox, microservices, resiliencia y observabilidad; compara una alternativa.
4. **Entrega:** presenta flujo probado por partición, idempotent producer y DLT con alerta y replay controlado, sus pruebas y las fuentes consultadas: kafka.apache.org/documentation/ y docs.spring.io/spring-kafka/reference/.

**Cierre del bloque:** ejecuta una revisión integrada de los retos, registra dependencias entre entregables y describe un fallo que atraviese más de un tema.

## Bloque 4: QA Automation

**Caso integrador:** verificar el contrato de tracking consumido por varios clientes. Entrega un incremento que use REST, HTTP, status codes, JSON, JSONPath y primer flujo en Postman y alcance «repositorio reproducible con collection, pipeline, reportes y guía de fallo».

### Reto 4.1: Introducción al API Testing

1. **Construye:** resuelve crear casos para éxito, validación, no encontrado y autorización para el escenario «verificar el contrato de tracking consumido por varios clientes».
2. **Diagnostica:** reproduce «validar solo el código HTTP sin comprobar la respuesta útil», explica la causa y demuestra la corrección.
3. **Justifica:** muestra cómo REST, HTTP, status codes, JSON, JSONPath y primer flujo en Postman se conecta con REST, JSON y estrategia de testing; compara una alternativa.
4. **Entrega:** presenta matriz de pruebas con contrato, datos y resultados esperados, sus pruebas y las fuentes consultadas: learning.postman.com/docs/.

### Reto 4.2: Postman desde cero

1. **Construye:** resuelve mover una colección entre local y CI sin guardar secretos reales para el escenario «organizar requests de autenticación, pedidos y seguimiento».
2. **Diagnostica:** reproduce «duplicar URLs y credenciales en cada request», explica la causa y demuestra la corrección.
3. **Justifica:** muestra cómo requests, collections, variables, environments y auth Basic/Bearer/OAuth2/API Key se conecta con contratos HTTP y pruebas automatizadas; compara una alternativa.
4. **Entrega:** presenta collection versionada con environment de ejemplo y variables secretas externas, sus pruebas y las fuentes consultadas: learning.postman.com/docs/getting-started/.

### Reto 4.3: Automatización en Postman

1. **Construye:** resuelve encadenar creación y consulta usando un ID de respuesta para el escenario «detectar automáticamente regresiones del API de órdenes».
2. **Diagnostica:** reproduce «tests dependientes del orden sin cleanup o assertions demasiado laxas», explica la causa y demuestra la corrección.
3. **Justifica:** muestra cómo pm.test, pm.expect, assertions de status/body/schema/tiempo, datos dinámicos y chaining se conecta con API Testing, environments y calidad de datos; compara una alternativa.
4. **Entrega:** presenta suite determinista con aserciones positivas, negativas y datos dinámicos, sus pruebas y las fuentes consultadas: learning.postman.com/docs/tests-and-scripts/.

### Reto 4.4: Newman

1. **Construye:** resuelve correr los mismos casos con dos filas de datos y guardar un reporte HTML para el escenario «ejecutar una colección Postman en terminal y CI».
2. **Diagnostica:** reproduce «usar variables secretas en comandos registrados o ignorar el exit code», explica la causa y demuestra la corrección.
3. **Justifica:** muestra cómo CLI, variables por opción, data files CSV/JSON y reporter HTML htmlextra se conecta con Postman, scripting y CI; compara una alternativa.
4. **Entrega:** presenta comando reproducible y reporte conservado incluso al fallar, sus pruebas y las fuentes consultadas: github.com/postmanlabs/newman y github.com/DannyDainton/newman-reporter-htmlextra.

### Reto 4.5: Jenkins para QA

1. **Construye:** resuelve crear stages de instalación, smoke y reporte con publicación de artifacts para el escenario «ejecutar smoke, regresión y nightly con evidencia consultable».
2. **Diagnostica:** reproduce «guardar credenciales en Jenkinsfile o publicar solo el estado final», explica la causa y demuestra la corrección.
3. **Justifica:** muestra cómo jobs, pipelines, Jenkinsfile declarativo, Newman, artifacts y notificaciones se conecta con Git, Newman y políticas de CI; compara una alternativa.
4. **Entrega:** presenta pipeline declarativo con credenciales gestionadas y reporte HTML archivado, sus pruebas y las fuentes consultadas: jenkins.io/doc/book/pipeline/.

### Reto 4.6: Proyecto final QA Automation

1. **Construye:** resuelve separar smoke rápido de regresión completa y programar ejecución nocturna para el escenario «automatizar un flujo de compra y entrega de principio a fin».
2. **Diagnostica:** reproduce «hacer que toda prueba dependa de datos remotos inestables», explica la causa y demuestra la corrección.
3. **Justifica:** muestra cómo pipeline Postman → Newman → Jenkins con reportes y tipos de ejecución se conecta con contratos, datos de prueba y observabilidad CI; compara una alternativa.
4. **Entrega:** presenta repositorio reproducible con collection, pipeline, reportes y guía de fallo, sus pruebas y las fuentes consultadas: Postman Learning Center y Jenkins Pipeline documentation.

**Cierre del bloque:** ejecuta una revisión integrada de los retos, registra dependencias entre entregables y describe un fallo que atraviese más de un tema.

## Bloque 5: Bases de datos

**Caso integrador:** persistir pedidos y localizar entregas por zona sin imponer el mismo modelo a toda carga. Entrega un incremento que use SQL/JOIN/GROUP BY/subqueries/indexes/normalization, Postgres backup/extensions, MySQL GEOMETRY/ST_*, MongoDB and SQL-vs-NoSQL y alcance «modelo relacional migrable, consultas espaciales con SRID y ADR SQL/NoSQL con backup restaurado».

### Reto 5.1: Bases de datos: SQL, PostgreSQL, MySQL espacial y MongoDB

1. **Construye:** resuelve comparar dos modelos para la misma consulta espacial y verificar un restore para el escenario «persistir pedidos y localizar entregas por zona sin imponer el mismo modelo a toda carga».
2. **Diagnostica:** reproduce «usar SELECT * y añadir índices sin medir escritura ni selectividad; mezclar SRIDs, unidades angulares y metros o invertir latitud/longitud; confundir que un dump se generó con que el backup es restaurable; elegir NoSQL por moda o duplicar datos sin estrategia de actualización», explica la causa y demuestra la corrección.
3. **Justifica:** muestra cómo SQL/JOIN/GROUP BY/subqueries/indexes/normalization, Postgres backup/extensions, MySQL GEOMETRY/ST_*, MongoDB and SQL-vs-NoSQL se conecta con JPA, GPS móvil, integridad, índices y eventos; compara una alternativa.
4. **Entrega:** presenta modelo relacional migrable, consultas espaciales con SRID y ADR SQL/NoSQL con backup restaurado, sus pruebas y las fuentes consultadas: postgresql.org/docs/current/tutorial-sql.html; dev.mysql.com/doc/refman/8.4/en/spatial-types.html; postgresql.org/docs/current/backup.html; mongodb.com/docs/manual/.

**Cierre del bloque:** ejecuta una revisión integrada de los retos, registra dependencias entre entregables y describe un fallo que atraviese más de un tema.

## Bloque 6: Docker y runtimes locales

**Caso integrador:** empaquetar un backend multi-stage y ejecutar el mismo compose en runtimes compatibles. Entrega un incremento que use images/layers/Dockerfile/volumes/networks; env -e/.env/ENV; compose; multi-stage; .dockerignore; non-root; Dory/OrbStack/Podman y alcance «stack reproducible con imagen no-root, entorno documentado y comparativa local-first».

### Reto 6.1: Docker y alternativas

1. **Construye:** resuelve inspeccionar usuario y capas, montar persistencia y comparar un runtime alternativo para el escenario «empaquetar un backend multi-stage y ejecutar el mismo compose en runtimes compatibles».
2. **Diagnostica:** reproduce «secretos embebidos en imagen o asumir paridad total de CLI/runtimes», explica la causa y demuestra la corrección.
3. **Justifica:** muestra cómo images/layers/Dockerfile/volumes/networks; env -e/.env/ENV; compose; multi-stage; .dockerignore; non-root; Dory/OrbStack/Podman se conecta con CI/CD, Kubernetes, Floci y seguridad de artefactos; compara una alternativa.
4. **Entrega:** presenta stack reproducible con imagen no-root, entorno documentado y comparativa local-first, sus pruebas y las fuentes consultadas: docs.docker.com/get-started/; podman.io/docs y documentación oficial del runtime elegido.

**Cierre del bloque:** ejecuta una revisión integrada de los retos, registra dependencias entre entregables y describe un fallo que atraviese más de un tema.

## Bloque 7: CI/CD

**Caso integrador:** validar y liberar cambios de una API sin pasos manuales ocultos. Entrega un incremento que use integración, entrega/despliegue continuo, Jenkins, Actions, GitLab, Azure, CircleCI y rollout y alcance «pipeline reproducible con gates, artifacts y estrategia de rollback».

### Reto 7.1: CI/CD

1. **Construye:** resuelve crear build/test/security stages y simular rolling o canary con rollback para el escenario «validar y liberar cambios de una API sin pasos manuales ocultos».
2. **Diagnostica:** reproduce «confundir pipeline verde con despliegue seguro o guardar secretos en YAML», explica la causa y demuestra la corrección.
3. **Justifica:** muestra cómo integración, entrega/despliegue continuo, Jenkins, Actions, GitLab, Azure, CircleCI y rollout se conecta con Git, pruebas, contenedores e IaC; compara una alternativa.
4. **Entrega:** presenta pipeline reproducible con gates, artifacts y estrategia de rollback, sus pruebas y las fuentes consultadas: docs.github.com/actions y jenkins.io/doc/book/pipeline/.

**Cierre del bloque:** ejecuta una revisión integrada de los retos, registra dependencias entre entregables y describe un fallo que atraviese más de un tema.

## Bloque 8: Kubernetes

**Caso integrador:** mantener disponible la API de entregas durante cambios. Entrega un incremento que use Pods, Deployments, Services, Ingress, ConfigMaps, Secrets, HPA, Helm y probes y alcance «manifiestos comentados con probes, límites y prueba de rollout».

### Reto 8.1: Kubernetes

1. **Construye:** resuelve romper readiness deliberadamente y observar cómo cambia el tráfico para el escenario «mantener disponible la API de entregas durante cambios».
2. **Diagnostica:** reproduce «usar liveness para dependencias externas o almacenar secretos en ConfigMap», explica la causa y demuestra la corrección.
3. **Justifica:** muestra cómo Pods, Deployments, Services, Ingress, ConfigMaps, Secrets, HPA, Helm y probes se conecta con Docker, CI/CD, redes y observabilidad; compara una alternativa.
4. **Entrega:** presenta manifiestos comentados con probes, límites y prueba de rollout, sus pruebas y las fuentes consultadas: kubernetes.io/docs/concepts/.

**Cierre del bloque:** ejecuta una revisión integrada de los retos, registra dependencias entre entregables y describe un fallo que atraviese más de un tema.

## Bloque 9: Infraestructura como código

**Caso integrador:** provisionar infraestructura local/cloud de forma revisable. Entrega un incremento que use HCL, providers, variables, outputs, state, backend remoto, módulos y lifecycle y alcance «módulo pequeño con backend documentado y plan revisado».

### Reto 9.1: Terraform y OpenTofu

1. **Construye:** resuelve ejecutar fmt/validate/plan y destruir únicamente recursos de sandbox para el escenario «provisionar infraestructura local/cloud de forma revisable».
2. **Diagnostica:** reproduce «editar state manualmente o ejecutar apply sin revisar el plan», explica la causa y demuestra la corrección.
3. **Justifica:** muestra cómo HCL, providers, variables, outputs, state, backend remoto, módulos y lifecycle se conecta con cloud local, CI/CD, secretos y control de cambios; compara una alternativa.
4. **Entrega:** presenta módulo pequeño con backend documentado y plan revisado, sus pruebas y las fuentes consultadas: developer.hashicorp.com/terraform/docs y opentofu.org/docs.

**Cierre del bloque:** ejecuta una revisión integrada de los retos, registra dependencias entre entregables y describe un fallo que atraviese más de un tema.

## Bloque 10: Cloud local

**Caso integrador:** probar S3, SQS, SNS, Lambda y DynamoDB sin una cuenta cloud. Entrega un incremento que use StackPort, AWS CLI local, endpoints 4566/4577/4588 y credenciales test/test en us-east-1 y alcance «laboratorio local repetible con teardown y límites anotados».

### Reto 10.1: Cloud local con LocalStack y Floci

1. **Construye:** resuelve crear bucket y cola, enviar mensaje y comprobar estado/puerto del emulador para el escenario «probar S3, SQS, SNS, Lambda y DynamoDB sin una cuenta cloud».
2. **Diagnostica:** reproduce «usar credenciales de laboratorio contra nube real o asumir paridad completa», explica la causa y demuestra la corrección.
3. **Justifica:** muestra cómo StackPort, AWS CLI local, endpoints 4566/4577/4588 y credenciales test/test en us-east-1 se conecta con Docker, SDKs cloud, mensajería y pruebas; compara una alternativa.
4. **Entrega:** presenta laboratorio local repetible con teardown y límites anotados, sus pruebas y las fuentes consultadas: README/guía oficial del emulador y AWS CLI Command Reference.

**Cierre del bloque:** ejecuta una revisión integrada de los retos, registra dependencias entre entregables y describe un fallo que atraviese más de un tema.

## Bloque 11: Frontend Angular

**Caso integrador:** construir un tablero de tracking reactivo que mantenga loading/data/error coherentes. Entrega un incremento que use standalone, Signals/httpResource/computed/effect, OnPush, @if/@for, Signal Forms, Router, SSR y zoneless y alcance «spike aislado con riesgos, dispositivos y alternativa web documentados».

### Reto 11.1: Angular moderno y Angular 22

1. **Construye:** resuelve medir render, probar error/cancelación y validar navegación/formulario para el escenario «construir un tablero de tracking reactivo que mantenga loading/data/error coherentes».
2. **Diagnostica:** reproduce «mezclar Angular 22 sin verificar APIs disponibles o derivar estado con effects», explica la causa y demuestra la corrección.
3. **Justifica:** muestra cómo standalone, Signals/httpResource/computed/effect, OnPush, @if/@for, Signal Forms, Router, SSR y zoneless se conecta con REST, accesibilidad y rendimiento; compara una alternativa.
4. **Entrega:** presenta feature Angular con estados HTTP discriminados, pruebas y render medido, sus pruebas y las fuentes consultadas: angular.dev/essentials; angular.dev/guide/http y notas oficiales de Angular 22; angular.dev/best-practices/skipping-subtrees y guía oficial Angular 22.

### Reto 11.2: Angular Native

1. **Construye:** resuelve verificar matriz de compatibilidad, render nativo, navegación y módulos puente para el escenario «evaluar una UI móvil nativa desde una base Angular».
2. **Diagnostica:** reproduce «presentar una integración Alpha como opción estable de producción», explica la causa y demuestra la corrección.
3. **Justifica:** muestra cómo Angular Native, React Native Fabric y Expo según estado Alpha del ecosistema se conecta con Angular, React Native, accesibilidad y ciclo móvil; compara una alternativa.
4. **Entrega:** presenta spike aislado con riesgos, dispositivos y alternativa web documentados, sus pruebas y las fuentes consultadas: repositorio y documentación primaria de Angular Native/Expo/React Native.

**Cierre del bloque:** ejecuta una revisión integrada de los retos, registra dependencias entre entregables y describe un fallo que atraviese más de un tema.

## Bloque 12: Frontend React

**Caso integrador:** renderizar una página pública de tracking y una vista de cliente. Entrega un incremento que use componentes, hooks, estado, Context, hooks propios, fetching, SSR/SSG/ISR y App Router y alcance «página con límites server/client y estrategia SSR/SSG justificada».

### Reto 12.1: React y Next.js

1. **Construye:** resuelve trazar render y fetching en server/client y medir hydration para el escenario «renderizar una página pública de tracking y una vista de cliente».
2. **Diagnostica:** reproduce «llamar a hooks condicionalmente o compartir datos sensibles en HTML público», explica la causa y demuestra la corrección.
3. **Justifica:** muestra cómo componentes, hooks, estado, Context, hooks propios, fetching, SSR/SSG/ISR y App Router se conecta con APIs, estado, accesibilidad y despliegue; compara una alternativa.
4. **Entrega:** presenta página con límites server/client y estrategia SSR/SSG justificada, sus pruebas y las fuentes consultadas: react.dev/learn y nextjs.org/docs.

**Cierre del bloque:** ejecuta una revisión integrada de los retos, registra dependencias entre entregables y describe un fallo que atraviese más de un tema.

## Bloque 13: Desarrollo móvil

**Caso integrador:** mostrar posición y estado de una entrega en Android. Entrega un incremento que use coroutines, Flow, Room, Hilt, ViewModel, navegación y Retrofit/Ktor y alcance «feature con estado explícito, tests y datos offline controlados».

### Reto 13.1: Android con Kotlin y Jetpack Compose

1. **Construye:** resuelve simular rotación, proceso recreado y red desconectada para el escenario «mostrar posición y estado de una entrega en Android».
2. **Diagnostica:** reproduce «lanzar trabajo largo en main o acoplar UI directamente al repositorio», explica la causa y demuestra la corrección.
3. **Justifica:** muestra cómo coroutines, Flow, Room, Hilt, ViewModel, navegación y Retrofit/Ktor se conecta con HTTP, permisos, persistencia y backend; compara una alternativa.
4. **Entrega:** presenta feature Compose con estado restaurable, Room y pruebas, sus pruebas y las fuentes consultadas: developer.android.com/courses/android-basics-compose.

### Reto 13.2: Kotlin Multiplatform

1. **Construye:** resuelve compartir una regla pura y mantener GPS/notificaciones en implementaciones específicas para el escenario «compartir reglas de cálculo entre cliente Android e iOS».
2. **Diagnostica:** reproduce «compartir abstracciones de UI o API nativas sin comprobar compatibilidad», explica la causa y demuestra la corrección.
3. **Justifica:** muestra cómo lógica compartida, source sets, expect/actual y límites de plataforma se conecta con Kotlin, Android, Swift e interoperabilidad; compara una alternativa.
4. **Entrega:** presenta módulo común probado y matriz explícita de capacidades por plataforma, sus pruebas y las fuentes consultadas: kotlinlang.org/docs/multiplatform/.

### Reto 13.3: iOS con SwiftUI

1. **Construye:** resuelve provocar respuestas asíncronas fuera de orden y proteger estado de UI para el escenario «crear una pantalla de entrega observable y segura ante concurrencia».
2. **Diagnostica:** reproduce «forzar unwrap de optionals o actualizar UI desde contexto no principal», explica la causa y demuestra la corrección.
3. **Justifica:** muestra cómo optionals, value types, State/Binding/Observable, lifecycle, async/await, actors, SwiftData, navegación y MainActor se conecta con servicios HTTP, permisos y concurrencia estructurada; compara una alternativa.
4. **Entrega:** presenta feature SwiftUI con estados vacíos/error, persistencia local y tests, sus pruebas y las fuentes consultadas: developer.apple.com/tutorials/swiftui.

### Reto 13.4: Flutter

1. **Construye:** resuelve simular permiso denegado, socket caído y reconexión con caché para el escenario «mostrar entregas en mapa con ubicación y eventos en tiempo real».
2. **Diagnostica:** reproduce «mover lógica de negocio a build() o filtrar errores de socket», explica la causa y demuestra la corrección.
3. **Justifica:** muestra cómo widget tree, Stateless/Stateful, Riverpod/Provider/BLoC, navegación, Dio, Maps, sockets y almacenamiento se conecta con backend, permisos de plataforma, mapas y observabilidad; compara una alternativa.
4. **Entrega:** presenta feature con estado explícito, tests y datos offline controlados, sus pruebas y las fuentes consultadas: docs.flutter.dev/learn.

**Cierre del bloque:** ejecuta una revisión integrada de los retos, registra dependencias entre entregables y describe un fallo que atraviese más de un tema.

## Bloque 14: Git y control de versiones

**Caso integrador:** colaborar en una modificación urgente del flujo de pedidos. Entrega un incremento que use commit, branch, merge/rebase, conflictos, PR, trunk-based, tags y releases y alcance «historial revisable con PR, tests, tag y notas de release».

### Reto 14.1: Git y control de versiones

1. **Construye:** resuelve resolver un conflicto con intención y etiquetar un release reproducible para el escenario «colaborar en una modificación urgente del flujo de pedidos».
2. **Diagnostica:** reproduce «forzar push a rama compartida o reescribir historia publicada sin acuerdo», explica la causa y demuestra la corrección.
3. **Justifica:** muestra cómo commit, branch, merge/rebase, conflictos, PR, trunk-based, tags y releases se conecta con CI, revisión de código y colaboración; compara una alternativa.
4. **Entrega:** presenta historial revisable con PR, tests, tag y notas de release, sus pruebas y las fuentes consultadas: git-scm.com/book/en/v2.

**Cierre del bloque:** ejecuta una revisión integrada de los retos, registra dependencias entre entregables y describe un fallo que atraviese más de un tema.

## Bloque 15: Testing y clientes API

**Caso integrador:** prevenir regresión en reglas de negocio y adaptadores externos. Entrega un incremento que use JUnit, Mockito, MockMvc, Testcontainers, TDD/BDD, pirámide y cobertura y alcance «ADR con casos de uso, coste de migración y repositorio sin secretos».

### Reto 15.1: Testing de software

1. **Construye:** resuelve seguir rojo-verde-refactor y añadir integración real con dependencia aislada para el escenario «prevenir regresión en reglas de negocio y adaptadores externos».
2. **Diagnostica:** reproduce «confundir cobertura alta con detección de defectos o mockear todo», explica la causa y demuestra la corrección.
3. **Justifica:** muestra cómo JUnit, Mockito, MockMvc, Testcontainers, TDD/BDD, pirámide y cobertura se conecta con Java, Spring, CI y diagnóstico; compara una alternativa.
4. **Entrega:** presenta suite por riesgo con tests rápidos e integración representativa, sus pruebas y las fuentes consultadas: junit.org/junit5/docs/current/user-guide/ y testcontainers.com.

### Reto 15.2: Postman vs Bruno

1. **Construye:** resuelve migrar una colección pequeña y comparar scripts, colaboración y diffs para el escenario «elegir un cliente API para un equipo con colecciones versionadas».
2. **Diagnostica:** reproduce «elegir solo por interfaz o subir tokens en archivos de entorno», explica la causa y demuestra la corrección.
3. **Justifica:** muestra cómo local-first, Git-native, secretos, colaboración y compatibilidad de colecciones se conecta con API testing, Git y automatización CI; compara una alternativa.
4. **Entrega:** presenta ADR con casos de uso, coste de migración y repositorio sin secretos, sus pruebas y las fuentes consultadas: learning.postman.com/docs y docs.usebruno.com.

**Cierre del bloque:** ejecuta una revisión integrada de los retos, registra dependencias entre entregables y describe un fallo que atraviese más de un tema.

## Bloque 16: Patrones de diseño y arquitectura

**Caso integrador:** cambiar reglas de una plataforma logística sin reescribir su núcleo. Entrega un incremento que use SRP, OCP, LSP, ISP y DIP; cada principio con ejemplo incorrecto/correcto y reflejo en Spring y alcance «catálogo de síntomas, consecuencias, señales y plan de salida verificable».

### Reto 16.1: SOLID

1. **Construye:** resuelve refactorizar una clase God-like principio por principio y mostrar pruebas antes/después para el escenario «cambiar reglas de una plataforma logística sin reescribir su núcleo».
2. **Diagnostica:** reproduce «convertir SOLID en receta de interfaces por clase o ignorar el coste de abstracción», explica la causa y demuestra la corrección.
3. **Justifica:** muestra cómo SRP, OCP, LSP, ISP y DIP; cada principio con ejemplo incorrecto/correcto y reflejo en Spring se conecta con POO, DI, Strategy, Adapter y arquitectura hexagonal; compara una alternativa.
4. **Entrega:** presenta diagrama y diff de refactorización con ejemplos positivos/negativos ejecutables, sus pruebas y las fuentes consultadas: objectmentor.com/resources/articles/Principles_and_Patterns.pdf; docs.spring.io; web/public/content/java/modulo-12.md; web/public/content/spring-boot/modulo-15.md.

### Reto 16.2: Patrones creacionales

1. **Construye:** resuelve ejecutar cada variante/fábrica con salida esperada y comparar composición, concurrencia y testabilidad para el escenario «crear notificadores y pedidos válidos para canales y configuraciones variables».
2. **Diagnostica:** reproduce «usar Singleton global para estado mutable o construir fábricas sin variación real», explica la causa y demuestra la corrección.
3. **Justifica:** muestra cómo Singleton Eager/Lazy/Synchronized/DCL/Enum, Factory Method, Abstract Factory, Builder y Prototype se conecta con SOLID, inmutabilidad, DI y patrones estructurales; compara una alternativa.
4. **Entrega:** presenta ejemplos Java ejecutables para 5 variantes Singleton y 4 patrones creacionales, sus pruebas y las fuentes consultadas: refactoring.guru/design-patterns/creational-patterns; examples/java/patrones-rutaflow/CreationalPatternsDemo.java.

### Reto 16.3: Patrones estructurales

1. **Construye:** resuelve envolver un SDK de pago legacy con Adapter y añadir logging con Decorator para el escenario «integrar una pasarela legacy sin cambiar el contrato del dominio».
2. **Diagnostica:** reproduce «apilar capas sin necesidad o usar Proxy y Adapter con intenciones indistinguibles», explica la causa y demuestra la corrección.
3. **Justifica:** muestra cómo Adapter, Decorator, Facade, Composite, Proxy y Bridge se conecta con SOLID, Factory, microservicios y boundaries; compara una alternativa.
4. **Entrega:** presenta seis ejemplos Java ejecutables con estructura, salida, coste y alternativa, sus pruebas y las fuentes consultadas: refactoring.guru/design-patterns/structural-patterns; examples/java/patrones-rutaflow/StructuralPatternsDemo.java.

### Reto 16.4: Patrones de comportamiento

1. **Construye:** resuelve modelar el ciclo de pedido con State y emitir observers desacoplados, comparando con eventos Spring/Kafka para el escenario «desacoplar cambios de pedidos, políticas y pasos de procesamiento».
2. **Diagnostica:** reproduce «usar herencia para cada variación o ignorar orden, concurrencia y ciclo de vida», explica la causa y demuestra la corrección.
3. **Justifica:** muestra cómo Observer, Strategy, Command, Template Method, Chain, State, Iterator, Mediator, Memento y Visitor se conecta con Spring Events, Kafka, SOLID y patrones de arquitectura; compara una alternativa.
4. **Entrega:** presenta diez ejemplos Java completos con main, salida y ejercicio incremental, sus pruebas y las fuentes consultadas: refactoring.guru/design-patterns/behavioral-patterns; examples/java/patrones-rutaflow/BehavioralPatternsDemo.java.

### Reto 16.5: Patrones de arquitectura

1. **Construye:** resuelve construir un ejemplo ejecutable de Outbox y contrastar 4 servicios/gateway frente a un monolito modular para el escenario «evolucionar RutaFlow desde una app única a límites de dominio justificados».
2. **Diagnostica:** reproduce «distribuir servicios sin autonomía de datos o introducir event sourcing sin requisito de historial», explica la causa y demuestra la corrección.
3. **Justifica:** muestra cómo Monolith, Modular Monolith, Microservices, EDA, Hexagonal, Clean, CQRS, Event Sourcing, Saga, Outbox, Gateway, BFF, Serverless, Layered, Pipeline, Space-Based y Microkernel se conecta con DDD, base de datos, eventos, seguridad y operación; compara una alternativa.
4. **Entrega:** presenta catálogo comparativo con ejemplos/runnable skeletons y decisiones explícitas para cada patrón, sus pruebas y las fuentes consultadas: martinfowler.com/architecture/; microservices.io/patterns/; web/public/content/spring-boot/modulo-10.md; modulo-12.md; modulo-15.md; modulo-21.md.

### Reto 16.6: Principios de arquitectura

1. **Construye:** resuelve evaluar tres decisiones contra contexto y documentar cuándo un principio entra en tensión con otro para el escenario «revisar una solución que ya tiene requisitos, usuarios y límites cambiantes».
2. **Diagnostica:** reproduce «aplicar DRY creando abstracciones antes de conocer variaciones o tratar 12-factor como arquitectura completa», explica la causa y demuestra la corrección.
3. **Justifica:** muestra cómo SOLID, DRY/KISS/YAGNI, Demeter, Hollywood, separation, cohesion/coupling, idempotency, stateless/stateful y 12-Factor se conecta con Clean Architecture, microservices y operación cloud; compara una alternativa.
4. **Entrega:** presenta checklist razonada con ADR y ejemplo donde no aplicar una regla sería mejor, sus pruebas y las fuentes consultadas: 12factor.net; martinfowler.com/bliki/.

### Reto 16.7: Anti-patrones

1. **Construye:** resuelve identificar causa observable y escoger una refactorización incremental con test de regresión para el escenario «diagnosticar degradación de un servicio antes de multiplicar excepciones y parches».
2. **Diagnostica:** reproduce «usar etiquetas para juzgar código sin contexto o intentar una reescritura big-bang», explica la causa y demuestra la corrección.
3. **Justifica:** muestra cómo God Object, Spaghetti, Big Ball of Mud, Lava Flow, Golden Hammer, premature optimization, copy-paste, Singleton misuse, Anemic Domain y Distributed Monolith se conecta con SOLID, métricas, refactoring y microservicios; compara una alternativa.
4. **Entrega:** presenta catálogo de síntomas, consecuencias, señales y plan de salida verificable, sus pruebas y las fuentes consultadas: martinfowler.com/bliki/AntiPattern.html; refactoring.guru.

**Cierre del bloque:** ejecuta una revisión integrada de los retos, registra dependencias entre entregables y describe un fallo que atraviese más de un tema.

## Bloque 17: Algoritmos y estructuras de datos

**Caso integrador:** calcular una ruta para repartidores y justificar coste frente a tamaño del grafo. Entrega un incremento que use Big-O, búsqueda/ordenamiento, BFS/DFS, Dijkstra, hash/tree/graph y dynamic programming y alcance «suite comparativa con grafos de prueba, correctitud y rendimiento».

### Reto 17.1: Algoritmos y estructuras de datos

1. **Construye:** resuelve implementar y visualizar búsqueda, ordenamiento y Dijkstra con casos y métricas para el escenario «calcular una ruta para repartidores y justificar coste frente a tamaño del grafo».
2. **Diagnostica:** reproduce «usar Dijkstra con pesos negativos o medir complejidad solo con un ejemplo pequeño», explica la causa y demuestra la corrección.
3. **Justifica:** muestra cómo Big-O, búsqueda/ordenamiento, BFS/DFS, Dijkstra, hash/tree/graph y dynamic programming se conecta con colecciones Java, mapas, persistencia y logística; compara una alternativa.
4. **Entrega:** presenta suite comparativa con grafos de prueba, correctitud y rendimiento, sus pruebas y las fuentes consultadas: visualgo.net y Python docs.

**Cierre del bloque:** ejecuta una revisión integrada de los retos, registra dependencias entre entregables y describe un fallo que atraviese más de un tema.

## Bloque 18: Herramientas de desarrollo

**Caso integrador:** elegir y usar herramientas sin ejecutar cambios irreversibles a ciegas. Entrega un incremento que use VS Code, WinUtil, Manim/ManimGX, Exercism, CodeCademy/Codedden* y QuickRef y alcance «perfil editor documentado, ejercicios fechados y escena renderizada con versión fijada».

### Reto 18.1: Herramientas de desarrollo

1. **Construye:** resuelve resolver un ejercicio en plataforma, generar un quick reference y renderizar una visualización tras verificar la API para el escenario «elegir y usar herramientas sin ejecutar cambios irreversibles a ciegas».
2. **Diagnostica:** reproduce «confiar en nombre dudoso de producto o ejecutar herramienta elevada sin revisar cambios», explica la causa y demuestra la corrección.
3. **Justifica:** muestra cómo VS Code, WinUtil, Manim/ManimGX, Exercism, CodeCademy/Codedden* y QuickRef se conecta con Git, práctica deliberada, algoritmos y documentación; compara una alternativa.
4. **Entrega:** presenta perfil editor documentado, ejercicios fechados y escena renderizada con versión fijada, sus pruebas y las fuentes consultadas: code.visualstudio.com/docs; exercism.org; docs.manim.community; revisar nombre y disponibilidad de plataforma citada.

**Cierre del bloque:** ejecuta una revisión integrada de los retos, registra dependencias entre entregables y describe un fallo que atraviese más de un tema.

## Bloque 19: IA aplicada al estudio

**Caso integrador:** aprender un tema técnico y demostrar dominio sin fingir autoría. Entrega un incremento que use prompting por fases, roadmap progresivo, revisión de tono y riesgos de fabricación de tesis y alcance «plan verificado, notas propias y declaración de asistencia IA».

### Reto 19.1: IA aplicada al estudio

1. **Construye:** resuelve usar IA para elaborar preguntas, verificar con fuentes y responderlas con evidencia propia para el escenario «aprender un tema técnico y demostrar dominio sin fingir autoría».
2. **Diagnostica:** reproduce «presentar texto generado como tesis/datos/trabajo no realizado o enviar datos privados», explica la causa y demuestra la corrección.
3. **Justifica:** muestra cómo prompting por fases, roadmap progresivo, revisión de tono y riesgos de fabricación de tesis se conecta con metacognición, investigación, ética y documentación; compara una alternativa.
4. **Entrega:** presenta plan verificado, notas propias y declaración de asistencia IA, sus pruebas y las fuentes consultadas: fuentes primarias del dominio y política de integridad académica local.

**Cierre del bloque:** ejecuta una revisión integrada de los retos, registra dependencias entre entregables y describe un fallo que atraviese más de un tema.

## Bloque 20: Proyecto integrador RutaFlow

**Caso integrador:** seguir una entrega desde un sensor/móvil hasta el cliente con trazabilidad. Entrega un incremento que use Flutter, Spring Boot, MySQL espacial, Kafka, JWT, Socket.IO, QA Postman/Newman/Jenkins, PostgreSQL, Docker/K8s/CI/IaC/LocalStack, Angular Signals; Repository, Observer, Strategy, Saga, Outbox y API Gateway y alcance «demo con contrato, pruebas, trazas, modelo geoespacial y escena arquitectónica».

### Reto 20.1: RutaFlow: plataforma logística IoT

1. **Construye:** resuelve entregar el flujo incremental de alta, ubicación, notificación, batch de conciliación, prueba y despliegue para el escenario «seguir una entrega desde un sensor/móvil hasta el cliente con trazabilidad».
2. **Diagnostica:** reproduce «construir un monolito distribuido en carpetas sin propiedad clara de datos ni observabilidad», explica la causa y demuestra la corrección.
3. **Justifica:** muestra cómo Flutter, Spring Boot, MySQL espacial, Kafka, JWT, Socket.IO, QA Postman/Newman/Jenkins, PostgreSQL, Docker/K8s/CI/IaC/LocalStack, Angular Signals; Repository, Observer, Strategy, Saga, Outbox y API Gateway se conecta con los 19 bloques anteriores; integrar por cortes verticales con hipótesis verificables; compara una alternativa.
4. **Entrega:** presenta demo con contrato, pruebas, trazas, modelo geoespacial y escena arquitectónica, sus pruebas y las fuentes consultadas: examples/rutaflow/README.md y documentación oficial citada en cada bloque.

**Cierre del bloque:** ejecuta una revisión integrada de los retos, registra dependencias entre entregables y describe un fallo que atraviese más de un tema.

## Proyecto final: RutaFlow

Construye por cortes verticales una plataforma demostrable de seguimiento de envíos. El proyecto debe conectar una aplicación móvil, API Spring Boot, persistencia con consulta espacial, publicación de eventos Kafka, cliente web, automatización QA y despliegue local.

### Entregables obligatorios

1. **Contrato y arquitectura:** diagrama C4/flujo, límites de dominio, API versionada, ADR monolito modular frente a microservicios y dirección de dependencias.
2. **Flujo funcional:** crear envío, validar ubicación, persistirla, consultar historial y notificar un cambio de estado a un cliente.
3. **Datos y eventos:** migraciones, estrategia LAZY/fetch plan por caso de uso, evento con clave estable, consumidor idempotente, Outbox explicado y manejo demostrable de duplicado/DLT.
4. **Seguridad y calidad:** autenticación/autorización, datos de prueba, pruebas unitarias, integración, contrato y colección ejecutable en CI; no subir secretos.
5. **Operación:** Docker Compose local, health/readiness, logs correlacionados, métricas, trazas, backup/restore probado y procedimiento documentado de recuperación.
6. **Evidencia:** instrucciones de arranque desde una copia limpia, comandos, salidas esperadas, fallos deliberados, resultados medidos, límites conocidos y demo grabable.

### Rúbrica final

| Criterio | Evidencia mínima |
|---|---|
| Corrección | El flujo completo funciona; validaciones y transiciones inválidas tienen pruebas. |
| Diseño | Los límites y patrones resuelven necesidades demostradas y explican cuándo no aplicarlos. |
| Resiliencia | Reintento, duplicado, indisponibilidad y recuperación se prueban sin éxito silencioso. |
| Seguridad y privacidad | Permisos comprobados, secretos fuera del repositorio y datos sensibles redactados. |
| Operabilidad | Build repetible, CI, observabilidad, backup/restore y guía de respuesta verificables. |
| Aprendizaje | La persona puede reconstruir decisiones, diagnosticar un fallo y enseñar la solución. |

La puntuación final se calcula con la rúbrica de seis criterios (0–3 cada uno). Para aprobar se requieren 14/18 puntos y al menos 2 en corrección, seguridad y operabilidad. Un entregable no demostrado no se sustituye por una explicación de lo que se habría hecho.
