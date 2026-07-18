# Módulo 17: Streaming: Kinesis, MSK (Kafka) y Pub/Sub avanzado

## Sílabo

**Objetivo general**

Procesar flujos de millones de eventos por segundo, entendiendo la diferencia fundamental entre colas (SQS, un mensaje consumido y eliminado) y streams (Kinesis/Kafka, un registro persistente que múltiples consumidores pueden leer independientemente manteniendo su propia posición).

**Objetivos específicos**

1. Crear un data stream de Kinesis con múltiples shards y producir/consumir registros.
2. Crear un cluster MSK (Kafka gestionado) y producir/consumir mensajes.
3. Comparar los períodos de retención y garantías de orden de Kinesis frente a SQS.
4. Implementar un consumidor que mantiene su posición (offset) en Kafka.

**Contenido**

- Shard.
- Partition key.
- Consumer group.
- Offset.
- Retention period.
- Compaction.
- Backpressure.

**Evaluación**

Pipeline de streaming que ingiere eventos de Kinesis, los procesa con Lambda y los almacena en S3, más tres ejercicios de evaluación.

---

## Contenido teórico

### Tema 1: Streams vs colas

**Conceptos clave:** un registro persistente leído por múltiples consumidores independientes, no un mensaje que se elimina al consumirse.

```bash
aws kinesis create-stream --stream-name mi-stream --shard-count 2
aws kinesis put-record --stream-name mi-stream --partition-key user-001 --data $(echo -n "evento-1" | base64)
```

Kinesis (y Kafka de forma conceptualmente similar) retiene los registros publicados durante un período de retención configurado (hasta 7 días en Kinesis, comparado con hasta 14 días en SQS), y **múltiples consumidores independientes pueden leer el mismo stream completo, cada uno manteniendo su propia posición de lectura (offset) sin afectar a los demás consumidores**; esto contrasta fundamentalmente con SQS, donde un mensaje se elimina de la cola una vez que un consumidor lo procesa exitosamente, de modo que dos consumidores distintos compiten por los mismos mensajes en vez de poder leer independientemente el stream completo desde su propio punto de referencia.

Un shard es la unidad de capacidad de un stream de Kinesis (cada shard soporta un throughput específico de escritura y lectura); la `partition-key` determina a qué shard específico se enruta cada registro (registros con la misma partition key van consistentemente al mismo shard, preservando el orden relativo entre ellos), de forma análoga al concepto de partición en Kafka, donde el orden se garantiza dentro de una partición específica, no a través del stream completo.

**Analogía:** una cola SQS es como una fila de atención al público donde cada solicitud es atendida por un único empleado y luego desaparece de la fila; un stream de Kinesis/Kafka es como una grabación de video que múltiples espectadores independientes pueden reproducir desde el punto donde cada uno se quedó, sin que un espectador "consuma" o elimine el video para los demás.

**¿Por qué es importante?** Kinesis/Kafka permiten que múltiples consumidores independientes lean el mismo stream completo manteniendo su propia posición, a diferencia de SQS donde un mensaje se elimina al ser consumido por un único consumidor competitivo, una diferencia fundamental de modelo que determina cuándo cada uno es la herramienta correcta.

**Diagrama:**

```
SQS: mensaje consumido por UN consumidor → eliminado de la cola
Kinesis/Kafka: registro persiste durante el retention period → múltiples consumidores leen independientemente, cada uno con su propio offset
```

### Tema 2: MSK (Kafka gestionado) y consumer groups

**Conceptos clave:** posición de lectura persistida por grupo de consumidores, no por consumidor individual aislado.

```bash
aws kafka create-cluster --cluster-name mi-kafka --broker-node-group-info '{"InstanceType":"kafka.m5.large", ...}' --number-of-broker-nodes 1 --kafka-version "3.5.1"
```

MSK (Managed Streaming for Kafka) gestiona un cluster de Kafka real como servicio administrado, ahorrando la operación manual de brokers Kafka propios; un consumer group es un conjunto de consumidores que colaboran para procesar las particiones de un topic de Kafka, cada partición asignada exclusivamente a un único consumidor dentro de ese grupo específico en un momento dado (permitiendo paralelizar el procesamiento entre múltiples consumidores del mismo grupo), mientras que el offset (la posición de lectura) se rastrea por consumer group, permitiendo que un consumidor que se reinicia recupere su posición exacta de lectura anterior dentro de ese grupo, sin reprocesar mensajes ya consumidos ni saltarse mensajes pendientes.

Un consumer group existe precisamente para permitir escalar horizontalmente el procesamiento de un stream de alto volumen distribuyendo las particiones entre múltiples instancias de consumidor que trabajan en paralelo dentro del mismo grupo lógico, mientras distintos consumer groups completamente independientes pueden leer el mismo topic de forma totalmente aislada entre sí (por ejemplo, un grupo procesa eventos para analítica mientras otro grupo completamente separado los procesa para notificaciones, sin que ninguno de los dos afecte la posición de lectura del otro).

**Analogía:** un consumer group es como un equipo de trabajadores que se dividen las secciones de un archivo extenso para procesarlo en paralelo, cada trabajador recordando exactamente hasta dónde llegó en su sección asignada específica, de modo que si un trabajador se detiene y reanuda su tarea más tarde, continúa exactamente desde donde se quedó sin repetir ni saltarse trabajo, sin interferir con otros equipos completamente distintos que procesan el mismo archivo original con un propósito diferente.

**¿Por qué es importante?** El offset rastreado por consumer group permite que un consumidor que se reinicia recupere exactamente su posición de lectura anterior sin reprocesar ni saltarse mensajes, y permite paralelizar el procesamiento entre múltiples consumidores del mismo grupo mientras distintos grupos leen el mismo topic de forma completamente independiente.

**Diagrama:**

```
Topic con 3 particiones
Consumer Group A: Consumidor 1 (partición 0), Consumidor 2 (partición 1,2)
Consumer Group B (independiente): lee las mismas particiones con su propio offset, sin afectar al Group A
```

### Tema 3: Kinesis Data Streams vs Firehose, y GCP Managed Kafka

**Conceptos clave:** streaming de bajo nivel con control fino frente a entrega automatizada hacia un destino final.

Kinesis Data Streams (lo estudiado en este módulo) da control de bajo nivel sobre cómo se leen y procesan los registros, apropiado cuando la aplicación necesita lógica de procesamiento personalizada en tiempo real sobre cada evento; Kinesis Data Firehose, en cambio, es un servicio de entrega completamente gestionado que automáticamente transporta registros desde un stream hacia un destino final (S3, un data warehouse, un servicio de búsqueda) con transformaciones opcionales configurables, sin que el desarrollador escriba código de consumidor personalizado para ese caso de uso específico de "simplemente mover datos de A a B con alguna transformación estándar", una distinción similar a la de "control fino vs conveniencia gestionada" ya vista entre EC2/contenedores y Lambda.

GCP Managed Kafka (basado en Redpanda, una implementación compatible con el protocolo de Kafka) ofrece un servicio conceptualmente equivalente en el ecosistema GCP, reforzando que streaming de alto volumen con consumer groups y particiones es un patrón universal de la industria, disponible con implementaciones específicas en cada proveedor cloud mayor, aunque los detalles operativos y de API varíen entre ellos.

**Analogía:** Kinesis Data Streams es como recibir directamente el flujo de correspondencia entrante para procesarla personalmente según reglas propias específicas; Kinesis Data Firehose es como contratar un servicio de reenvío automático que entrega esa misma correspondencia directamente a un archivo final predeterminado sin necesidad de procesarla manualmente en el camino, apropiado cuando el objetivo es simplemente el almacenamiento final, no un procesamiento personalizado intermedio.

**¿Por qué es importante?** Kinesis Data Streams ofrece control fino de bajo nivel para procesamiento personalizado en tiempo real; Kinesis Data Firehose automatiza la entrega hacia un destino final sin código de consumidor personalizado, apropiado cuando el objetivo es simplemente transportar datos con alguna transformación estándar.

**Diagrama:**

```
Kinesis Data Streams  → control fino, procesamiento personalizado en tiempo real
Kinesis Data Firehose → entrega automatizada gestionada hacia S3/warehouse, sin código de consumidor propio
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

> Este laboratorio asume que ya ejecutaste `floci start` y `eval $(floci env)` (Módulo 1) en tu sesión de terminal, así que los comandos de `aws` no repiten `--endpoint-url`.

**Objetivo del laboratorio:** construir un pipeline de streaming que ingiere eventos de Kinesis, los procesa con Lambda y los almacena en S3.

**Requisitos previos:** Módulo 16 completado.

| Paso | Acción | Comando | Explicación |
|---|---|---|---|
| 1 | Crear un data stream con 2 shards | `aws kinesis create-stream --shard-count 2` | Unidad de capacidad |
| 2 | Producir y consumir registros | `put-record` + `get-shard-iterator` + `get-records` | Con partition key |
| 3 | Crear un cluster MSK | `aws kafka create-cluster` | Kafka gestionado |
| 4 | Producir/consumir con consumer group | `kafka-console-producer`/`consumer` | Mantiene su offset |
| 5 | Comparar retención y orden Kinesis vs SQS | Ver Tema 1 | Documenta las diferencias |

**Verificación:** el laboratorio se considera exitoso si el pipeline procesa correctamente eventos desde Kinesis hacia S3 vía Lambda, y si el consumidor de Kafka recupera correctamente su posición (offset) tras reiniciarse, sin reprocesar ni saltarse mensajes.

**Errores comunes y soluciones**

- **Usar SQS cuando múltiples consumidores independientes necesitan leer el mismo flujo completo de eventos.** Usa Kinesis/Kafka para ese caso.
- **No mantener el offset del consumidor, perdiendo la posición de lectura tras un reinicio.** Usa consumer groups para persistir esa posición correctamente.
- **Escribir un consumidor personalizado cuando Kinesis Data Firehose ya resolvería la entrega automatizada necesaria.** Considera Firehose para casos de simple transporte sin procesamiento personalizado.

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

**Puntos clave**

- Los streams (Kinesis/Kafka) permiten que múltiples consumidores independientes lean el mismo flujo completo, a diferencia de las colas (SQS) donde un mensaje se elimina al ser consumido.
- El offset rastreado por consumer group permite recuperar la posición de lectura exacta tras un reinicio, sin reprocesar ni saltarse mensajes.
- Kinesis Data Streams da control fino para procesamiento personalizado; Firehose automatiza la entrega hacia un destino final.
- MSK y GCP Managed Kafka gestionan Kafka real como servicio administrado, reforzando que streaming de alto volumen es un patrón universal de la industria.

**Conceptos aprendidos**

- Shard.
- Partition key.
- Consumer group.
- Offset.
- Retention period.
- Compaction.
- Backpressure.

**Próximos pasos**

En el Módulo 18 aprenderás autenticación de usuarios con Cognito, implementando registro, login y autorización sin construir tu propio sistema de autenticación.

**Recursos adicionales**

- Documentación oficial de Amazon Kinesis (docs.aws.amazon.com/kinesis).
