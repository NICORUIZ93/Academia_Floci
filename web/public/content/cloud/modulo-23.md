# Módulo 23: Caché en memoria con ElastiCache

## Sílabo

**Objetivo general**

Entender para qué sirve un caché en memoria distribuido, crear un clúster ElastiCache respaldado por un contenedor Valkey/Redis real en Floci, conectarte a él con un cliente Redis estándar, y aplicar el patrón cache-aside para reducir carga sobre una base de datos.

**Objetivos específicos**

1. Explicar cuándo un caché en memoria mejora el rendimiento de una aplicación y cuándo no.
2. Crear un grupo de réplicas ElastiCache y obtener su puerto de conexión real.
3. Leer y escribir datos con `redis-cli` contra el clúster.
4. Crear un usuario ElastiCache con autenticación IAM y validar un token de acceso.

**Contenido**

- Qué resuelve un caché en memoria y el patrón cache-aside.
- Arquitectura de ElastiCache en Floci: contenedores Valkey/Redis reales y proxy TCP.
- Creación de clústeres y conexión con clientes Redis estándar.
- Autenticación IAM para el plano de datos.

**Evaluación**

Un laboratorio práctico (crear un clúster, leer/escribir con redis-cli, y crear un usuario con autenticación IAM) y tres ejercicios de evaluación.

---

## Contenido teórico

### Tema 1: Qué resuelve un caché en memoria — y cuándo no ayuda

**Conceptos clave:** latencia de lectura, cache-aside, cache hit / cache miss, TTL.

Una base de datos como RDS o DynamoDB, por bien indexada que esté, sigue siendo más lenta que leer un valor directamente desde memoria RAM: una consulta a RDS puede tardar varios milisegundos, mientras que una lectura en Redis/Valkey típicamente tarda menos de un milisegundo. Cuando una aplicación consulta el mismo dato con mucha frecuencia y ese dato no cambia todo el tiempo —el perfil de un usuario, el catálogo de productos, un conteo de "me gusta"—, guardarlo en un caché en memoria evita repetir la consulta costosa una y otra vez.

El patrón más común para usar un caché es cache-aside: la aplicación primero pregunta al caché (`GET`), y si el dato no está ahí (cache miss), lo busca en la base de datos, lo guarda en el caché con un tiempo de vida (TTL) y lo devuelve; la siguiente vez que alguien pida el mismo dato dentro de ese TTL, el caché lo devuelve directamente (cache hit) sin tocar la base de datos. Un caché no ayuda —y puede incluso complicar— cuando los datos cambian constantemente y necesitas leer siempre el valor más reciente sin ninguna tolerancia a datos ligeramente desactualizados: en ese caso, la complejidad de mantener el caché sincronizado no compensa la ganancia de velocidad.

**Analogía:** un caché en memoria es como tener las respuestas a las preguntas más frecuentes anotadas en una pizarra junto a tu escritorio: para esas preguntas no necesitas ir a la biblioteca (la base de datos) cada vez, pero si la respuesta cambia, tienes que acordarte de actualizar la pizarra o alguien recibirá una respuesta vieja.

**¿Por qué es importante?** Saber reconocer cuándo un problema es "de lectura repetida sobre datos que cambian poco" —el caso ideal para caché— frente a "de datos que cambian todo el tiempo" es la decisión de diseño más importante antes de añadir esta pieza a una arquitectura, más importante que cualquier detalle de configuración.

### Tema 2: Arquitectura de ElastiCache en Floci — contenedores reales, no simulación

**Conceptos clave:** contenedor Valkey/Redis real, proxy TCP, `CreateReplicationGroup`.

A diferencia de servicios donde Floci simula el comportamiento en proceso, ElastiCache gestiona contenedores Docker reales de Valkey (el fork open-source de Redis) y expone conexiones proxy TCP hacia ellos: cuando llamas a `CreateReplicationGroup`, Floci realmente lanza un contenedor `valkey/valkey:8` y lo conecta a un puerto del host dentro del rango configurado (por defecto 6379–6399, el mismo rango de puertos que usa Redis por convención). El resultado es que cualquier cliente Redis estándar —`redis-cli`, la librería de Redis en tu lenguaje favorito— funciona sin ninguna adaptación especial, porque estás hablando el protocolo RESP real contra un servidor Redis/Valkey real.

Esto tiene una implicación práctica directa: todo lo que sabes sobre comandos de Redis (`SET`, `GET`, `EXPIRE`, `INCR`, estructuras de datos como listas o hashes) funciona exactamente igual aquí que contra un ElastiCache real en AWS, porque el motor subyacente es el mismo software, solo que corriendo en tu máquina en vez de en la infraestructura de AWS.

**Analogía:** ElastiCache en Floci es como practicar con el mismo modelo de instrumento musical que usarás en el concierto real, solo que ensayando en tu casa en vez de en la sala de conciertos: la técnica que desarrollas se transfiere directamente.

**¿Por qué es importante?** Que el motor sea real —no una reimplementación aproximada del protocolo Redis— es lo que garantiza que comandos avanzados, estructuras de datos complejas y comportamientos de expiración se comporten exactamente igual que en producción, sin sorpresas al migrar.

### Tema 3: Creación de clústeres y conexión con clientes estándar

**Conceptos clave:** `CreateReplicationGroup`, `DescribeReplicationGroups`, puerto de conexión dinámico.

Crear un clúster es una sola llamada: `CreateReplicationGroup` con un identificador y una descripción arranca el contenedor Valkey correspondiente. El puerto real de conexión no lo eliges tú directamente: se lo pides a Floci con `DescribeReplicationGroups`, que devuelve el `PrimaryEndpoint.Port` asignado dentro del rango configurado — el mismo patrón de "no asumas el puerto, pregúntalo" que ya viste con otros servicios de Floci respaldados por contenedores reales, como Neptune o RDS. Una vez que tienes el puerto, te conectas con cualquier cliente Redis estándar apuntando a `localhost:<puerto>`.

Eliminar el clúster (`DeleteReplicationGroup`) detiene y elimina el contenedor Docker subyacente, liberando el puerto para futuros clústeres. Como con cualquier caché, recuerda que los datos en modo memoria desaparecen al eliminar el clúster — si necesitas persistencia entre reinicios, ese es un caso de uso distinto (bases de datos) más que de caché.

**Analogía:** pedir el puerto de conexión con `DescribeReplicationGroups` es como preguntar en recepción "¿en qué habitación me hospedé?" en vez de asumir que siempre es la misma: cada clúster nuevo puede terminar en un número de puerto distinto dentro del rango disponible.

**¿Por qué es importante?** Este patrón de "no hardcodees el puerto, consúltalo" es exactamente el que necesitas para escribir código de aplicación robusto que no se rompa si en algún momento cambia la configuración de rango de puertos de tu entorno de Floci.

### Tema 4: Autenticación IAM para el plano de datos de ElastiCache

**Conceptos clave:** usuario ElastiCache, cadena de acceso (access string), `ValidateIamAuthToken`.

ElastiCache moderno soporta autenticación basada en IAM, no solo contraseñas estáticas: creas un usuario con `CreateUser`, especificando una cadena de acceso al estilo RBAC de Redis (por ejemplo, `"on ~* +@all"` para acceso total a todas las claves y comandos), y luego los clientes generan un token de autenticación IAM temporal en vez de usar una contraseña fija almacenada en configuración. Floci implementa `ValidateIamAuthToken` para verificar esos tokens exactamente con la misma lógica que el ElastiCache real, lo que te permite practicar este patrón de autenticación más seguro —sin secretos de larga duración— sin necesidad de una cuenta AWS real.

Este es el mismo principio de seguridad que ya viste con roles IAM para Lambda o EC2: preferir credenciales temporales derivadas de identidad sobre contraseñas estáticas que alguien podría filtrar accidentalmente en un repositorio de código.

**Analogía:** un usuario ElastiCache con auth IAM es como un guardia de seguridad que en vez de pedirte una llave física que podrías perder o prestar, verifica tu identificación institucional vigente en el momento — mucho más difícil de robar o reutilizar indebidamente.

**¿Por qué es importante?** Adoptar autenticación IAM en vez de contraseñas de Redis hardcodeadas es una de las mejoras de seguridad más directas que puedes aplicar a una arquitectura de caché en producción real.

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

> Este laboratorio asume que ya ejecutaste `floci start` y `eval $(floci env)` (Módulo 1) en tu sesión de terminal, así que los comandos de `aws` no repiten `--endpoint-url`.

**Objetivo del laboratorio:** crear un clúster ElastiCache, conectarte con `redis-cli`, practicar el patrón cache-aside con `SET`/`GET`/`EXPIRE`, y crear un usuario con autenticación IAM.

**Requisitos previos:** Floci corriendo con el rango de puertos de ElastiCache expuesto (`"6379-6399:6379-6399"` en tu `docker-compose.yml`) y el socket Docker montado. Necesitas `redis-cli` instalado localmente (se incluye con la mayoría de instalaciones de Redis/Valkey, o vía `brew install redis` / `apt install redis-tools`).

### Laboratorio 23.1 — Clúster ElastiCache con cache-aside

| Paso | Acción | Comando | Explicación | Salida esperada |
|---|---|---|---|---|
| 1 | Crea el clúster | `aws elasticache create-replication-group --replication-group-id mi-cache --replication-group-description "Cache del curso"` | Lanza un contenedor Valkey real | Un `ReplicationGroupId` con estado `creating` |
| 2 | Obtén el puerto de conexión | `aws elasticache describe-replication-groups --replication-group-id mi-cache --query 'ReplicationGroups[0].NodeGroups[0].PrimaryEndpoint.Port' --output text` | El puerto real asignado dentro del rango configurado | Un número de puerto, ej. `6379` |
| 3 | Verifica la conexión | `redis-cli -h localhost -p <puerto> ping` | Confirma que el servidor Valkey responde | `PONG` |
| 4 | Simula un cache miss y guarda el resultado | `redis-cli -h localhost -p <puerto> set usuario:1 '{"nombre":"Ana"}' EX 60` | Guarda un valor con TTL de 60 segundos, como haría tu app tras consultar la base de datos | `OK` |
| 5 | Simula un cache hit | `redis-cli -h localhost -p <puerto> get usuario:1` | Lee el valor sin tocar ninguna base de datos | El JSON guardado en el paso anterior |
| 6 | Verifica la expiración | `redis-cli -h localhost -p <puerto> ttl usuario:1` | Confirma cuántos segundos quedan antes de que el valor expire | Un número menor o igual a 60 |

### Laboratorio 23.2 — Usuario con autenticación IAM

| Paso | Acción | Comando | Explicación | Salida esperada |
|---|---|---|---|---|
| 1 | Crea un usuario ElastiCache | `aws elasticache create-user --user-id alice --user-name alice --engine redis --access-string "on ~* +@all" --no-no-password-required` | Crea un usuario habilitado para autenticación IAM en vez de contraseña fija | Un `UserId` confirmado |
| 2 | Lista los usuarios | `aws elasticache describe-users` | Confirma la cadena de acceso configurada | El usuario `alice` con `AccessString: "on ~* +@all"` |

**Verificación:** el laboratorio se considera exitoso si `redis-cli ping` devuelve `PONG` contra el puerto real reportado por `describe-replication-groups`, el valor guardado con `SET ... EX 60` se recupera correctamente con `GET`, y `describe-users` confirma la creación del usuario `alice` con la cadena de acceso configurada.

**Errores comunes y soluciones**

- **`redis-cli` no puede conectar (`Connection refused`).** El rango de puertos `6379-6399` no está expuesto en tu `docker-compose.yml`, o estás usando el puerto por defecto 6379 en vez del que realmente devolvió `describe-replication-groups`.
- **`CreateReplicationGroup` se queda en estado `creating` indefinidamente.** El socket Docker no está montado (`-v /var/run/docker.sock:/var/run/docker.sock`); sin él, Floci no puede lanzar el contenedor Valkey real.
- **El valor desaparece antes de lo esperado.** Revisaste el TTL con `TTL` y confirmaste que expiró correctamente: eso es el comportamiento esperado de `EX`, no un error — ajusta el tiempo de vida si necesitas que dure más.

---

## Ejercicios de evaluación

### Ejercicio 1: Cuándo SÍ y cuándo NO usar caché

**Enunciado:** para cada uno de estos tres casos, decide si un caché en memoria ayudaría y justifica por qué: (a) el catálogo de productos de una tienda, que cambia una vez al día; (b) el saldo de una cuenta bancaria, que debe reflejar siempre el valor exacto más reciente; (c) el conteo de visualizaciones de un video, donde un pequeño retraso es aceptable.

**Solución esperada:** (a) sí ayuda mucho — datos que cambian poco y se leen mucho son el caso ideal; (b) no conviene cachear sin invalidación estricta — la exactitud es más importante que la velocidad; (c) sí ayuda — tolera datos ligeramente desactualizados a cambio de mucha menor carga sobre la base de datos.

**Criterios de éxito:**
- Justificaste cada respuesta en términos de frecuencia de cambio y tolerancia a datos desactualizados, no solo con una respuesta intuitiva.
- Reconoces que (b) podría cachearse igual, pero con invalidación activa en cada escritura, no con TTL pasivo.

### Ejercicio 2: Implementa cache-aside con Python

**Enunciado:** escribe una función en Python que reciba un `usuario_id`, primero intente leerlo de Redis (`GET`), y si no existe, simule una consulta a base de datos (puede ser un diccionario en memoria), guarde el resultado en Redis con TTL de 30 segundos, y lo devuelva. Ejecuta la función dos veces seguidas y demuestra con logs cuál llamada fue cache hit y cuál cache miss.

**Solución esperada:** la primera llamada es un cache miss (Redis devuelve `None`, se consulta la "base de datos" simulada, se guarda en caché); la segunda llamada dentro de los 30 segundos es un cache hit (Redis devuelve el valor directamente sin tocar la base de datos simulada).

**Criterios de éxito:**
- El código realmente distingue y loguea cache hit vs cache miss, no solo devuelve el valor.
- El TTL se configura correctamente con `EX=30` al escribir en Redis.

### Ejercicio 3: Migra de contraseña fija a autenticación IAM

**Enunciado:** documenta, paso a paso, qué cambiarías en el código de una aplicación que actualmente se conecta a ElastiCache con una contraseña fija en una variable de entorno, para que en su lugar use autenticación IAM con `ValidateIamAuthToken`.

**Solución esperada:** eliminar la contraseña fija de la configuración; crear un usuario ElastiCache con `CreateUser` y una cadena de acceso apropiada; en el código de conexión, generar un token de autenticación IAM temporal (usando las credenciales del rol/usuario IAM de la aplicación) en vez de leer una contraseña de una variable de entorno; renovar el token periódicamente ya que las credenciales IAM temporales expiran.

**Criterios de éxito:**
- El plan elimina completamente la dependencia de un secreto estático almacenado en configuración.
- Reconoce que los tokens IAM son temporales y requieren renovación, a diferencia de una contraseña fija.

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

- AWS, Microsoft Azure y Google Cloud, marcos oficiales de arquitectura bien diseñada.
- NIST, *Cloud Computing Standards Roadmap* y *Secure Software Development Framework*.
- Beyer et al., *Site Reliability Engineering*.
- ACM/IEEE-CS/AAAI, *Computer Science Curricula 2023*.
- IEEE Computer Society, *SWEBOK Guide V4.0*.

## Resumen del módulo

En este módulo entendiste cuándo un caché en memoria mejora el rendimiento de una aplicación (lecturas frecuentes sobre datos que cambian poco) y cuándo no compensa la complejidad. Creaste un clúster ElastiCache respaldado por un contenedor Valkey real en Floci, te conectaste con `redis-cli` como lo harías contra cualquier Redis real, y practicaste el patrón cache-aside con `SET`, `GET` y `EXPIRE`. Finalmente, viste cómo migrar de contraseñas fijas a autenticación IAM, el mismo principio de seguridad —credenciales temporales derivadas de identidad, no secretos estáticos— que ya aplicaste con roles IAM en módulos anteriores.
