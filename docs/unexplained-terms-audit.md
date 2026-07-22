# Auditoría de términos y comandos sin explicar

Heurística: un comando o flag que aparece en un bloque de código de terminal se considera explicado solo si, en la prosa del mismo tema, aparece cerca de una frase que lo define ("es el", "es un/una", "significa", "sirve para", "viene de", "ejecuta", "instala", "activa"...). Es una heurística de triage, no un veredicto definitivo: falsos positivos y negativos son posibles. Sirve para priorizar revisión manual, no para auto-corregir contenido.

| Track | Temas con términos sin explicar | Términos sin explicar más comunes |
|---|---:|---|
| foundations | 5 | `python` (1), `--directory` (1), `curl` (1), `--oneline` (1), `--fail` (1), `--silent` (1) |
| cloud | 69 | `--version` (1), `python` (1), `node` (1), `aws` (1), `--name` (1), `--output` (1) |
| devops | 32 | `--rm` (1), `docker` (1), `--no-cache` (1), `--all` (1), `--graph` (1), `--no-ff` (1) |
| javascript | 6 | `node` (1), `npm` (1), `npx` (1), `--save-dev` (1), `--template` (1), `--init` (1) |
| node | 11 | `node` (1), `npm` (1), `--region` (1), `--save-dev` (1), `--depth` (1), `git` (1) |
| angular | 5 | `--defaults` (1), `--routing` (1), `--skip-git` (1), `--standalone` (1), `--style` (1), `--watch` (1) |
| react | 3 | `--template` (1), `npm` (1), `--app` (1), `--eslint` (1), `--no-tailwind` (1), `--src-dir` (1) |
| java | 4 | `--version` (1), `mvn` (1), `gradlew` (1), `--add-modules` (1), `--ignore-missing-deps` (1), `--no-header-files` (1) |
| spring-boot | 3 | `curl` (1), `mvnw` (1), `mvn` (1), `--destination` (1) |
| kotlin-multiplatform | 3 | `gradlew` (1), `--tests` (1), `gradle` (1) |
| android | 6 | `python` (1), `python3` (1), `adb` (1), `gradlew` (1), `curl` (1), `--max-time` (1) |
| ios | 1 | `--type` (1), `swift` (1) |
| flutter | 3 | `flutter` (1), `--release` (1), `dart` (1) |
| rutaflow | 1 | `node` (1) |
| **Total** | **152** | |

## Términos sin explicar más frecuentes en todo el curso

| Término | Apariciones sin explicar |
|---|---:|
| `--version` | 5 |
| `node` | 5 |
| `curl` | 4 |
| `--output` | 4 |
| `npm` | 4 |
| `python` | 3 |
| `--silent` | 3 |
| `--template` | 3 |
| `npx` | 3 |
| `--save-dev` | 3 |
| `gradlew` | 3 |
| `--oneline` | 2 |
| `--name` | 2 |
| `--query` | 2 |
| `--secret-id` | 2 |
| `--secret-string` | 2 |
| `--type` | 2 |
| `--namespace` | 2 |
| `--image` | 2 |
| `--port` | 2 |
| `--record` | 2 |
| `--target` | 2 |
| `--destination` | 2 |
| `--from` | 2 |
| `--format` | 2 |
| `git` | 2 |
| `kind` | 2 |
| `--watch` | 2 |
| `python3` | 2 |
| `--init` | 2 |

## Detalle por track

### android

- Módulo 0 · Tema 2: Recursos externalizados: `python`, `python3`
- Módulo 1 · Tema 1: Ciclo de vida de una Activity: `adb`, `gradlew`
- Módulo 5 · Tema 1: Retrofit con coroutines: `curl`
- Módulo 5 · Tema 2: Manejo de errores HTTP: `--max-time`
- Módulo 13 · Tema 3: Offline-first necesita un protocolo de cambios: `kind`
- Módulo 14 · Tema 1: ComposeTestRule ejecuta tu UI sin emulador visible: `--tests`

### angular

- Módulo 0 · Tema 1: El CLI ya no genera NgModules: `--defaults`, `--routing`, `--skip-git`, `--standalone`, `--style`, `--watch`, `npx`
- Módulo 0 · Tema 3: TypeScript a fondo — unknown, any, never y utility types: `--init`, `--noEmit`, `--save-dev`, `--silent`, `--strict`, `npm`
- Módulo 8 · Tema 3: Migración desde NgModules: `--module`
- Módulo 9 · Tema 2: NgRx — actions, reducers y selectors: `--save`
- Módulo 11 · Tema 1: Server-Side Rendering: `--ssr`

### cloud

- Módulo 0 · Tema 1: Fundamentos absolutos — qué es una terminal, un comando y un sistema operativo: `--version`, `python`
- Módulo 0 · Tema 2: Fundamentos de redes — direcciones IP, puertos, HTTP y APIs: `node`
- Módulo 2 · Tema 1: Objetos, buckets y su nomenclatura: `aws`
- Módulo 10 · Tema 1: Secrets Manager y por qué no usar variables de entorno hardcodeadas: `--name`, `--output`, `--query`, `--secret-id`, `--secret-string`
- Módulo 10 · Tema 2: KMS y envelope encryption: `--ciphertext-blob`, `--description`, `--key-id`, `--plaintext`
- Módulo 10 · Tema 3: SSM Parameter Store vs Secrets Manager: `--type`, `--value`
- Módulo 11 · Tema 1: El patrón fan-out con SNS: `--message`, `--notification-endpoint`, `--protocol`, `--topic-arn`
- Módulo 11 · Tema 2: EventBridge: bus de eventos con filtrado declarativo: `--entries`, `--event-bus-name`, `--event-pattern`
- Módulo 12 · Tema 1: Log groups, log streams y correlation ID: `--log-events`, `--log-group-name`, `--log-stream-name`
- Módulo 12 · Tema 2: Metric filters y alarmas: `--alarm-name`, `--comparison-operator`, `--evaluation-periods`, `--filter-name`, `--filter-pattern`, `--metric-name`, `--metric-transformations`, `--namespace`, `--period`, `--statistic`, `--threshold`
- Módulo 13 · Tema 1: RDS Instance y cuándo elegir SQL sobre NoSQL: `--allocated-storage`, `--db-instance-class`, `--db-instance-identifier`, `--engine`, `--master-user-password`, `--master-username`
- Módulo 13 · Tema 2: Snapshots y restore: `--db-snapshot-identifier`
- Módulo 14 · Tema 1: ECR y por qué no basta con Docker Hub: `--password-stdin`, `--repository-name`, `--username`
- Módulo 14 · Tema 2: Task Definition y ECS Cluster: `--cluster`, `--cluster-name`, `--container-definitions`, `--family`, `--task-definition`
- Módulo 14 · Tema 3: Contenedores vs Lambda, y EKS: `--image`, `--role-arn`, `kubectl`
- Módulo 15 · Tema 1: Stack, Template y por qué no crear recursos manualmente con la CLI: `--stack-name`, `--template-file`, `terraform`
- Módulo 15 · Tema 2: Change sets: `--change-set-name`, `--template-body`
- Módulo 16 · Tema 1: State machine y Task states: `--definition`, `--input`, `--state-machine-arn`
- Módulo 17 · Tema 1: Streams vs colas: `--data`, `--partition-key`, `--shard-count`, `--stream-name`
- Módulo 17 · Tema 2: MSK (Kafka gestionado) y consumer groups: `--broker-node-group-info`, `--kafka-version`, `--number-of-broker-nodes`
- Módulo 18 · Tema 1: Por qué no construir tu propio sistema de autenticación: `--auto-verified-attributes`, `--client-id`, `--client-name`, `--no-generate-secret`, `--password`, `--pool-name`, `--user-attributes`, `--user-pool-id`
- Módulo 18 · Tema 2: Access Token, ID Token y Refresh Token: `--auth-flow`, `--auth-parameters`
- Módulo 19 · Tema 1: Data lake y Glue Catalog: `--database-input`, `--database-name`, `--table-input`
- Módulo 19 · Tema 2: Glue Crawler y Athena: `--query-string`, `--result-configuration`, `--targets`
- Módulo 20 · Tema 1: Bedrock Runtime y respuestas stub deterministas: `--body`, `--cli-binary-format`, `--model-id`
- Módulo 20 · Tema 2: Textract y Transcribe: `--document`, `--feature-types`, `--media`, `--output-bucket-name`, `--transcription-job-name`
- Módulo 21 · Tema 1: El modelo de ejecución de EC2 — instancias que son contenedores Docker reales: `--image-id`, `--instance-ids`, `--instance-type`
- Módulo 21 · Tema 2: AMIs, grupos de seguridad y claves SSH: `--cidr`, `--group-id`, `--group-name`, `--key-name`, `--port`, `--public-key-material`
- Módulo 21 · Tema 3: UserData e IMDS — arranque automatizado y credenciales por instancia: `--user-data`
- Módulo 21 · Tema 4: Auto Scaling — configuraciones de lanzamiento y grupos: `--auto-scaling-group-name`, `--availability-zones`, `--desired-capacity`, `--launch-configuration-name`, `--max-size`, `--min-size`
- Módulo 22 · Tema 1: ELB v2 — balanceadores, grupos objetivo y reglas: `--actions`, `--conditions`, `--default-actions`, `--listener-arn`, `--load-balancer-arn`, `--priority`, `--scheme`, `--target-type`
- Módulo 22 · Tema 2: ACM — certificados TLS con criptografía real: `--certificate-arn`, `--domain-name`, `--validation-method`
- Módulo 22 · Tema 3: CloudFront — distribución de contenido y control de acceso al origen: `--distribution-config`, `--distribution-id`, `--invalidation-batch`
- Módulo 22 · Tema 4: Route53 — zonas alojadas y registros de recursos: `--caller-reference`, `--change-batch`, `--hosted-zone-id`
- Módulo 22 · Tema 5: Cómo se integran los cuatro servicios en una arquitectura de borde real: `--certificates`, `--dns-name`, `--names`
- Módulo 23 · Tema 1: Qué resuelve un caché en memoria — y cuándo no ayuda: `--replication-group-id`, `redis-cli`
- Módulo 23 · Tema 2: Arquitectura de ElastiCache en Floci — contenedores reales, no simulación: `--replication-group-description`
- Módulo 23 · Tema 4: Autenticación IAM para el plano de datos de ElastiCache: `--access-string`, `--no-no-password-required`, `--user-id`, `--user-name`
- Módulo 24 · Tema 1: CodeBuild — compilaciones reales dentro de contenedores Docker: `--artifacts`, `--buildspec-override`, `--environment`, `--ids`, `--project-name`, `--service-role`, `--source`
- Módulo 24 · Tema 3: CodeDeploy — aplicaciones, grupos y configuraciones predefinidas: `--application-name`, `--compute-platform`, `--deployment-config-name`, `--deployment-group-name`, `--deployment-style`, `--service-role-arn`
- Módulo 24 · Tema 4: Despliegue Blue/Green de Lambda — cambio de tráfico por alias: `--deployment-id`, `--revision`
- Módulo 24 · Tema 5: Despliegue Blue/Green de ECS — cambio de tráfico por listener ELB: `--ecs-services`, `--load-balancer-info`
- Módulo 25 · Tema 1: AWS Config — rastrear reglas sobre tus recursos: `--config-rule`, `--config-rule-names`
- Módulo 25 · Tema 2: AppConfig — desplegar configuración sin redeployar código: `--application-id`, `--configuration-profile-id`, `--content`, `--content-type`, `--location-uri`
- Módulo 25 · Tema 3: AppConfigData — el plano de datos que consume tu aplicación: `--application-identifier`, `--configuration-profile-identifier`, `--configuration-token`, `--environment-identifier`
- Módulo 25 · Tema 4: AWS Backup — centralizar la política de respaldo de múltiples servicios: `--backup-plan`, `--backup-plan-id`, `--backup-selection`, `--backup-vault-name`
- Módulo 25 · Tema 5: El ciclo de vida de un trabajo de respaldo: `--backup-job-id`, `--iam-role-arn`, `--resource-arn`
- Módulo 26 · Tema 1: Amazon Data Firehose — entrega gestionada sin consumidores propios: `--delivery-stream-name`, `--record`, `--recursive`
- Módulo 26 · Tema 3: EventBridge Pipes — conectar origen y destino sin código de pegamento: `--message-body`, `--queue-name`, `--queue-url`, `--since`, `--target`
- Módulo 27 · Tema 1: AppSync — APIs GraphQL gestionadas: `--api-id`, `--authentication-type`
- Módulo 27 · Tema 2: Fuentes de datos y resolvers: `--data-source-name`, `--field-name`, `--type-name`
- Módulo 27 · Tema 3: SES — identidades, envío y plantillas: `--destination`, `--email-address`, `--template`, `--template-data`
- Módulo 27 · Tema 4: El simulador de buzones y el punto de inspección local: `--from`
- Módulo 28 · Tema 2: Neptune en Floci — un servidor Gremlin real, no una simulación: `--db-cluster-identifier`
- Módulo 28 · Tema 3: OpenSearch — modo simulado y modo real: `--cluster-config`, `--ebs-options`, `--engine-version`
- Módulo 28 · Tema 4: Eligiendo entre Neptune, OpenSearch y DynamoDB: `--key`, `--table-name`
- Módulo 29 · Tema 1: Cost Explorer — costos sintetizados a partir de tu estado real: `--granularity`, `--group-by`, `--metrics`, `--time-period`
- Módulo 29 · Tema 2: Pricing — catálogo de tarifas de referencia: `--filters`, `--service-code`
- Módulo 29 · Tema 3: BCM Data Exports — reportes de costo en formato estándar: `--export`
- Módulo 29 · Tema 4: Resource Groups Tagging API — descubrimiento centralizado por etiqueta: `--resource-arn-list`, `--tag-filters`, `--tags`
- Módulo 30 · Tema 1: Qué resuelve Transfer Family: `--endpoint-type`, `--protocols`
- Módulo 30 · Tema 2: Ciclo de vida del servidor y modelo de usuarios: `--home-directory`, `--role`, `--server-id`
- Módulo 30 · Tema 3: Claves públicas SSH y autenticación de usuarios: `--ssh-public-key-body`
- Módulo 34 · Tema 1: Instalación en macOS, Linux y Windows: `--format`
- Módulo 34 · Tema 4: Configuración avanzada y ciclo de vida: `--persist`
- Módulo 34 · Tema 5: Automatización, UI y agentes: `--bucket`
- Módulo 34 · Tema 6: Servicios AWS incorporados en la documentación actual: `--compute-environment-name`, `--compute-environments`, `--state`
- Módulo 34 · Tema 7: Servicios Azure que completan el recorrido: `--connection-string`, `--container-name`, `--file`
- Módulo 34 · Tema 9: Laboratorios oficiales reconstruidos en español: `--expires-in`

### devops

- Módulo 0 · Tema 1: Sistema de archivos y permisos (chmod/chown): `--rm`, `docker`
- Módulo 0 · Tema 6: Hardening básico — SSH sin contraseña, firewalls, SELinux/AppArmor: `--no-cache`
- Módulo 1 · Tema 1: Trunk-based development vs GitFlow: `--all`, `--graph`, `--no-ff`, `--oneline`, `git`
- Módulo 1 · Tema 4: Hooks de Git y commits firmados: `--cached`
- Módulo 1 · Tema 5: Monorepos vs polyrepos: `--stat`
- Módulo 1 · Tema 6: git cherry-pick, git stash, git reset vs git revert: `--no-edit`
- Módulo 2 · Tema 1: Dockerfile multi-stage: `--from`, `--omit`
- Módulo 2 · Tema 3: Imágenes base distroless/alpine: `--format`
- Módulo 2 · Tema 5: Redes en Docker: `--name`, `--network`
- Módulo 3 · Tema 4: Perfiles para distintos entornos: `--services`
- Módulo 4 · Tema 2: Caché de dependencias en CI: `--prefer-offline`
- Módulo 5 · Tema 3: Rolling updates: `--no-recreate`, `--scale`
- Módulo 6 · Tema 1: Pod, ReplicaSet, Deployment: `--record`, `kind`
- Módulo 6 · Tema 3: ConfigMaps y Secrets: `--command`, `--env`, `--from-literal`, `--image`, `--restart`
- Módulo 6 · Tema 4: kubectl esencial: `--requests`
- Módulo 6 · Tema 5: Namespaces: `--current`, `--namespace`
- Módulo 6 · Tema 6: StatefulSets, DaemonSets, Jobs y CronJobs: `--for`, `--timeout`
- Módulo 7 · Tema 2: Ingress Controllers y reglas de enrutamiento: `--port`, `--target-port`
- Módulo 7 · Tema 3: HorizontalPodAutoscaler: `--cpu-percent`, `--limits`, `--max`, `--min`, `--watch`
- Módulo 7 · Tema 4: Probes de liveness y readiness: `--from-file`
- Módulo 7 · Tema 5: RBAC en Kubernetes: `--as`
- Módulo 8 · Tema 6: Ansible — playbooks, roles, inventory y módulos: `ansible-playbook`
- Módulo 8 · Tema 7: Pulumi como alternativa a HCL: `node`
- Módulo 9 · Tema 1: Modelo de métricas de Prometheus — counter, gauge, histogram: `--silent`
- Módulo 9 · Tema 2: PromQL esencial: `--add-host`
- Módulo 9 · Tema 7: Métricas DORA — Lead Time, Deployment Frequency, MTTR, Change Failure Rate: `--date`, `python3`
- Módulo 11 · Tema 1: Escaneo de imágenes y dependencias (Trivy, Snyk): `--severity`, `--version`
- Módulo 11 · Tema 2: Integración en el pipeline: `--exit-code`
- Módulo 11 · Tema 3: Gestión de secretos (Vault, SOPS): `--cap-add`, `vault`
- Módulo 11 · Tema 5: SBOM y supply chain security: `--output`
- Módulo 12 · Tema 2: Gestión de secretos cloud-native: `--endpoint-url`, `--query`, `--secret-id`, `--secret-string`
- Módulo 14 · Tema 3: Construir una imagen no demuestra de dónde proviene: `--certificate-identity-regexp`, `--certificate-oidc-issuer`

### flutter

- Módulo 0 · Tema 1: Sound null safety: `flutter`
- Módulo 11 · Tema 1: Builds de release para cada plataforma: `--release`
- Módulo 11 · Tema 2: Iconos y splash screens: `dart`

### foundations

- Módulo 0 · Tema 1: Del hardware al programa en ejecución: `python`
- Módulo 3 · Tema 1: De una URL al servidor: red, DNS, IP y puertos: `--directory`
- Módulo 3 · Tema 2: HTTP como contrato observable: `curl`
- Módulo 5 · Tema 1: Depurar con evidencia, no con cambios aleatorios: `--oneline`
- Módulo 8 · Tema 3: Linux como entorno observable: `--fail`, `--silent`

### ios

- Módulo 0 · Tema 1: Optionals y unwrapping seguro: `--type`, `swift`

### java

- Módulo 6 · Tema 1: NIO.2 — Path y Files: `--version`
- Módulo 8 · Tema 1: pom.xml vs build.gradle.kts: `mvn`
- Módulo 13 · Tema 3: Build reproducible y cierre del track: `gradlew`
- Módulo 14 · Tema 4: El runtime es parte del artefacto y necesita ciclo de vida: `--add-modules`, `--ignore-missing-deps`, `--no-header-files`, `--no-man-pages`, `--output`, `--print-module-deps`, `--strip-debug`

### javascript

- Módulo 0 · Tema 1: Variables — `const`, `let` y `var`: `node`, `npm`
- Módulo 0 · Tema 5: JavaScript en navegador y Node.js: `npx`
- Módulo 7 · Tema 2: Tree-shaking y code-splitting: `--save-dev`
- Módulo 7 · Tema 3: Vite y esbuild: `--template`
- Módulo 11 · Tema 1: Tipos básicos, interfaces y type aliases: `--init`, `--noEmit`
- Módulo 14 · Tema 5: WebAssembly con Rust o C: `--target`

### kotlin-multiplatform

- Módulo 0 · Tema 1: Null safety real: `gradlew`
- Módulo 6 · Tema 1: Esquemas SQLDelight y queries tipadas: `--tests`
- Módulo 8 · Tema 1: El framework generado para iOS: `gradle`

### node

- Módulo 0 · Tema 1: Node no es "JavaScript en el servidor" sin más: `node`, `npm`
- Módulo 0 · Tema 3: process, global y módulos core: `--region`
- Módulo 1 · Tema 1: package.json y semver: `--save-dev`
- Módulo 1 · Tema 2: Lockfiles e instalación reproducible: `--depth`, `git`
- Módulo 1 · Tema 3: Workspaces — monorepos con npm/pnpm: `--workspace`
- Módulo 1 · Tema 4: Scripts de ciclo de vida: `--foreground-scripts`
- Módulo 3 · Tema 1: El modelo request/response: `curl`
- Módulo 5 · Tema 1: PostgreSQL desde Node con el driver puro: `--version`
- Módulo 5 · Tema 2: Prisma — schema, migraciones y queries tipadas: `--datasource-provider`, `--output`
- Módulo 7 · Tema 4: Alternativas de testing y debugging: `--inspect`
- Módulo 10 · Tema 4: OWASP API Security Top 10 y auditoría de dependencias: `--json`

### react

- Módulo 0 · Tema 1: JSX es azúcar sintáctica sobre createElement: `--template`, `npm`
- Módulo 10 · Tema 1: Server Components por defecto: `--app`, `--eslint`, `--no-tailwind`, `--src-dir`, `--ts`, `--use-npm`, `npx`
- Módulo 14 · Tema 1: Server Components y streaming: `--version`

### rutaflow

- Módulo 0 · Tema 1: El proceso logístico como sistema: `node`

### spring-boot

- Módulo 0 · Tema 1: Inversión de control y el contenedor de Spring: `curl`, `mvnw`
- Módulo 3 · Tema 1: Entidades y repositorios derivados: `mvn`
- Módulo 11 · Tema 1: Fat JAR vs capas de Docker: `--destination`
