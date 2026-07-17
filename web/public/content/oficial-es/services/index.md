# Descripción general de los servicios

Floci emula 68 servicios AWS en un solo puerto (`4566`). Todos los servicios utilizan el protocolo de conexión AWS real, sus comandos AWS CLI existentes y sus clientes SDK funcionan sin modificaciones.

Esta página es la referencia canónica para los recuentos de operaciones y servicios admitidos. Algunos servicios exponen filas separadas del plano de control y del plano de datos a continuación. Otros documentos (y el archivo README) deberían vincularse aquí en lugar de duplicar la tabla.

## Matriz de servicios

Los recuentos de operaciones son exactos. Para los servicios de tabla de despacho (Query y JSON 1.1), cada recuento refleja un caso por acción de AWS en el controlador. Para los servicios basados en REST (S3, Lambda, API Gateway v1), el recuento refleja distintas operaciones de AWS SDK, colapsando rutas donde un controlador JAX-RS se despliega a través de cadenas de consulta o marcadores de encabezado (p. ej. `PUT /{bucket}/{key}` → `PutObject`, `PutObjectTagging`, `PutObjectAcl`, etc.).

| Servicio | Punto final | Protocolo | Operaciones apoyadas |
|---|---|---|---|
| [SSM](ssm.md) | `POST /` + `X-Amz-Target: AmazonSSM.*` / `AmazonSSMMessageDeliveryService.*` | JSON 1.1 | 22 |
| [SQS](sqs.md) | `POST /` con parámetro `Action=` | Consulta / JSON | 20 |
| [SNS](sns.md) | `POST /` con parámetro `Action=` | Consulta / JSON | 17 |
| [S3](s3.md) | `/{bucket}/{key}` | REST XML | 58 |
| [Vectores S3](s3vectors.md) | `POST /{OperationName}` | REST JSON | 12 |
| [DynamoDB](dynamodb.md) | `POST /` + `X-Amz-Target: DynamoDB_20120810.*` | JSON 1.1 | 28 |
| [Transmisiones DynamoDB](Transmisiones dynamodb.md#) | `POST /` + `X-Amz-Target: DynamoDBStreams_20120810.*` | JSON 1.1 | 4 |
| [Lambda](lambda.md) | `/2015-03-31/functions/...` | REST JSON | 30 |
| [Puerta de enlace API v1](api-gateway.md) | `/restapis/...` | REST JSON | 64 |
| [API Gateway v2](api-gateway.md#v2) | `/v2/apis/...` | REST JSON | 48 + plano de datos |
| [IAM](iam.md) | `POST /` con parámetro `Action=` | Consulta | 76 |
| [STS](sts.md) | `POST /` con parámetro `Action=` | Consulta | 7 |
| [Cognito](cognito.md) | `POST /` + `X-Amz-Target: AWSCognitoIdentityProviderService.*` | JSON 1.1 | 43 |
| [KMS](kms.md) | `POST /` + `X-Amz-Target: TrentService.*` | JSON 1.1 | 34 |
| [Kinesis](kinesis.md) | `POST /` + `X-Amz-Target: Kinesis_20131202.*` | JSON 1.1 | 24 |
| [Administrador de secretos](secrets-manager.md) | `POST /` + `X-Amz-Target: secretsmanager.*` | JSON 1.1 | 16 |
| [Funciones de paso](step-functions.md) | `POST /` + `X-Amz-Target: AmazonStatesService.*` | JSON 1.1 | 19 |
| [CloudFormation](cloudformation.md) | `POST /` con parámetro `Action=` | Consulta | 19 |
| [EventBridge](eventbridge.md) | `POST /` + `X-Amz-Target: AmazonEventBridge.*` | JSON 1.1 | 16 |
| [Programador EventBridge](scheduler.md) | `/schedules/*`, `/schedule-groups/*`, `/tags/*` | REST JSON | 12 |
| [Tuberías EventBridge](pipes.md) | `/v1/pipes/*` | REST JSON | 7 |
| [Registros de CloudWatch](cloudwatch.md) | `POST /` + `X-Amz-Target: Logs.*` | JSON 1.1 | 17 |
| [Métricas CloudWatch](cloudwatch.md#métricas) | `POST /` con `Action=` o JSON 1.1 | Consulta / JSON | 11 |
| [ElastiCache](elasticache.md) | `POST /` con parámetro `Action=` + proxy TCP | Consulta + RESP | 8 |
| [MemoryDB](memorydb.md) | Proxy `POST /` + `X-Amz-Target: AmazonMemoryDB.*` + TCP | JSON 1.1 + RESP | 7 |
| [RDS](rds.md) | `POST /` con parámetro `Action=` + proxy TCP | Consulta + cable | 14 |
| [RDS Datos API](rds-data.md) | `/Execute`, `/BeginTransaction`, `/CommitTransaction`, `/RollbackTransaction` | REST JSON | 4 |
| [MSK](msk.md) | `/v1/clusters/...`, `/api/v2/clusters/...` + corredor Redpanda | REST JSON + Kafka | 8 |
| [Amazon MQ](amazonmq.md) | Corredor `/v1/brokers/...` + RabbitMQ | REST JSON + AMQP | 5 |
| [Athena](athena.md) | `POST /` + `X-Amz-Target: AmazonAthena.*` | JSON 1.1 | 4 |
| [Glue](glue.md) | `POST /` + `X-Amz-Target: AWSGlue.*` | JSON 1.1 | 38 |
| [Neptune](neptune.md) | `POST /` con parámetro `Action=` + proxy Gremlin TCP | Consulta + WebSocket | 8 |
| [DocumentDB](docdb.md) | `POST /` con parámetro `Action=` + contenedor MongoDB | Consulta + cable MongoDB | 8 |
| [EMR](emr.md) | `POST /` + `X-Amz-Target: ElasticMapReduce.*` | JSON 1.1 | 24 |
| [Datos Firehose](firehose.md) | `POST /` + `X-Amz-Target: Firehose_20150804.*` | JSON 1.1 | 6 |
| [ECS](ecs.md) | `POST /` + `X-Amz-Target: AmazonEC2ContainerServiceV20141113.*` | JSON 1.1 | 58 |
| [EC2](ec2.md) | `POST /` con parámetro `Action=` | Consulta EC2 | 78 |
| [Vela luminosa](lightsail.md) | `POST /` + `X-Amz-Target: Lightsail_20161128.*` | JSON 1.1 | 79 respuestas locales; 161 acciones reconocidas |
| [ACM](acm.md) | `POST /` + `X-Amz-Target: CertificateManager.*` | JSON 1.1 | 12 |
| [ECR](ecr.md) | `POST /` + `X-Amz-Target: AmazonEC2ContainerRegistry_V20150921.*` (plano de control) y `/v2/...` (plano de datos vía `registry:2`) | Distribución JSON 1.1 + OCI | 17 |
| [Grupos de recursos etiquetados API](resource-groups-tagging.md) | `POST /` + `X-Amz-Target: ResourceGroupsTaggingAPI_20170126.*` | JSON 1.1 | 5 |
| [SES](ses.md) | `POST /` con parámetro `Action=` | Consulta | 16 |
| [SES v2](ses.md#v2) | `/v2/email/*` | REST JSON | 10 |
| [OpenSearch](opensearch.md) | `/2021-01-01/opensearch/...` | REST JSON | 24 |
| [AppConfig](appconfig.md) | `/applications/...`, `/deploymentstrategies/...` | REST JSON | 16 |
| [AppConfigData](appconfig.md#plano de datos) | `/configurationsessions`, `/configuration` | REST JSON | 2 |
| [AppSync](appsync.md) | `/v1/apis/...` | REST JSON | 33 |
| [Tiempo de ejecución de Bedrock](bedrock-runtime.md) | `/model/{modelId}/converse`, `/model/{modelId}/invoke` | REST JSON | 2 (stub; la transmisión devuelve 501) |
| [EKS](eks.md) | `/clusters`, `/clusters/{name}`, `/tags/{resourceArn}` | REST JSON | 7 |
| [ELBv2](elb.md) | `POST /` con parámetro `Action=` | Consulta | 34 |
| [WAFv2](wafv2.md) | `POST /` + `X-Amz-Target: AWSWAF_20190729.*` | JSON 1.1 | 35 |
| [Escala automática](autoscaling.md) | `POST /` con parámetro `Action=` | Consulta | 33 |
| [Habichuelas elásticas](elastic-beanstalk.md) | `POST /` con parámetro `Action=` o `Operation=` | Consulta | 14 |
| [CodeBuild](codebuild.md) | `POST /` + `X-Amz-Target: CodeBuild_20161006.*` | JSON 1.1 | 20 |
| [Lote AWS](batch.md) | `/v1/...` | REST JSON | 10 |
| [CodeDeploy](codedeploy.md) | `POST /` + `X-Amz-Target: CodeDeploy_20141006.*` | JSON 1.1 | 30 |
| [CodePipeline](codepipeline.md) | `POST /` + `X-Amz-Target: CodePipeline_20150709.*` | JSON 1.1 | 44 |
| [Copia de seguridad AWS](backup.md) | `/backup-vaults/*`, `/backup/plans/*`, `/backup-jobs/*`, `/supported-resource-types` | REST JSON | 20 |
| [CloudFront](cloudfront.md) | `/2020-05-31/distribution/*`, `/2020-05-31/cache-policy/*`, `/2020-05-31/function/*` | REST XML | 50 |
| [Route53](route53.md) | `/2013-04-01/hostedzone/*`, `/2013-04-01/healthcheck/*`, `/2013-04-01/change/*` | REST XML | 17 |
| [Mapa de la nube](cloudmap.md) | `POST /` + `X-Amz-Target: Route53AutoNaming_v20170314.*` | JSON 1.1 | 22 |
| [Configuración AWS](config.md) | `POST /` + `X-Amz-Target: StarlingDoveService.*` | JSON 1.1 | 20 |
| [CloudTrail](cloudtrail.md) | `POST /` + `X-Amz-Target: com.amazonaws.cloudtrail.v20131101.CloudTrail_20131101.*` | JSON 1.1 | 8 |
| [Textract](textract.md) | `POST /` + `X-Amz-Target: Textract.*` | JSON 1.1 | 6 |
| [Transcribe](transcribe.md) | `POST /` + `X-Amz-Target: Transcribe.*` | JSON 1.1 | 8 |
| [Precios](pricing.md) | `POST /` + `X-Amz-Target: AWSPriceListService.*` | JSON 1.1 | 5 |
| [Explorador de costos](ce.md) | `POST /` + `X-Amz-Target: AWSInsightsIndexService.*` | JSON 1.1 | 9 |
| [Informes de costo y uso](cur.md) | `POST /` + `X-Amz-Target: AWSOrigamiServiceGatewayService.*` | JSON 1.1 | 6 |
| [Exportaciones de datos BCM](bcm-data-exports.md) | `POST /` + `X-Amz-Target: AWSBillingAndCostManagementDataExports.*` | JSON 1.1 | 7 |
| [Transferir familia](transfer.md) | `POST /` + `X-Amz-Target: TransferService.*` | JSON 1.1 | 17 |
| [Núcleo IoT](iot.md) | `/things/...`, `/endpoint`, reglas/políticas Rutas REST | REST JSON | 62 |
| [Datos IoT](iot.md) | `/things/{thingName}/shadow`, temas MQTT | REST JSON | 11 |

**Lambda, ElastiCache, RDS, MSK, ECS, EKS y OpenSearch** activan contenedores Docker reales y admiten la autenticación IAM y Firma de solicitud SigV4, el mismo flujo de autenticación que el AWS de producción. **RDS Datos API** ejecuta SQL contra los contenedores RDS locales a través de rutas REST JSON compatibles con AWS.

**ECR** ejecuta un contenedor `registry:2` compartido para que el cliente estándar `docker` pueda insertar y extraer bytes de imágenes en los repositorios devueltos por el plano de control en forma de AWS. **EKS** (modo real) inicia un contenedor k3s por clúster y expone el servidor Kubernetes API en un puerto host. **OpenSearch** (modo real) inicia un contenedor `opensearchproject/opensearch` por dominio y expone el plano de datos REST API en un puerto de host. **DocumentDB** inicia un contenedor `mongo` real por clúster y devuelve su host y puerto como punto final del clúster, de modo que cualquier controlador MongoDB pueda conectarse con el protocolo de conexión compatible con MongoDB.

## Configuración común de

Antes de llamar a cualquier servicio, configure su cliente AWS para que apunte a Floci:

```bash
export AWS_ENDPOINT_URL=http://localhost:4566
export AWS_DEFAULT_REGION=us-east-1
export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test
```

`AWS_ENDPOINT_URL` es la var de entorno estándar reconocida por los SDK AWS CLI v2 y AWS v2+, por lo que no se necesita ningún indicador `--endpoint-url` en cada comando.
