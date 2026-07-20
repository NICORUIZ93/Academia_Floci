# Deuda editorial verificable

Este inventario se genera desde el Markdown real. Las ayudas visuales, el glosario y los mensajes generados por la interfaz no cuentan como explicación editorial.

## Estado global

| Criterio | Cubierto | Pendiente |
|---|---:|---:|
| Explicación | 891 | 2 |
| Código | 840 | 53 |
| Ruta | 155 | 738 |
| Ejecución | 423 | 470 |
| Resultado | 252 | 641 |
| Modificación | 384 | 509 |
| Rutaflow | 118 | 775 |
| Modelo mental | 893 | 0 |
| Límites | 428 | 465 |
| **Tema practicable completo** | **17** | **876** |

## Prioridad por track

| Track | Temas | Sin código | Sin ruta | Sin ejecución | Sin resultado | Sin modificación | Sin límites |
|---|---:|---:|---:|---:|---:|---:|---:|
| android | 49 | 0 | 45 | 44 | 38 | 27 | 29 |
| angular | 61 | 0 | 47 | 57 | 44 | 29 | 31 |
| cloud | 153 | 53 | 132 | 51 | 124 | 86 | 78 |
| devops | 91 | 0 | 73 | 47 | 69 | 32 | 41 |
| flutter | 57 | 0 | 49 | 28 | 37 | 42 | 38 |
| foundations | 50 | 0 | 38 | 15 | 31 | 34 | 34 |
| ios | 51 | 0 | 49 | 12 | 35 | 31 | 27 |
| java | 59 | 0 | 50 | 7 | 40 | 37 | 22 |
| javascript | 75 | 0 | 51 | 57 | 48 | 27 | 25 |
| kotlin-multiplatform | 46 | 0 | 41 | 29 | 35 | 33 | 23 |
| node | 64 | 0 | 43 | 25 | 39 | 32 | 29 |
| react | 55 | 0 | 44 | 54 | 47 | 38 | 33 |
| rutaflow | 24 | 0 | 24 | 21 | 21 | 21 | 19 |
| spring-boot | 58 | 0 | 52 | 23 | 33 | 40 | 36 |

## Temas sin código editorial

### cloud

- Módulo 21: AMIs, grupos de seguridad y claves SSH; UserData e IMDS — arranque automatizado y credenciales por instancia; Auto Scaling — configuraciones de lanzamiento y grupos; El reconciliador de capacidad y las políticas de escalado
- Módulo 22: ELB v2 — balanceadores, grupos objetivo y reglas; ACM — certificados TLS con criptografía real; CloudFront — distribución de contenido y control de acceso al origen; Route53 — zonas alojadas y registros de recursos; Cómo se integran los cuatro servicios en una arquitectura de borde real
- Módulo 23: Qué resuelve un caché en memoria — y cuándo no ayuda; Arquitectura de ElastiCache en Floci — contenedores reales, no simulación; Creación de clústeres y conexión con clientes estándar; Autenticación IAM para el plano de datos de ElastiCache
- Módulo 24: CodeBuild — compilaciones reales dentro de contenedores Docker; buildspec.yml — fases y artefactos; CodeDeploy — aplicaciones, grupos y configuraciones predefinidas; Despliegue Blue/Green de Lambda — cambio de tráfico por alias; Despliegue Blue/Green de ECS — cambio de tráfico por listener ELB
- Módulo 25: AWS Config — rastrear reglas sobre tus recursos; AppConfig — desplegar configuración sin redeployar código; AppConfigData — el plano de datos que consume tu aplicación; AWS Backup — centralizar la política de respaldo de múltiples servicios; El ciclo de vida de un trabajo de respaldo
- Módulo 26: Amazon Data Firehose — entrega gestionada sin consumidores propios; Firehose vs Kinesis Data Streams — quién consume los datos; EventBridge Pipes — conectar origen y destino sin código de pegamento; Cuándo usar Pipes frente a reglas EventBridge o Step Functions
- Módulo 27: AppSync — APIs GraphQL gestionadas; Fuentes de datos y resolvers; SES — identidades, envío y plantillas; El simulador de buzones y el punto de inspección local
- Módulo 28: Bases de datos de grafos — cuando las relaciones son el dato; Neptune en Floci — un servidor Gremlin real, no una simulación; OpenSearch — modo simulado y modo real; Eligiendo entre Neptune, OpenSearch y DynamoDB
- Módulo 29: Cost Explorer — costos sintetizados a partir de tu estado real; Pricing — catálogo de tarifas de referencia; BCM Data Exports — reportes de costo en formato estándar; Resource Groups Tagging API — descubrimiento centralizado por etiqueta; STS en profundidad — identidad temporal y aislamiento multi-cuenta
- Módulo 30: Qué resuelve Transfer Family; Ciclo de vida del servidor y modelo de usuarios; Claves públicas SSH y autenticación de usuarios; Los límites de la Fase 1 — plano de gestión completo, plano de datos pendiente
- Módulo 34: Instalación en macOS, Linux y Windows; AWS CLI y SDK, Azure CLI y SDK, GCP CLI y SDK; Configuración avanzada y ciclo de vida; Automatización, UI y agentes; Servicios AWS incorporados en la documentación actual; Servicios Azure que completan el recorrido; Servicios GCP que completan el recorrido; Laboratorios oficiales reconstruidos en español; Límites y transferencia a producción

## Regla de cierre

Un pendiente solo se cierra cuando el tema específico incluye archivo, código explicado, comando, salida, fallo diagnosticable, modificación y conexión con RutaFlow. No se acepta texto generado o el mismo ejemplo repetido entre temas.
