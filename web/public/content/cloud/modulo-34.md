# Módulo 34: Floci oficial completo — plataforma, servicios y laboratorios

## Qué construirás y por qué importa

Crearás un laboratorio local multi-nube reproducible. Al terminar podrás instalar Floci desde cero, iniciar los tres proveedores, inspeccionarlos visualmente, conservar o aislar estado, ejecutar pruebas automatizadas y explicar con precisión qué valida el emulador y qué todavía debe comprobarse en una cuenta real.

Las fuentes principales son la [portada multi-nube](https://floci.io/), [Floci AWS](https://floci.io/aws/), [Floci Azure](https://floci.io/az/), [Floci GCP](https://floci.io/gcp/) y los [laboratorios 101](https://floci.io/labs/). También se consultan los repositorios mantenidos por `floci`, `floci-az`, `floci-gcp`, `floci-cli` y `floci-ui`. Esta lección no copia sus textos: reorganiza y explica sus capacidades en español con un recorrido educativo propio.


## Antes de empezar

- Docker debe responder a `docker version`.
- Debes reconocer una terminal y una variable de entorno.
- Crea `examples/tracks/cloud/floci-oficial/` para guardar comandos, resultados y errores.
- Nunca uses credenciales de producción. Los valores locales `test` no conceden acceso a AWS.

## Aprende construyendo

### Tema 1: Instalación en macOS, Linux y Windows

**¿Por qué es importante?** Un entorno diagnosticable evita que diferencias del sistema operativo se confundan con fallos del servicio cloud.

#### macOS

Con Homebrew, ejecuta `brew install floci-io/floci/floci`. Si prefieres el instalador oficial, usa `curl -fsSL https://floci.io/install.sh | sh`. Comprueba el resultado con `floci --version` y `floci doctor`; instalar no basta: el diagnóstico demuestra que Docker, la CLI y la conectividad local funcionan juntos.

#### Instalación en Linux

Usa el mismo instalador oficial con `curl -fsSL https://floci.io/install.sh | sh`. Si el comando no aparece después, revisa la carpeta indicada por el instalador y tu variable `PATH`. Ejecuta `docker ps` antes de culpar a Floci: un daemon de Docker detenido es el fallo inicial más común.

#### Instalación en Windows

En PowerShell puedes ejecutar `iwr https://floci.io/install.ps1 | iex`. La alternativa administrada es Scoop: `scoop bucket add floci https://github.com/floci-io/scoop-floci` y luego `scoop install floci`. Comprueba con `floci doctor`; si Docker Desktop usa WSL 2, verifica que la integración esté activa para tu distribución.

### Tema 2: Modelo mental de la plataforma

**¿Por qué es importante?** Distinguir cliente, CLI, emulador y motor real permite saber qué componente observar cuando una operación falla.

`floci-cli` administra procesos; `floci`, `floci-az` y `floci-gcp` implementan APIs locales; `floci-ui` permite observar recursos; los SDK y CLI oficiales siguen siendo los clientes. Esa separación evita aprender comandos inventados: cambia el endpoint, no la forma de programar.

#### Simulación de API frente a motor real

Floci no ejecuta todos los servicios de la misma manera. En servicios de plano de control puede conservar estado y responder con el protocolo compatible; en servicios de datos complejos levanta motores reales dentro de Docker. Esta diferencia determina qué conclusión puedes extraer de una prueba. Un `CreateCluster` exitoso demuestra compatibilidad del contrato de control; una consulta Redis, SQL, Kafka u OpenSearch exitosa también recorre el protocolo de datos real.

| Servicio local | Motor o ejecución | Qué puedes comprobar | Qué debes volver a validar en AWS |
|---|---|---|---|
| Lambda | Runtime oficial aislado en Docker | Variables, payload, errores, warm pool e integraciones | Cuotas, red regional y concurrencia a escala |
| RDS | PostgreSQL, MySQL o MariaDB reales | SQL, JDBC, migraciones y autenticación compatible | Multi-AZ, backups administrados y rendimiento |
| ElastiCache | Redis/Valkey real tras proxy SigV4 | RESP, comandos, cliente y fallos de autenticación | Topología, failover y latencia de red |
| ECS y EC2 | Contenedores Docker reales | Ciclo de vida, imágenes, UserData, SSH e IMDS | Hipervisor, tipos de instancia y red VPC real |
| MSK | Redpanda compatible con Kafka | Productores, consumidores, grupos y offsets | Operación multi-broker y disponibilidad regional |
| OpenSearch | Nodos OpenSearch reales | Índices, consultas y clientes del protocolo | Dimensionamiento, snapshots y upgrades |
| ECR | Registry OCI real | `docker push`, `docker pull` e imágenes Lambda | Replicación, escaneo y políticas regionales |
| Athena | DuckDB como motor local | SQL, archivos y errores de esquema | Coste por bytes, catálogo distribuido y límites |

```mermaid
flowchart LR
  Client["AWS CLI o SDK"] -->|"SigV4 + protocolo AWS"| Floci["Floci :4566"]
  Floci --> Control["Estado del plano de control"]
  Floci --> Runtime["Runtime Lambda"]
  Floci --> SQL["PostgreSQL / MySQL"]
  Floci --> Redis["Redis / Valkey"]
  Floci --> Kafka["Redpanda / Kafka"]
  Floci --> Search["OpenSearch"]
```

**Compruébalo sin aceptar la explicación a ciegas:** ejecuta `docker ps --format 'table {{.Names}}\t{{.Image}}'` antes y después de crear un recurso respaldado por un motor real. Debe aparecer un contenedor adicional para servicios como RDS, ElastiCache u OpenSearch. Luego elimina el recurso y observa su ciclo de vida. Si solo verificas la respuesta del comando `create-*`, todavía no has demostrado que el plano de datos funciona.

**Fallo deliberado:** detén manualmente el contenedor del motor y repite una operación de datos. La petición debe fallar aunque el recurso siga apareciendo en el plano de control. Diagnostica comparando `aws ... describe-*`, `docker ps -a` y `floci logs --follow`. Esta separación es la base para entender incidentes reales donde la API de administración responde, pero el motor de datos no está disponible.

```mermaid
flowchart LR
  U[CLI, SDK, Terraform o tests] --> C[floci-cli]
  C --> A[AWS :4566]
  C --> Z[Azure :4577]
  C --> G[GCP :4588]
  UI[floci-ui] --> A
  UI --> Z
  UI --> G
  A --> D[(Estado local o motores Docker reales)]
  Z --> D
  G --> D
```

Inicia AWS con `floci start`, Azure con `floci az start` y GCP con `floci gcp start`. Usa `eval $(floci env)`, `eval $(floci az env)` o `eval $(floci gcp env)` en shells compatibles. En PowerShell, canaliza la salida hacia `Invoke-Expression` según la guía oficial.

### Tema 3: AWS CLI y SDK, Azure CLI y SDK, GCP CLI y SDK

**¿Por qué es importante?** Usar clientes oficiales contra endpoints locales permite transferir el aprendizaje sin inventar una API educativa paralela.

AWS usa `AWS_ENDPOINT_URL=http://localhost:4566` y credenciales desechables. Azure exporta una cadena compatible con Azurite y endpoints específicos para Blob, App Configuration y Key Vault. GCP exporta hosts de emulador como `STORAGE_EMULATOR_HOST`, `PUBSUB_EMULATOR_HOST` y `FIRESTORE_EMULATOR_HOST` con un proyecto local.

Una variable mal aplicada suele producir dos errores opuestos: conexión rechazada si apunta al puerto equivocado, o una petición accidental a la nube real si el override no existe. Antes de ejecutar una operación destructiva, imprime el endpoint y confirma que contiene `localhost`.

### Tema 4: Configuración avanzada y ciclo de vida

**¿Por qué es importante?** Persistencia, aislamiento y hooks determinan si un laboratorio es reproducible o depende de estado manual oculto.

#### Puertos, Docker Compose y application.yml

Los puertos principales son 4566, 4577 y 4588. Azure también puede exponer AMQP para Event Hubs y Service Bus. Docker Compose permite fijar imagen, puertos, socket Docker, volúmenes y variables. `application.yml` ofrece configuración detallada del runtime; conserva en Git una plantilla sin secretos y documenta cada cambio respecto al valor predeterminado.

#### Persistencia y snapshots

`floci start --persist ./data` conserva estado entre reinicios. `floci snapshot save <nombre>` y `floci snapshot restore <nombre>` permiten guardar y recuperar un punto conocido. Persistencia sirve para desarrollo diario; una instancia limpia por suite es mejor para pruebas porque evita que un bucket o una cola anterior produzcan falsos positivos.

#### Aislamiento multi-account y aislamiento multi-project

AWS separa almacenamiento por identificador de cuenta; GCP hace lo propio por proyecto. Esto permite simular entornos o tenants sobre una instancia, pero no reemplaza controles reales de organización, cuotas o facturación. Una prueba correcta debe usar identificadores explícitos y demostrar que un contexto no puede ver el estado del otro.

#### TLS y HTTPS, Initialization hooks

TLS local permite recorrer código sensible al esquema HTTPS mediante un certificado autofirmado. El cliente debe confiar deliberadamente en ese certificado solo en desarrollo. Los Initialization hooks crean recursos al arrancar y convierten el entorno en reproducible; deben ser idempotentes para que un segundo inicio no falle ni duplique datos.

### Tema 5: Automatización, UI y agentes

**¿Por qué es importante?** La interfaz ayuda a observar, pero la automatización demuestra que el resultado puede repetirse desde un entorno limpio.

Testcontainers inicia un Floci aislado alrededor de la suite. Hay integraciones oficiales para Testcontainers Java, Testcontainers Node.js, Testcontainers Python y Testcontainers Go. El test obtiene endpoint y credenciales del contenedor, crea sus propios recursos, verifica comportamiento y deja que el framework destruya el entorno.

`floci-ui` es la consola visual para recorrer buckets, tablas, colas, funciones y recursos de los tres proveedores. Úsala como instrumento de observación, no como sustituto de la automatización: cada acción importante debe poder repetirse mediante código, CLI o infraestructura como código.

Para CI efímero, inicia Floci dentro del job, ejecuta migraciones y pruebas, captura logs cuando algo falle y destruye todo al finalizar. Los agentes de IA sin credenciales reales pueden usar este mismo entorno: el radio de impacto queda limitado al contenedor local y no existe una factura cloud accidental. Aun así, revisa el código generado y restringe el acceso al socket Docker.

#### Construcción guiada: un entorno seguro para un agente de programación

El objetivo no es permitir que un agente “haga cualquier cosa”, sino darle un contrato verificable y un destino local. Crea `examples/tracks/cloud/agente-local/.env.example` con valores desechables; el archivo real `.env` no debe contener credenciales cloud ni publicarse en Git.

```dotenv
AWS_ENDPOINT_URL=http://localhost:4566
AWS_DEFAULT_REGION=us-east-1
AWS_ACCESS_KEY_ID=test
AWS_SECRET_ACCESS_KEY=test
```

El agente puede usar AWS CLI, un SDK, Terraform u OpenTofu sin una integración especial porque el contrato cambia mediante el endpoint. Antes de autorizar código generado, ejecuta esta comprobación desde una terminal nueva:

```bash
floci start
eval "$(floci env)"
test "$AWS_ENDPOINT_URL" = "http://localhost:4566"
aws s3 mb s3://agente-seguro
aws s3api head-bucket --bucket agente-seguro
```

La salida de `head-bucket` es vacía cuando termina correctamente; comprueba el código de salida con `echo $?`, que debe ser `0` en macOS o Linux. En PowerShell usa `floci env | Invoke-Expression`, ejecuta el mismo comando AWS y revisa `$LASTEXITCODE`. Esta evidencia vale más que una respuesta textual del agente porque demuestra que el recurso existe en el runtime.

```mermaid
sequenceDiagram
  actor Persona as "Estudiante"
  participant Agent as "Agente de programación"
  participant Repo as "Código y pruebas"
  participant Floci as "Floci local"
  Persona->>Agent: Objetivo + límites + criterio verificable
  Agent->>Repo: Modifica código
  Agent->>Floci: Ejecuta CLI, SDK o IaC con claves test
  Floci-->>Agent: Estado y errores reales del contrato
  Agent->>Repo: Ejecuta pruebas y guarda evidencia
  Persona->>Repo: Revisa diff, seguridad y resultado
```

**Fallo deliberado:** elimina `AWS_ENDPOINT_URL` en una terminal aislada y ejecuta `aws s3 ls` sin credenciales reales. Debe fallar; cancela si el cliente intenta contactar AWS. La solución no es proporcionar una clave productiva, sino restaurar el endpoint local con `eval "$(floci env)"`. Añade a tu instrucción para el agente una regla comprobable: “detente si el endpoint no contiene `localhost`”.

**Límite profesional:** las claves desechables reducen filtraciones y costes, pero montar `/var/run/docker.sock` entrega control significativo sobre Docker. En CI utiliza un runner aislado y efímero; no expongas el socket a código no confiable en una estación que ejecute cargas sensibles. Antes de producción repite pruebas de IAM, cuotas, latencia, regiones, disponibilidad y facturación en una cuenta real controlada.

### Tema 6: Servicios AWS incorporados en la documentación actual

**¿Por qué es importante?** Relacionar cada servicio con un problema evita memorizar un catálogo sin comprender límites ni alternativas.

Los módulos anteriores explican los servicios principales. Esta tabla completa los que estaban solo implícitos o ausentes y explica para qué practicar cada uno.

| Servicio | Qué debes comprender y probar localmente |
|---|---|
| S3 Vectors | Almacenar y consultar vectores; mide dimensiones, filtros y diferencia frente a objetos S3 comunes. |
| RDS Data API | Ejecutar SQL mediante HTTP sin conexión persistente; valida parámetros y manejo de transacciones. |
| MemoryDB | Modelar una base compatible con Redis orientada a durabilidad y distinguirla de una caché. |
| Lightsail | Comprender el plano simplificado de cómputo, redes y recursos agrupados. |
| AWS Batch | Enviar trabajos, colas y definiciones; observa estados y reintentos del procesamiento por lotes. |
| Elastic Beanstalk | Relacionar aplicación, versión, entorno y configuración de plataforma. |
| API Gateway v2 | Construir APIs HTTP y WebSocket y compararlas con API Gateway REST. |
| AWS Cloud Map | Registrar servicios y descubrir instancias por nombre y atributos. |
| IoT Core | Practicar registro, políticas y mensajería de dispositivos sin conectar hardware real. |
| Amazon MQ | Explorar brokers y configuración de mensajería administrada. |
| WAF v2 | Definir ACL web y reglas; no asumir que una emulación de control equivale a protección perimetral real. |
| CloudWatch Metrics | Publicar, consultar y agregar métricas; enlaza dimensiones con una alarma verificable. |
| EMR | Modelar clústeres y pasos de procesamiento distribuido; verifica qué partes son plano de control local. |
| CodePipeline | Representar etapas, acciones y transiciones de entrega continua. |
| Cloud Control API | Gestionar recursos mediante una interfaz común y estudiar consistencia del modelo CRUD. |

El inventario completo también incluye S3, AWS Backup, Transfer Family, DynamoDB y Streams, ElastiCache, RDS, Neptune, DocumentDB, Lambda, EC2, Auto Scaling, ECS, ECR, EKS, ELB v2, Route 53, CloudFront, AppSync, SQS, SNS, Kinesis, EventBridge, Scheduler, Pipes, MSK, SES, IAM, STS, Cognito, KMS, Secrets Manager, ACM, CloudWatch Logs, AWS Config, CloudTrail, OpenSearch, Athena, Glue, Data Firehose, Bedrock Runtime, Textract, Transcribe, SSM Parameter Store, CloudFormation, Step Functions, AppConfig, CodeBuild, CodeDeploy, Resource Groups Tagging API, Cost Explorer, Pricing, CUR y BCM Data Exports.

### Tema 7: Servicios Azure que completan el recorrido

**¿Por qué es importante?** Comparar recursos Azure por plano de control y motor de datos evita asumir una fidelidad local que no existe.

| Servicio | Qué debes comprender y probar localmente |
|---|---|
| Azure Resource Manager | Crear recursos mediante el plano de control y comprender proveedor, tipo, grupo y suscripción. |
| Microsoft Entra ID | Recorrer OAuth2, OIDC y JWKS; separar autenticación de autorización del recurso. |
| Azure SQL Database | Gestionar el recurso y diferenciar plano ARM de conexiones SQL reales. |
| Azure Database for PostgreSQL | Practicar ciclo de vida y acceso PostgreSQL con configuración reproducible. |
| Azure Kubernetes Service | Crear el control plane local y operar workloads con kubectl sobre k3s cuando aplique. |
| Virtual Network | Modelar espacios de direcciones, subredes y límites de confianza. |
| Virtual Machines | Gestionar ciclo de vida y distinguir metadatos simulados de virtualización cloud real. |
| Azure Container Registry | Subir y descargar imágenes OCI y conectarlas con el despliegue de contenedores. |
| Communication Services Email | Preparar remitentes, mensajes y estados de entrega sin confundir aceptación con recepción final. |
| Managed Identity | Obtener tokens sin secretos estáticos y relacionar la identidad con permisos mínimos. |

Estos se suman a Blob Storage, Queue Storage, Table Storage, Azure Functions, App Configuration, Key Vault, Event Hubs, Service Bus, Cosmos DB, API Management, Azure Cache for Redis, Event Grid y Azure Monitor.

#### Construcción Azure: conserva una evidencia en Blob Storage

Inicia el proveedor con `floci az start` y carga las variables con `eval "$(floci az env)"`. En PowerShell usa `floci az env | Invoke-Expression`. La variable esencial es `AZURE_STORAGE_CONNECTION_STRING`: reúne cuenta, clave local y endpoints de Blob, Queue y Table. No la reemplaces con una cadena de producción.

```bash
mkdir -p examples/tracks/cloud/azure-blob
cd examples/tracks/cloud/azure-blob
printf '{"envio":"RF-101","estado":"recibido"}\n' > evidencia.json
az storage container create --name evidencias --connection-string "$AZURE_STORAGE_CONNECTION_STRING"
az storage blob upload --container-name evidencias --name RF-101.json --file evidencia.json --connection-string "$AZURE_STORAGE_CONNECTION_STRING"
az storage blob download --container-name evidencias --name RF-101.json --file recuperada.json --connection-string "$AZURE_STORAGE_CONNECTION_STRING"
cmp evidencia.json recuperada.json
```

`container create` debe devolver JSON con `created: true`; la carga debe informar que terminó y `cmp` no imprime nada cuando ambos archivos son idénticos. Comprueba además el blob en Floci UI. Si aparece `Connection refused`, ejecuta `floci az status` y `floci az doctor`; si el cliente intenta autenticar contra Azure remoto, imprime la cadena y confirma que contiene `localhost:4577`.

**Modificación:** añade metadatos `tipo=evidencia` y `guia=RF-101`, vuelve a cargar el blob y recupéralos con `az storage blob metadata show`. Esto conecta el ejercicio con RutaFlow: el objeto guarda el archivo; la base de datos conserva el estado transaccional de la entrega.

### Tema 8: Servicios GCP que completan el recorrido

**¿Por qué es importante?** Los hosts de emulador y proyectos explícitos impiden enviar pruebas por accidente a recursos remotos.

| Servicio | Qué debes comprender y probar localmente |
|---|---|
| Cloud Logging | Escribir y consultar entradas estructuradas con recurso, severidad y etiquetas. |
| Cloud KMS | Crear claves y versiones; diferencia cifrado local de custodia real de hardware. |
| Cloud SQL for PostgreSQL | Gestionar instancia y conectividad PostgreSQL sin asumir paridad de operación regional. |
| Cloud Scheduler | Programar invocaciones, revisar expresiones y probar reintentos de destinos fallidos. |
| Service Usage | Habilitar servicios y seguir operaciones de larga duración antes de usarlos. |
| Resource Manager | Organizar proyectos y metadatos; relacionar jerarquía con aislamiento. |
| Operations API | Consultar operaciones asíncronas y manejar estados pendiente, completado y error. |
| Eventarc | Enrutar eventos hacia destinos mediante filtros y contratos explícitos. |

También forman parte del catálogo Cloud Storage, Pub/Sub, Firestore, Datastore, Secret Manager, IAM, Managed Kafka, GKE, Cloud Run, Cloud Functions, Cloud Tasks, Cloud Monitoring, Firebase Auth y BigQuery.

#### Construcción GCP: archivo y evento con un proyecto local explícito

Ejecuta `floci gcp start` y después `eval "$(floci gcp env)"`; en PowerShell canaliza la salida a `Invoke-Expression`. Los SDK de GCP no comparten una única variable: Storage, Pub/Sub, Firestore y otros clientes leen hosts de emulador diferentes. `CLOUDSDK_CORE_PROJECT=floci-local` identifica el espacio local; no necesitas descargar un JSON de cuenta de servicio.

```bash
mkdir -p examples/tracks/cloud/gcp-storage
cd examples/tracks/cloud/gcp-storage
printf '{"envio":"RF-102","estado":"en-ruta"}\n' > evento.json
gcloud storage buckets create gs://rutaflow-local
gcloud storage cp evento.json gs://rutaflow-local/eventos/RF-102.json
gcloud storage ls gs://rutaflow-local/eventos/
gcloud storage cp gs://rutaflow-local/eventos/RF-102.json recuperado.json
cmp evento.json recuperado.json
```

El listado debe mostrar `gs://rutaflow-local/eventos/RF-102.json` y `cmp` debe terminar con código `0`. Si `gcloud` solicita iniciar sesión, detente: faltan los overrides locales. Ejecuta `floci gcp env --service gcs,pubsub`, aplica la salida y confirma que el endpoint de Storage contiene `localhost:4588`.

**Modificación:** publica un mensaje Pub/Sub que contenga solamente la URI del objeto, no el archivo completo. Un consumidor debe descargar la evidencia usando esa URI y confirmar el mismo contenido. Así practicas un patrón real: almacenamiento para cargas grandes y mensajería para notificar que están disponibles.

```mermaid
flowchart LR
  Mobile["Aplicación del repartidor"] -->|"evidencia.json"| Storage["Blob Storage o Cloud Storage"]
  Storage -->|"URI + id del envío"| Event["Service Bus o Pub/Sub"]
  Event --> Worker["Procesador RutaFlow"]
  Worker --> Verify["Hash, metadatos y estado"]
```

### Tema 9: Laboratorios oficiales reconstruidos en español

**¿Por qué es importante?** Un laboratorio guiado convierte documentación de referencia en predicción, ejecución, fallo y evidencia verificable.

#### AWS S3 Buckets 101

Crea un bucket, sube y descarga un objeto, configura una política y genera una URL prefirmada. Predice qué operación debe fallar antes de aplicar la política. Evidencia: comandos, respuesta, objeto recuperado y explicación de por qué una URL expirada deja de funcionar.

#### Athena y S3 101

Guarda datos en S3, registra catálogo y tabla en Glue y consulta con Athena. La ejecución local usa un motor real basado en DuckDB. Evidencia: archivo fuente, definición de tabla, consulta agregada y resultado verificable; provoca además un error de esquema y diagnostícalo.

#### Azure Blob Storage 101

Crea un contenedor, carga y descarga un blob y genera un SAS con permisos y vencimiento mínimos. Evidencia: hash del archivo original y recuperado, intento sin autorización y explicación de alcance temporal del SAS.

#### EC2 Ports In-Flight 101

Inicia una instancia local, abre y cierra puertos mientras corre y observa los sidecars `socat` que aparecen y desaparecen. Evidencia: `docker ps`, petición exitosa con el puerto abierto, fallo esperado al cerrarlo y explicación de la diferencia frente a publicar puertos solo al crear un contenedor.

### Tema 10: Límites y transferencia a producción

**¿Por qué es importante?** Reconocer qué no reproduce el entorno local evita trasladar conclusiones falsas sobre seguridad, escala, coste o disponibilidad.

Compatibilidad de API significa que clientes y formatos se comportan como espera el SDK; no significa que latencia regional, cuotas, IAM organizacional, facturación, hardware administrado, disponibilidad multi-zona y fallos del proveedor estén reproducidos completamente. Antes de producción ejecuta un conjunto pequeño de pruebas contractuales en la nube real, revisa seguridad y costes, y documenta cualquier diferencia.


## Construcción final multi-nube

1. Levanta los tres proveedores y registra sus health checks.
2. Demuestra persistencia, snapshot y restauración.
3. Demuestra aislamiento entre dos cuentas o proyectos.
4. Ejecuta uno de los cuatro laboratorios sin copiar los comandos finales.
5. Automatiza el laboratorio con Testcontainers o CI efímero.
6. Inspecciona el resultado en floci-ui.
7. Escribe una matriz: “validado localmente”, “requiere nube real”, “riesgo si se omite”.

**Verificación:** los health checks de AWS, Azure y GCP responden; un recurso sobrevive al reinicio y se recupera desde snapshot; dos cuentas o proyectos no pueden leer recursos ajenos; el laboratorio automatizado pasa desde un entorno limpio; y floci-ui refleja el estado creado por CLI o SDK. Adjunta comandos, identificadores ficticios, salida de pruebas y la matriz de límites locales frente a nube real.



## Criterio para avanzar

No marques este capítulo como completado hasta que otra persona pueda clonar tu carpeta, ejecutar una sola guía y obtener la misma evidencia sin preguntarte dónde colocar archivos, qué variables exportar o cómo reconocer el resultado correcto.
