# Módulo 17: Streaming: Kinesis, MSK (Kafka) y Pub/Sub avanzado


## Aprende construyendo

### Tema 1: Streams vs colas

#### Paso 1 · Objetivo y preparación
Al finalizar podrás explicar un stream persistente desde cero. Prerrequisitos: Node.js y Docker; verifica `node --version`.
#### Paso 2 · Contexto y caso real
La ubicación de un conductor debe alimentar mapa, analítica y alertas.
#### Paso 3 · Teoría, modelo mental y analogía
Un stream es un cuaderno append-only que varios lectores recorren a su ritmo.
#### Paso 4 · Demostración guiada
Crea `src/stream.js` desde una carpeta vacía.
```bash
mkdir ejemplo-stream
node --version
```
Resultado esperado: Node disponible.
#### Paso 5 · Práctica guiada
Pista: reinicia un consumidor sin offset para provocar un fallo deliberado y corrígelo.
#### Paso 6 · Práctica independiente
Añade dos consumidores y conserva sus offsets.
#### Paso 7 · Cierre y evidencia
Entrega topología, salida, fallo y corrección; explica el resultado. Siguiente paso: offsets. Errores comunes: borrar eventos y confundir stream con cola. Fuente oficial: https://docs.aws.amazon.com/streams/latest/dev/introduction.html.
**Conceptos clave:** un registro persistente leído por múltiples consumidores independientes, no un mensaje que se elimina al consumirse.

```bash
aws kinesis create-stream --stream-name mi-stream --shard-count 2
aws kinesis put-record --stream-name mi-stream --partition-key user-001 --data $(echo -n "evento-1" | base64)
```

`--stream-name` identifica el stream; `--shard-count` fija cuántos shards tiene al crearlo (más shards, más capacidad de escritura/lectura en paralelo — el concepto se explica abajo). Al escribir un registro, `--partition-key` decide a qué shard va ese registro (mismo valor de partition key → mismo shard, preservando orden entre ellos) y `--data` es el contenido del registro, codificado en base64 porque Kinesis lo trata como datos binarios opacos.

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

#### Paso 1 · Objetivo y preparación
Al finalizar podrás gestionar offsets desde cero. Prerrequisitos: Node.js y Docker; verifica `node --version`.
#### Paso 2 · Contexto y caso real
Un grupo debe reanudar procesamiento tras un reinicio sin perder ni duplicar de forma incontrolada.
#### Paso 3 · Teoría, modelo mental y analogía
El offset es un separador que marca hasta dónde leyó cada grupo.
#### Paso 4 · Demostración guiada
Crea `src/offset.js` desde una carpeta vacía.
```bash
mkdir ejemplo-offset
node --version
```
Resultado esperado: Node disponible.
#### Paso 5 · Práctica guiada
Pista: guarda un offset incorrecto para provocar un fallo deliberado y corrígelo.
#### Paso 6 · Práctica independiente
Prueba reanudación y duplicado.
#### Paso 7 · Cierre y evidencia
Entrega offset, salida, fallo y corrección; explica el resultado. Siguiente paso: Firehose. Errores comunes: compartir offset entre grupos y no hacer commit. Fuente oficial: https://docs.aws.amazon.com/kinesis/latest/dev/key-concepts.html.
**Conceptos clave:** posición de lectura persistida por grupo de consumidores, no por consumidor individual aislado.

```bash
aws kafka create-cluster --cluster-name mi-kafka --broker-node-group-info '{"InstanceType":"kafka.m5.large", ...}' --number-of-broker-nodes 1 --kafka-version "3.5.1"
```

`--cluster-name` identifica el cluster de MSK; `--broker-node-group-info` describe el hardware de los brokers (los servidores que forman el cluster de Kafka — acá, su tipo de instancia); `--number-of-broker-nodes` es cuántos brokers levantar; `--kafka-version` fija qué versión del motor Kafka correr.

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

#### Paso 1 · Objetivo y preparación
Al finalizar podrás escoger streaming o entrega gestionada desde cero. Prerrequisitos: Node.js y Docker; verifica `node --version`.
#### Paso 2 · Contexto y caso real
Datos de ubicación pueden necesitar procesamiento inmediato o almacenamiento final.
#### Paso 3 · Teoría, modelo mental y analogía
Stream da control; Firehose es una cinta transportadora hacia el destino.
#### Paso 4 · Demostración guiada
Crea `src/stream-choice.js` desde una carpeta vacía.
```bash
mkdir ejemplo-stream-choice
node --version
```
Resultado esperado: Node disponible.
#### Paso 5 · Práctica guiada
Pista: elige un destino incompatible para provocar un fallo deliberado y corrígelo.
#### Paso 6 · Práctica independiente
Compara latencia, control y mantenimiento.
#### Paso 7 · Cierre y evidencia
Entrega matriz, salida, fallo y corrección; explica el resultado. Siguiente paso: analytics. Errores comunes: ignorar buffering y coste por destino. Fuente oficial: https://docs.aws.amazon.com/firehose/latest/dev/what-is-this-service.html.
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
