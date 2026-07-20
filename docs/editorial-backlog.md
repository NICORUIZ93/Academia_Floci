# Deuda editorial verificable

Este inventario se genera desde el Markdown real. Las ayudas visuales, el glosario y los mensajes generados por la interfaz no cuentan como explicación editorial.

## Estado global

| Criterio | Cubierto | Pendiente |
|---|---:|---:|
| Explicación | 892 | 1 |
| Código | 843 | 50 |
| Ruta | 249 | 644 |
| Ejecución | 449 | 444 |
| Resultado | 308 | 585 |
| Modificación | 479 | 414 |
| Rutaflow | 222 | 671 |
| Modelo mental | 893 | 0 |
| Límites | 439 | 454 |
| **Tema practicable completo** | **143** | **750** |

## Prioridad por track

| Track | Temas | Sin código | Sin ruta | Sin ejecución | Sin resultado | Sin modificación | Sin límites |
|---|---:|---:|---:|---:|---:|---:|---:|
| android | 49 | 0 | 45 | 44 | 38 | 25 | 29 |
| angular | 61 | 0 | 47 | 57 | 44 | 29 | 31 |
| cloud | 153 | 50 | 130 | 51 | 122 | 82 | 76 |
| devops | 91 | 0 | 73 | 47 | 69 | 28 | 41 |
| flutter | 57 | 0 | 49 | 28 | 37 | 36 | 38 |
| foundations | 50 | 0 | 0 | 0 | 10 | 0 | 26 |
| ios | 51 | 0 | 49 | 12 | 35 | 30 | 27 |
| java | 59 | 0 | 0 | 0 | 9 | 0 | 21 |
| javascript | 75 | 0 | 47 | 53 | 46 | 27 | 25 |
| kotlin-multiplatform | 46 | 0 | 41 | 29 | 35 | 30 | 23 |
| node | 64 | 0 | 43 | 25 | 39 | 29 | 29 |
| react | 55 | 0 | 44 | 54 | 47 | 37 | 33 |
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
- Módulo 34: Instalación en macOS, Linux y Windows; AWS CLI y SDK, Azure CLI y SDK, GCP CLI y SDK; Configuración avanzada y ciclo de vida; Servicios AWS incorporados en la documentación actual; Laboratorios oficiales reconstruidos en español; Límites y transferencia a producción

## Regla de cierre

Un pendiente solo se cierra cuando el tema específico incluye archivo, código explicado, comando, salida, fallo diagnosticable, modificación y conexión con RutaFlow. No se acepta texto generado o el mismo ejemplo repetido entre temas.
