# Guía completa de Floci en español latino

> Curso original de uso práctico. No es una traducción literal ni documentación
> oficial. Fue elaborado a partir de la estructura pública de Floci y está
> pensado para estudiarse sin conexión después de descargar las imágenes y
> dependencias necesarias.

**Versión revisada:** 5 de junio de 2026  
**Versión estable consultada de Floci:** `1.5.22`, publicada el 4 de junio de 2026  
**Producto principal de esta guía:** Floci, emulador local de servicios AWS

## 1. Qué es Floci

Floci permite ejecutar APIs compatibles con AWS en una computadora o en CI sin
usar una cuenta real. Las aplicaciones continúan usando AWS CLI o los SDK de
AWS, pero cambian su endpoint a `http://localhost:4566`.

El proyecto es de código abierto con licencia MIT. Su propuesta incluye:

- Un solo endpoint para el plano de control de los servicios AWS.
- Credenciales locales ficticias.
- Persistencia opcional.
- Contenedores reales para cargas que necesitan motores reales.
- Compatibilidad con flujos de LocalStack.
- Módulos de Testcontainers para pruebas aisladas.

Floci no reemplaza las pruebas finales contra AWS. Una emulación local reduce
tiempo y costo durante desarrollo, pero no reproduce cuotas, latencia,
disponibilidad, permisos organizacionales ni toda la conducta del servicio real.

## 2. Ecosistema Floci

El sitio principal presenta cinco piezas:

| Pieza | Uso |
|---|---|
| `floci` | Emulación de servicios AWS en el puerto `4566` |
| `floci-az` | Emulación local de servicios Azure en el puerto `4577` |
| `floci-gcp` | Emulación local de servicios GCP en el puerto `4588` |
| `floci-cli` | Inicio, parada, diagnóstico y variables de los emuladores |
| `floci-ui` | Exploración visual de recursos locales |

Esta guía profundiza en `floci` para AWS porque es el producto con la
documentación de servicios más extensa. Al final se incluye una introducción a
Azure, GCP, CLI y UI.

## 3. Ruta del curso

### Nivel 1: fundamentos

1. Instalar Docker y AWS CLI.
2. Arrancar Floci.
3. Configurar endpoint y credenciales.
4. Trabajar con S3, SQS y DynamoDB.
5. Conectar una aplicación con un SDK.

### Nivel 2: aplicaciones

1. Agregar SNS, Lambda y API Gateway.
2. Administrar configuración con SSM y Secrets Manager.
3. Automatizar recursos con CloudFormation.
4. Observar logs y métricas con CloudWatch.
5. Crear pruebas con Testcontainers.

### Nivel 3: integración

1. Diseñar flujos con EventBridge, Scheduler y Step Functions.
2. Ejecutar bases de datos, cachés, Kafka y OpenSearch.
3. Trabajar con ECR, ECS, EKS y EC2.
4. Activar persistencia, TLS y aislamiento por cuenta.
5. Migrar un proyecto desde LocalStack.

### Nivel 4: experto

1. Construir Floci desde el código fuente.
2. Ajustar `application.yml`.
3. Probar IAM y firma SigV4.
4. Crear inicializaciones reproducibles para CI.
5. Combinar servicios en arquitecturas completas.

## 4. Requisitos

### Opción recomendada

- Docker 20.10 o posterior.
- Docker Compose v2, invocado como `docker compose`.
- AWS CLI v2.
- Al menos 2 GB libres para laboratorios sencillos.
- Más memoria y disco para RDS, EKS, MSK u OpenSearch.

### Compilación desde fuente

- Java 25 o posterior.
- Maven 3.9 o posterior.
- GraalVM o Mandrel con `native-image` para producir un binario nativo.

## 5. Instalación

### Docker Compose

Este directorio ya contiene un [`docker-compose.yml`](docker-compose.yml):

```bash
cp .env.example .env
docker compose pull
docker compose up -d
docker compose ps
```

Se fija la versión `1.5.22-compat` para que el laboratorio sea reproducible y
los hooks puedan usar AWS CLI. Cambia a `floci/floci:latest-compat` cuando
quieras seguir automáticamente la versión estable.

### Docker directo

```bash
docker run --rm \
  --name floci \
  -p 4566:4566 \
  -v "$PWD/data:/app/data" \
  -v /var/run/docker.sock:/var/run/docker.sock \
  floci/floci:1.5.22
```

### Imágenes disponibles

- Estable estándar: `latest` o una versión `x.y.z`.
- Estable compat: `latest-compat` o `x.y.z-compat`.
- Desarrollo: `nightly` o una etiqueta nocturna fechada.

La variante `compat` agrega herramientas como AWS CLI y boto3 dentro del
contenedor. Resulta útil para scripts de inicialización que las invocan.

### Binario o código fuente

```bash
git clone https://github.com/floci-io/floci.git
cd floci
mvn quarkus:dev
```

Para un JAR:

```bash
mvn clean package -DskipTests
java -jar target/quarkus-app/quarkus-run.jar
```

Para compilación nativa:

```bash
mvn clean package -Pnative -DskipTests
./target/floci-runner
```

## 6. Configuración de AWS CLI

```bash
export AWS_ENDPOINT_URL=http://localhost:4566
export AWS_DEFAULT_REGION=us-east-1
export AWS_REGION=us-east-1
export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test
```

AWS CLI v2 reconoce `AWS_ENDPOINT_URL`, por lo que no hace falta repetir
`--endpoint-url` en cada orden.

Prueba mínima:

```bash
aws sts get-caller-identity
aws s3api list-buckets
aws sqs list-queues
```

También puedes crear un perfil:

```bash
aws configure --profile floci
```

Usa valores ficticios, región `us-east-1` y agrega el endpoint mediante variable
de entorno o configuración del cliente.

## 7. Configuración de SDK

### Python con boto3

```python
import boto3

s3 = boto3.client(
    "s3",
    endpoint_url="http://localhost:4566",
    region_name="us-east-1",
    aws_access_key_id="test",
    aws_secret_access_key="test",
)
```

### Node.js y TypeScript

```javascript
import { S3Client } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  endpoint: "http://localhost:4566",
  region: "us-east-1",
  credentials: { accessKeyId: "test", secretAccessKey: "test" },
  forcePathStyle: true,
});
```

### Java, AWS SDK v2

```java
S3Client s3 = S3Client.builder()
    .endpointOverride(URI.create("http://localhost:4566"))
    .region(Region.US_EAST_1)
    .credentialsProvider(StaticCredentialsProvider.create(
        AwsBasicCredentials.create("test", "test")))
    .forcePathStyle(true)
    .build();
```

### Go, AWS SDK v2

```go
cfg, err := config.LoadDefaultConfig(
    context.TODO(),
    config.WithRegion("us-east-1"),
    config.WithCredentialsProvider(
        credentials.NewStaticCredentialsProvider("test", "test", ""),
    ),
    config.WithBaseEndpoint("http://localhost:4566"),
)
```

Comprueba siempre la forma actual de configurar endpoints en la versión del SDK
que uses, porque las APIs de los SDK pueden cambiar.

## 8. Primer laboratorio: S3, SQS y DynamoDB

### S3

```bash
aws s3 mb s3://curso-floci
printf 'hola floci\n' > hola.txt
aws s3 cp hola.txt s3://curso-floci/archivos/hola.txt
aws s3 ls s3://curso-floci --recursive
aws s3 cp s3://curso-floci/archivos/hola.txt -
```

### SQS

```bash
QUEUE_URL="$(aws sqs create-queue \
  --queue-name pedidos \
  --query QueueUrl \
  --output text)"

aws sqs send-message \
  --queue-url "$QUEUE_URL" \
  --message-body '{"pedidoId":"P-1","estado":"creado"}'

aws sqs receive-message \
  --queue-url "$QUEUE_URL" \
  --wait-time-seconds 1
```

### DynamoDB

```bash
aws dynamodb create-table \
  --table-name Usuarios \
  --attribute-definitions AttributeName=id,AttributeType=S \
  --key-schema AttributeName=id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST

aws dynamodb put-item \
  --table-name Usuarios \
  --item '{"id":{"S":"u-1"},"nombre":{"S":"Ana"}}'

aws dynamodb get-item \
  --table-name Usuarios \
  --key '{"id":{"S":"u-1"}}'
```

## 9. Archivos de ejemplo incluidos

Python:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r examples/python/requirements.txt
python examples/python/demo.py
```

Node.js:

```bash
cd examples/node
npm install
npm run demo
```

## 10. Configuración esencial

### Persistencia

Los modos habituales son:

- Memoria: rápido y desechable.
- Persistente: conserva recursos en un directorio.
- Sobrescritura por servicio: permite que unos servicios persistan y otros no.

El Compose de esta guía monta `./data` en `/app/data`. No borres ese directorio
si quieres conservar el estado.

Los servicios con contenedores reales pueden crear volúmenes Docker propios.
Revisa antes de eliminar volúmenes porque la operación destruye datos.

### Variables de entorno

La documentación agrupa variables para:

- URL y puerto global.
- autenticación y firma;
- CORS;
- TLS;
- almacenamiento;
- socket, red, registros y credenciales de Docker;
- DNS;
- hooks de inicialización;
- habilitación, límites y conducta de cada servicio.

La convención más común es `FLOCI_SERVICES_<SERVICIO>_<OPCION>`. Consulta la
referencia oficial de la versión fijada antes de usar una variable en producción
o CI, ya que puede cambiar.

### Puertos

| Rango | Uso |
|---|---|
| `4566` | Endpoint principal AWS |
| `5100-5199` | Registros ECR |
| `6379-6399` | ElastiCache |
| `6500-6599` | API de EKS en modo real |
| `7001-7099` | RDS |
| `9200-9299` | Runtime interno de Lambda |
| `9400-9499` | OpenSearch en modo real |

No todos estos rangos se publican en el servicio principal. Algunos
contenedores administrados por Floci se enlazan directamente al host.

### Docker

Lambda, ECR, ECS, EC2, EKS, RDS, ElastiCache, MSK y OpenSearch pueden necesitar
acceso al daemon. Monta:

```yaml
volumes:
  - /var/run/docker.sock:/var/run/docker.sock
```

Para registros privados puedes montar la configuración Docker del usuario o
configurar credenciales explícitas. Limita quién puede modificar el Compose:
acceder al socket Docker equivale a tener privilegios altos sobre el host.

### TLS y HTTPS

Floci puede servir HTTPS con certificado autofirmado o uno proporcionado por el
usuario. En desarrollo puedes configurar el SDK para confiar en el certificado,
pero es preferible instalar la CA local en vez de desactivar toda validación.
Los WebSockets pasan de `ws://` a `wss://`.

### Aislamiento por cuenta

Por defecto se usa una sola cuenta local. Al activar aislamiento, el identificador
de cuenta derivado de las credenciales separa recursos, ARN y persistencia.
Prueba con dos perfiles que usen distintos access keys de 12 dígitos y crea el
mismo nombre de cola en ambos.

### Inicialización

Floci ejecuta hooks por fases del ciclo de vida. Esta guía incluye:

```text
examples/init/ready.d/10-seed.sh
```

El script crea un bucket, una cola y una tabla cuando el servicio está listo.
Los nombres numerados hacen explícito el orden. Los scripts deben ser
idempotentes para tolerar reinicios.

## 11. Migración desde LocalStack

Floci busca compatibilidad de puerto, endpoints y flujo de herramientas.

Proceso recomendado:

1. Fija una versión de Floci.
2. Sustituye la imagen en una rama.
3. Mantén el puerto `4566`.
4. Mapea las variables que tengan equivalente.
5. Usa la imagen `compat` si los hooks requieren AWS CLI o boto3 internos.
6. Revisa endpoints de salud e inspección.
7. Ejecuta la suite completa.
8. Revisa diferencias documentadas por servicio.

Ejemplo:

```yaml
services:
  floci:
    image: floci/floci:1.5.22-compat
    ports:
      - "4566:4566"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
```

No asumas paridad total. Verifica especialmente IAM, Lambda, CloudFormation,
redes, servicios respaldados por contenedores y extensiones específicas de
LocalStack.

## 12. Catálogo completo de servicios AWS

La versión consultada documenta 52 servicios lógicos y algunos planos de datos
separados. Cada ficha indica qué estudiar y propone una práctica.

### 12.1 Configuración, identidad y seguridad

#### SSM Parameter Store

Almacena parámetros de texto, listas y valores marcados como seguros. Practica
crear, consultar por nombre o ruta y eliminar parámetros. Úsalo para
configuración que no deba estar codificada en la aplicación.

#### Secrets Manager

Administra secretos, versiones y etiquetas como `AWSCURRENT`. Practica crear un
JSON, rotar su valor, consultar una versión, generar una contraseña y eliminar
con o sin ventana de recuperación.

#### IAM

Incluye usuarios, grupos, roles, políticas, perfiles de instancia, access keys,
políticas inline y managed policies. El modo de aplicación de permisos permite
ensayar autorizaciones. Prueba primero con permisos permitidos y luego agrega
un `Deny` explícito.

#### STS

Simula identidad del llamador, sesiones y asunción de roles. Es el mejor smoke
test inicial:

```bash
aws sts get-caller-identity
```

#### KMS

Permite claves, alias, cifrado, descifrado, data keys y una parte del modelo de
grants. Practica envelope encryption: cifra datos con una data key y protege
esa data key con KMS.

#### ACM

Genera certificados X.509 locales con claves reales y emisión rápida. Practica
solicitar, describir, etiquetar, obtener PEM y exportar certificados privados.

#### Cognito

Cubre pools de usuarios, clientes, usuarios, grupos, autenticación, scopes,
discovery OAuth y JWT. Construye un flujo de registro administrativo, contraseña
permanente, login y validación del token.

#### AWS Config

Modela reglas, recorder, delivery channel, conformance packs y etiquetas.
Úsalo para probar el código que administra postura de cumplimiento, no para
evaluar toda la semántica real de AWS Config.

#### Resource Groups Tagging API

Permite consultar y filtrar recursos etiquetados desde una API común. Practica
etiquetar recursos de varios servicios y recuperarlos por clave y valor.

### 12.2 Almacenamiento y bases de datos

#### S3

Cubre buckets, objetos, copias, versiones, multipart, etiquetas, ACL,
notificaciones, políticas y S3 Select. Prueba estilos path y virtual-hosted.
S3 Select puede consultar CSV, JSON o Parquet según el modo configurado.

#### DynamoDB y Streams

Incluye tablas, items, consultas, scans, índices, TTL, streams y exportación a
S3. Diseña bien partition y sort keys; no uses `Scan` como sustituto habitual
de `Query`.

#### RDS

El plano de control crea instancias respaldadas por PostgreSQL o MySQL reales.
El endpoint devuelto incluye un puerto local. Practica crear una instancia,
conectarte con el cliente nativo, ejecutar migraciones y comprobar persistencia.

#### ElastiCache

Administra grupos y los conecta con contenedores Redis/Valkey reales mediante
un proxy RESP. Practica strings, expiración, hashes y autenticación IAM si tu
caso la requiere.

#### Neptune

Expone administración estilo RDS y un plano de datos Gremlin. Practica crear un
cluster, agregar vértices y recorrer relaciones. No presupongas soporte de todas
las APIs ni de todos los motores de Neptune.

#### OpenSearch

Tiene modo mock y modo real. El modo real crea un contenedor OpenSearch y
publica un puerto de datos. Practica crear dominio, índice, documento, búsqueda
y eliminación.

#### AWS Backup

Modela vaults, planes, selecciones, jobs y recovery points para tipos de recurso
admitidos. Verifica el ciclo de vida simulado de los trabajos y sus limitaciones.

### 12.3 Mensajería, eventos y streaming

#### SQS

Incluye colas estándar y FIFO, mensajes, atributos, long polling, visibilidad,
purga y dead-letter queues. Implementa un consumidor idempotente y elimina el
mensaje solo después de procesarlo.

#### SNS

Permite topics, suscripciones, publicación, fan-out hacia SQS y push móvil
simulado. Ensaya filtros y una cola de errores para cada consumidor crítico.

#### EventBridge

Administra buses, reglas, patrones, destinos y publicación de eventos. Crea una
regla que envíe `pedido.creado` a Lambda y otra que ignore eventos no válidos.

#### EventBridge Scheduler

Administra grupos y programaciones con reintentos y DLQ. Practica expresiones de
fecha, intervalos y cron. En pruebas, usa ventanas cortas y comprueba el destino.

#### EventBridge Pipes

Conecta fuentes con destinos, por ejemplo SQS con Lambda. Practica crear,
iniciar, detener, actualizar y eliminar un pipe, y verifica sus estados.

#### Kinesis

Incluye streams, shards, records, iterators y consumidores enhanced fan-out.
Prueba distribución por partition key y lectura desde distintos tipos de
iterator.

#### Data Firehose

Recibe registros y los entrega a destinos compatibles. Construye un flujo hacia
S3 y verifica agrupación, serialización y contenido final.

#### MSK

El plano de control administra clusters y el plano de datos usa un broker
Redpanda/Kafka real. Crea un topic con herramientas Kafka, produce eventos,
consume desde un grupo y prueba offsets.

### 12.4 Cómputo, contenedores y red

#### Lambda

Ejecuta funciones en contenedores Docker. Soporta operaciones de ciclo de vida,
invocación y varias integraciones. Estudia paquetes Zip, imágenes ECR, variables,
logs, concurrencia, event source mappings y recarga de código.

En Linux con UFW, los contenedores Lambda pueden requerir permiso de entrada por
`docker0` hacia los puertos internos. Limita la regla al bridge y al rango
necesario.

#### ECR

Combina un plano de control compatible con AWS y un registro OCI real. Practica
crear un repositorio, obtener login, etiquetar una imagen, hacer push, listar y
hacer pull. El registro se inicia bajo demanda.

#### ECS

Administra clusters, task definitions, tasks, services, task sets, capacity
providers y despliegues. El modo real puede ejecutar contenedores; el modo mock
es más apropiado para pruebas rápidas de control plane.

#### EKS

En modo real crea clusters k3s; en mock solo simula el plano de control. Practica
crear el cluster, obtener endpoint, configurar `kubectl`, desplegar un pod y
eliminar todos los recursos.

#### EC2

Modela instancias, VPC, subnets, security groups, key pairs, AMI y etiquetas.
Puede mapear AMI a imágenes Docker, inyectar claves, ejecutar user data y
exponer IMDS. Evalúa por separado la fidelidad de red.

#### API Gateway v1

Permite REST APIs, recursos, métodos, integraciones y stages. Crea un endpoint
`GET /saludo` integrado con Lambda, despliega un stage y llama la URL local.

#### API Gateway v2

Cubre HTTP APIs y WebSocket APIs, rutas, integraciones, deployments y stages.
Prueba una ruta HTTP con payload v2 y una conexión WebSocket local.

#### ELB v2

Administra load balancers, target groups, targets, listeners y reglas. Practica
enrutamiento por path y revisa qué parte es control plane simulado frente a
tráfico de datos real.

#### Auto Scaling

Incluye launch configurations, grupos, instancias, políticas, hooks y
actividades. El reconciliador ajusta capacidad y puede integrarse con ELB.
Prueba escalar de 1 a 3 y regresar a 1.

#### CloudFront

Modela distribuciones, invalidaciones, políticas, OAC/OAI, funciones y tags.
Practica una distribución con origen S3, consulta su configuración y crea una
invalidación.

#### Route53

Incluye hosted zones, record sets, health checks y cambios. Practica una zona
privada de laboratorio, registros A/CNAME y eliminación ordenada.

#### Transfer Family

Administra servidores, usuarios, claves SSH y etiquetas. Está orientado al plano
de control; confirma si tu caso necesita transferencia de archivos real.

### 12.5 Orquestación, despliegue y DevOps

#### CloudFormation

Valida templates, crea, actualiza y elimina stacks, eventos y change sets.
Soporta un conjunto delimitado de tipos de recursos. Mantén templates pequeños
y revisa la tabla oficial antes de usar un tipo.

#### Step Functions

Administra state machines, executions e historial. Practica estados `Pass`,
`Task`, `Choice`, `Wait`, `Parallel`, `Map`, éxito y fallo según el soporte de
la versión.

#### CodeBuild

Administra proyectos, builds, report groups, credenciales e imágenes. Puede
ejecutar builds y leer `buildspec`. Crea un build que produzca un artefacto S3.

#### CodeDeploy

Incluye aplicaciones, deployment groups, configuraciones y despliegues para
Lambda y ECS. Ensaya un despliegue Lambda y un blue/green ECS con AppSpec.

#### AppConfig y AppConfigData

El plano de administración crea aplicaciones, entornos, perfiles, versiones y
deployments. El plano de datos abre sesiones y entrega configuración. Practica
publicar JSON y consumirlo desde una aplicación.

#### AppSync

Administra APIs GraphQL, schemas, data sources, resolvers, functions, API keys,
tags y variables. Practica cargar un schema mínimo y consultar tipos y
resolvers; revisa si el data plane que necesitas está implementado.

### 12.6 Datos, analítica e IA

#### Glue

Incluye Data Catalog y Schema Registry. Crea bases, tablas para JSON/Parquet,
particiones y schemas. Es una pieza central para Athena.

#### Athena

Ejecuta consultas mediante un sidecar analítico y puede leer datos registrados
en Glue y almacenados en S3. Practica un pequeño data lake: CSV en S3, tabla
Glue, consulta SQL, polling y resultados.

#### Textract

Simula operaciones síncronas y asíncronas con bloques de respuesta compatibles.
No realiza OCR real en todos los casos. Úsalo para probar control de flujo,
polling y parseo de respuestas.

#### Transcribe

Simula jobs y vocabularios, con finalización rápida y URI sintética. No convierte
audio a texto. Sirve para probar el código que crea, lista, consulta y elimina
trabajos.

#### Bedrock Runtime

Expone operaciones de conversación e invocación con respuestas stub. No ejecuta
modelos fundacionales reales y el streaming puede no estar disponible. Úsalo
para probar integración HTTP y manejo de formatos, no calidad de inferencia.

### 12.7 Costos y gobierno financiero

#### Pricing

Consulta una instantánea local de productos y atributos de precios. Puedes
proporcionar una instantánea propia para ampliar cobertura. No la uses para
decisiones financieras sin validar contra datos actuales de AWS.

#### Cost Explorer

Genera datos sintéticos para consultas de costo y uso. Practica agrupaciones,
filtros y semántica de tipos de registro. Los valores no representan una factura.

#### Cost and Usage Reports

Administra definiciones CUR y puede emitir Parquet hacia S3 mediante un sidecar.
Practica definir reporte, emitirlo y leerlo con DuckDB o PyArrow.

#### BCM Data Exports

Administra exports de Billing and Cost Management, validación, ejecución y
emisión. Úsalo para probar pipelines de descarga y transformación con datos
locales.

### 12.8 Correo

#### SES y SES v2

Incluye identidades, envío simple, raw MIME, plantillas y plano v2 según la
operación. Puede capturar mensajes localmente y exponer relay SMTP. Prueba texto,
HTML, adjuntos y validación de destinatarios sin enviar correo real.

## 13. Laboratorio intermedio: API orientada a eventos

Arquitectura:

```text
Cliente -> API Gateway -> Lambda -> DynamoDB
                              |
                              +-> EventBridge -> SQS -> consumidor
```

Objetivos:

1. Crear tabla `Pedidos`.
2. Crear cola `pedidos-auditoria`.
3. Crear función que guarde el pedido y publique un evento.
4. Crear regla que envíe el evento a la cola.
5. Crear API y ruta `POST /pedidos`.
6. Invocar la API.
7. Verificar DynamoDB, SQS y CloudWatch Logs.
8. Repetir la petición para comprobar idempotencia.

Criterios de terminado:

- La API devuelve un identificador.
- DynamoDB contiene un solo pedido.
- La cola recibe un evento válido.
- Los logs incluyen correlation ID, no secretos.
- La infraestructura se puede recrear desde scripts.

## 14. Laboratorio avanzado: data lake local

Arquitectura:

```text
Productor -> Firehose -> S3 -> Glue Catalog -> Athena
```

Pasos:

1. Crear bucket de datos y bucket de resultados.
2. Crear delivery stream.
3. Publicar registros JSON.
4. Registrar tabla y columnas en Glue.
5. Ejecutar una consulta Athena.
6. Esperar estado final.
7. descargar y validar resultados.
8. Añadir una consulta S3 Select para comparar.

Extensión experta: producir los eventos con Kinesis o MSK y emitir un CUR local
en Parquet para analizarlo junto con datos de aplicación.

## 15. Testcontainers

Testcontainers inicia una instancia Floci por suite o por conjunto de pruebas,
elige un puerto libre y destruye el contenedor al terminar. Evita depender de un
daemon compartido y reduce contaminación de estado.

### Java

Paquete documentado: `io.floci:testcontainers-floci`.

```java
@Testcontainers
class S3Test {
  @Container
  static FlociContainer floci = new FlociContainer();
}
```

También existe integración con JUnit 5 y Spring Boot `@ServiceConnection`.

### Node.js y TypeScript

Paquete documentado: `@floci/testcontainers`. Se integra con Jest y Vitest.
Reutiliza el contenedor dentro de la suite para evitar arranques innecesarios.

### Python

Paquete documentado: `testcontainers-floci`. Puede usarse como context manager
o fixture `pytest` de sesión.

### Go

La guía oficial incluye creación, opciones, acceso al contenedor iniciado y
ejemplos SQS/DynamoDB. Confirma la versión publicada del módulo antes de fijarla.

Patrón de prueba:

1. Inicia Floci.
2. Obtén endpoint, región y credenciales.
3. Construye el cliente SDK.
4. Crea explícitamente recursos.
5. Ejecuta el comportamiento bajo prueba.
6. Afirma resultados observables.
7. Deja que Testcontainers limpie el entorno.

## 16. CI

Ejemplo conceptual para GitHub Actions:

```yaml
services:
  floci:
    image: floci/floci:1.5.22
    ports:
      - 4566:4566
```

Después configura las variables AWS, espera el endpoint y ejecuta pruebas. Para
Lambda u otros servicios con contenedores hijos, suele ser más confiable usar
Testcontainers o iniciar Floci con acceso adecuado al daemon.

Buenas prácticas:

- Fijar versión.
- Evitar `sleep` fijo; consultar salud.
- Crear recursos por prueba o namespace.
- Mantener logs del contenedor como artefacto cuando falle.
- Usar modo efímero salvo que la prueba valide persistencia.
- No usar credenciales AWS reales.

## 17. Diagnóstico

### No responde el puerto 4566

```bash
docker compose ps
docker compose logs --tail=200 floci
curl -i http://localhost:4566/_localstack/health
```

### AWS CLI intenta llegar a AWS real

```bash
env | grep '^AWS_'
aws configure list
```

Confirma `AWS_ENDPOINT_URL`. Nunca ejecutes comandos destructivos hasta verificar
el endpoint mostrado.

### S3 falla con nombres de host

Activa path-style en el SDK o configura DNS de virtual-hosted style. Dentro de
contenedores, `localhost` apunta al contenedor actual, no siempre a Floci.

### Lambda no puede iniciar

- Comprueba el socket Docker.
- Revisa permisos.
- Revisa red y UFW en Linux.
- Comprueba puertos internos.
- Mira logs de Floci y del contenedor de función.

### RDS, EKS u OpenSearch no conectan

Usa el host y puerto devueltos por la API. Comprueba colisiones de rangos,
recursos Docker, memoria y arquitectura de imagen.

### Estado inesperado después de reiniciar

Comprueba modo de almacenamiento, bind mount, permisos del directorio y
volúmenes Docker administrados.

## 18. Seguridad local

- Usa credenciales ficticias.
- No montes secretos reales en hooks.
- No publiques `4566` en interfaces externas sin necesidad.
- Protege el socket Docker.
- No desactives TLS globalmente en equipos compartidos.
- Limpia datos y volúmenes antes de compartir artefactos.
- Mantén una prueba separada contra AWS para permisos y comportamiento críticos.

## 19. Contribución

Flujo general:

1. Crear un fork.
2. Abrir una rama enfocada.
3. Ejecutar pruebas del módulo afectado.
4. Agregar pruebas para cambios de comportamiento.
5. Actualizar documentación sin duplicar la matriz canónica de servicios.
6. Abrir un pull request con alcance, motivación y verificación.

El proyecto usa Quarkus, Java y compilación nativa con GraalVM/Mandrel. Antes de
implementar una operación nueva, estudia el protocolo AWS correspondiente y los
patrones de handlers ya existentes.

## 20. Floci CLI, UI, Azure y GCP

### CLI

Instalación publicada para macOS y Linux:

```bash
curl -fsSL https://floci.io/install.sh | sh
floci start
floci doctor
floci env
```

Revisa el script antes de canalizarlo al shell, especialmente en entornos
corporativos. La CLI unifica arranque y diagnóstico de los emuladores.

### UI

`floci-ui` permite explorar recursos como buckets, tablas, colas, funciones y
logs. Úsala para inspección; conserva scripts o infraestructura como código como
fuente reproducible del entorno.

### Azure

`floci-az` se publica como emulador independiente en el puerto `4577` y cubre
servicios como Blob, Queue, Table, Functions, App Configuration, Key Vault,
Event Hubs y Service Bus. Los clientes deben usar endpoints o connection
strings locales.

### GCP

`floci-gcp` se publica en el puerto `4588` y cubre Cloud Storage, Pub/Sub,
Firestore, Datastore, Secret Manager, IAM y Managed Kafka según el sitio
consultado. Configura los overrides de endpoint de `gcloud` o del SDK.

La madurez y cobertura de Azure y GCP no deben inferirse a partir de la matriz
AWS. Consulta sus repositorios y documentación específicos.

## 21. Proyecto final

Construye una plataforma local de pedidos:

- API Gateway recibe pedidos.
- Cognito protege la API.
- Lambda valida y persiste en DynamoDB.
- EventBridge distribuye eventos.
- SQS desacopla facturación.
- SNS notifica.
- Step Functions coordina pago y reserva.
- Secrets Manager almacena configuración sensible ficticia.
- SSM almacena flags.
- CloudWatch captura métricas y logs.
- S3 conserva comprobantes.
- Glue y Athena generan reportes.
- CloudFormation crea el entorno.
- Testcontainers ejecuta integración en CI.

Entrega mínima:

1. Infraestructura reproducible.
2. Aplicación con endpoint configurable.
3. Pruebas de éxito, duplicados y fallos.
4. DLQ verificable.
5. Trazabilidad por correlation ID.
6. Script de limpieza.
7. Documento de diferencias entre Floci y AWS real.

## 22. Lista de dominio

Marca cada punto cuando puedas demostrarlo:

- [ ] Inicio y parada reproducibles.
- [ ] AWS CLI y un SDK conectados.
- [ ] Persistencia y modo efímero.
- [ ] S3, SQS y DynamoDB.
- [ ] Lambda y API Gateway.
- [ ] SNS, EventBridge y Step Functions.
- [ ] IAM, STS, KMS, SSM y Secrets Manager.
- [ ] Logs, métricas y diagnóstico.
- [ ] Un servicio con motor real.
- [ ] CloudFormation.
- [ ] Testcontainers.
- [ ] CI.
- [ ] TLS y aislamiento por cuenta.
- [ ] Migración desde LocalStack.
- [ ] Proyecto final completo.

## 23. Fuentes y actualización

Fuentes primarias consultadas:

- Sitio general: <https://floci.io/>
- Documentación AWS: <https://floci.io/floci/>
- Inicio rápido: <https://floci.io/floci/getting-started/quick-start/>
- Servicios: <https://floci.io/floci/services/>
- Testcontainers: <https://floci.io/floci/testcontainers/>
- Repositorio: <https://github.com/floci-io/floci>
- Release `1.5.22`: <https://github.com/floci-io/floci/releases/tag/1.5.22>

La matriz, operaciones, variables y versiones evolucionan. Antes de depender de
una capacidad concreta, revisa el capítulo oficial del servicio y fija la imagen
que verificaste.
