# Deuda editorial verificable

Este inventario se genera desde el Markdown real. Las ayudas visuales, el glosario y los mensajes generados por la interfaz no cuentan como explicación editorial.

## Estado global

| Criterio | Cubierto | Pendiente |
|---|---:|---:|
| Explicación | 904 | 1 |
| Código | 859 | 46 |
| Ruta | 521 | 384 |
| Ejecución | 670 | 235 |
| Resultado | 569 | 336 |
| Modificación | 690 | 215 |
| Rutaflow | 295 | 610 |
| Modelo mental | 905 | 0 |
| Límites | 512 | 393 |
| **Tema practicable completo** | **378** | **527** |

## Prioridad por track

| Track | Temas | Sin código | Sin ruta | Sin ejecución | Sin resultado | Sin modificación | Sin límites |
|---|---:|---:|---:|---:|---:|---:|---:|
| android | 49 | 0 | 45 | 44 | 38 | 25 | 29 |
| angular | 61 | 0 | 6 | 6 | 6 | 0 | 21 |
| cloud | 153 | 46 | 125 | 50 | 117 | 78 | 74 |
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

- Módulo 22: ELB v2 — balanceadores, grupos objetivo y reglas; ACM — certificados TLS con criptografía real; CloudFront — distribución de contenido y control de acceso al origen; Route53 — zonas alojadas y registros de recursos; Cómo se integran los cuatro servicios en una arquitectura de borde real
- Módulo 23: Qué resuelve un caché en memoria — y cuándo no ayuda; Arquitectura de ElastiCache en Floci — contenedores reales, no simulación; Creación de clústeres y conexión con clientes estándar; Autenticación IAM para el plano de datos de ElastiCache
- Módulo 24: CodeBuild — compilaciones reales dentro de contenedores Docker; buildspec.yml — fases y artefactos; CodeDeploy — aplicaciones, grupos y configuraciones predefinidas; Despliegue Blue/Green de Lambda — cambio de tráfico por alias; Despliegue Blue/Green de ECS — cambio de tráfico por listener ELB
- Módulo 25: AWS Config — rastrear reglas sobre tus recursos; AppConfig — desplegar configuración sin redeployar código; AppConfigData — el plano de datos que consume tu aplicación; AWS Backup — centralizar la política de respaldo de múltiples servicios; El ciclo de vida de un trabajo de respaldo
- Módulo 26: Amazon Data Firehose — entrega gestionada sin consumidores propios; Firehose vs Kinesis Data Streams — quién consume los datos; EventBridge Pipes — conectar origen y destino sin código de pegamento; Cuándo usar Pipes frente a reglas EventBridge o Step Functions
- Módulo 27: AppSync — APIs GraphQL gestionadas; Fuentes de datos y resolvers; SES — identidades, envío y plantillas; El simulador de buzones y el punto de inspección local
- Módulo 28: Bases de datos de grafos — cuando las relaciones son el dato; Neptune en Floci — un servidor Gremlin real, no una simulación; OpenSearch — modo simulado y modo real; Eligiendo entre Neptune, OpenSearch y DynamoDB
- Módulo 29: Cost Explorer — costos sintetizados a partir de tu estado real; Pricing — catálogo de tarifas de referencia; BCM Data Exports — reportes de costo en formato estándar; Resource Groups Tagging API — descubrimiento centralizado por etiqueta; STS en profundidad — identidad temporal y aislamiento multi-cuenta
- Módulo 30: Qué resuelve Transfer Family; Ciclo de vida del servidor y modelo de usuarios; Claves públicas SSH y autenticación de usuarios; Los límites de la Fase 1 — plano de gestión completo, plano de datos pendiente
- Módulo 34: Instalación en macOS, Linux y Windows; AWS CLI y SDK, Azure CLI y SDK, GCP CLI y SDK; Configuración avanzada y ciclo de vida; Servicios AWS incorporados en la documentación actual; Laboratorios oficiales reconstruidos en español; Límites y transferencia a producción

## Regla de cierre

Un pendiente solo se cierra cuando el tema específico incluye archivo, código explicado, comando, salida, fallo diagnosticable, modificación y conexión con RutaFlow. No se acepta texto generado o el mismo ejemplo repetido entre temas.
