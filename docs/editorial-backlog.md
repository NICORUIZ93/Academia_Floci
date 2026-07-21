# Deuda editorial verificable

Este inventario se genera desde el Markdown real. Las ayudas visuales, el glosario y los mensajes generados por la interfaz no cuentan como explicación editorial.

## Estado global

| Criterio | Cubierto | Pendiente |
|---|---:|---:|
| Explicación | 904 | 1 |
| Código | 878 | 27 |
| Ruta | 538 | 367 |
| Ejecución | 675 | 230 |
| Resultado | 583 | 322 |
| Modificación | 705 | 200 |
| Rutaflow | 314 | 591 |
| Modelo mental | 905 | 0 |
| Límites | 524 | 381 |
| **Tema practicable completo** | **397** | **508** |

## Prioridad por track

| Track | Temas | Sin código | Sin ruta | Sin ejecución | Sin resultado | Sin modificación | Sin límites |
|---|---:|---:|---:|---:|---:|---:|---:|
| android | 49 | 0 | 45 | 44 | 38 | 25 | 29 |
| angular | 61 | 0 | 6 | 6 | 6 | 0 | 21 |
| cloud | 153 | 27 | 108 | 45 | 103 | 63 | 62 |
| devops | 91 | 0 | 73 | 47 | 69 | 28 | 41 |
| flutter | 57 | 0 | 40 | 26 | 29 | 29 | 34 |
| foundations | 50 | 0 | 0 | 0 | 5 | 0 | 22 |
| ios | 51 | 0 | 25 | 6 | 8 | 4 | 26 |
| java | 59 | 0 | 0 | 0 | 2 | 0 | 15 |
| javascript | 83 | 0 | 0 | 0 | 0 | 0 | 19 |
| kotlin-multiplatform | 46 | 0 | 41 | 29 | 35 | 30 | 23 |
| node | 68 | 0 | 0 | 0 | 0 | 0 | 14 |
| react | 55 | 0 | 5 | 6 | 6 | 0 | 30 |
| rutaflow | 24 | 0 | 24 | 21 | 21 | 21 | 19 |
| spring-boot | 58 | 0 | 0 | 0 | 0 | 0 | 26 |

## Temas sin código editorial

### cloud

- Módulo 26: Amazon Data Firehose — entrega gestionada sin consumidores propios; Firehose vs Kinesis Data Streams — quién consume los datos; EventBridge Pipes — conectar origen y destino sin código de pegamento; Cuándo usar Pipes frente a reglas EventBridge o Step Functions
- Módulo 27: AppSync — APIs GraphQL gestionadas; Fuentes de datos y resolvers; SES — identidades, envío y plantillas; El simulador de buzones y el punto de inspección local
- Módulo 28: Bases de datos de grafos — cuando las relaciones son el dato; Neptune en Floci — un servidor Gremlin real, no una simulación; OpenSearch — modo simulado y modo real; Eligiendo entre Neptune, OpenSearch y DynamoDB
- Módulo 29: Cost Explorer — costos sintetizados a partir de tu estado real; Pricing — catálogo de tarifas de referencia; BCM Data Exports — reportes de costo en formato estándar; Resource Groups Tagging API — descubrimiento centralizado por etiqueta; STS en profundidad — identidad temporal y aislamiento multi-cuenta
- Módulo 30: Qué resuelve Transfer Family; Ciclo de vida del servidor y modelo de usuarios; Claves públicas SSH y autenticación de usuarios; Los límites de la Fase 1 — plano de gestión completo, plano de datos pendiente
- Módulo 34: Instalación en macOS, Linux y Windows; AWS CLI y SDK, Azure CLI y SDK, GCP CLI y SDK; Configuración avanzada y ciclo de vida; Servicios AWS incorporados en la documentación actual; Laboratorios oficiales reconstruidos en español; Límites y transferencia a producción

## Regla de cierre

Un pendiente solo se cierra cuando el tema específico incluye archivo, código explicado, comando, salida, fallo diagnosticable, modificación y conexión con RutaFlow. No se acepta texto generado o el mismo ejemplo repetido entre temas.
