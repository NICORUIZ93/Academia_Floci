# Floci

<p align="center">
  <img src="assets/floci.svg" alt="Floci" width="500" />
</p>

<p align="center"><em>Ligero, esponjoso y siempre libre</em></p>

---

Floci es un emulador de servicio local AWS rápido, gratuito y de código abierto creado para desarrolladores que necesitan servicios AWS confiables en desarrollo y CI sin costo, complejidad ni dependencia de un proveedor.

## Servicios compatibles con

Floci emula 68 servicios AWS. Consulte la [Descripción general de servicios](services/index.md) para conocer los recuentos de operaciones por servicio, los puntos finales y los detalles completos del protocolo.

| Servicio | Protocolo |
|---|---|
| Almacén de parámetros SSM | JSON 1.1 |
| SQS | Consulta / JSON |
| SNS | Consulta / JSON |
| SES | Consulta |
| SES v2 | REST JSON |
| S3 | REST XML |
| DynamoDB + Transmisiones | JSON 1.1 |
| Lambda | REST JSON |
| Puerta de enlace API v1 y v2 | REST JSON |
| AppSync | REST JSON |
| cognito | JSON 1.1 |
| KMS | JSON 1.1 |
| Kinesis | JSON 1.1 |
| Gerente de Secretos | JSON 1.1 |
| CloudFormation | Consulta |
| Funciones de paso | JSON 1.1 |
| IAM | Consulta |
| STS | Consulta |
| ElastiCache (Redis / Valkey) | Consulta + proxy RESP |
| RDS (PostgreSQL / MySQL) | Consulta + proxy de cable |
| RDS Datos API | REST JSON |
| Neptune (gráfico DB / Gremlin) | Consulta + proxy WebSocket |
| DocumentDB (compatible con MongoDB) | Consulta + Cable MongoDB |
| MSK (Kafka / Redpanda) | REST JSON + Kafka |
| Amazon MQ (RabbitMQ) | REST JSON + AMQP |
| Athena | JSON 1.1 |
| Catálogo de datos Glue + Registro de esquemas | JSON 1.1 |
| Datos Firehose | JSON 1.1 |
| ECS | JSON 1.1 |
| EC2 | Consulta EC2 |
| Vela de luz | JSON 1.1 |
| ACM | JSON 1.1 |
| ECR | Distribución JSON 1.1 + OCI |
| Grupos de recursos Etiquetado API | JSON 1.1 |
| OpenSearch | REST JSON |
| EventBridge | JSON 1.1 |
| Tuberías EventBridge | REST JSON |
| Programador EventBridge | REST JSON |
| CloudWatch Registros y métricas | JSON 1.1 / Consulta |
| AppConfig + AppConfigData | REST JSON |
| Tiempo de ejecución Bedrock | REST JSON |
| EKS | REST JSON |
| ELB v2 | Consulta |
| Escalado automático | Consulta |
| Tallo de frijol elástico | Consulta |
| CodeBuild | JSON 1.1 |
| CodeDeploy | JSON 1.1 |
| CodePipeline | JSON 1.1 |
| Copia de seguridad AWS | REST JSON |
| CloudFront | REST XML |
| Route53 | REST XML |
| Mapa de la nube | JSON 1.1 |
| Configuración AWS | JSON 1.1 |
| Textract | JSON 1.1 |
| Transcribe | JSON 1.1 |
| Precios | JSON 1.1 |
| Explorador de costos | JSON 1.1 |
| Informes de costos y uso | JSON 1.1 |
| Exportaciones de datos BCM | JSON 1.1 |
| Transferir familia | JSON 1.1 |

## ¿Por qué Floci?

**No se requiere cuenta.** Sin tokens de autenticación, sin registros, sin telemetría. Tire de la imagen y comience a construir.

**Sin puertas de funciones.** Todas las funciones están disponibles para todos, sin restricciones de edición comunitaria.

**Sin restricciones de CI.** Ejecute su canal de CI sin limitaciones. Sin créditos, sin cuotas, sin niveles pagados.

**Código verdaderamente abierto.** Licencia MIT. Bifurcarlo, extenderlo, incrustarlo. No se acerca el atardecer de la "edición comunitaria".

## Inicio rápido

```yaml title="docker-compose.yml"
services:
  floci:
    image: floci/floci:latest
    ports:
      - "4566:4566"
    volumes:
      # Local directory bind mount (default)
      - ./data:/app/data
      
      # OR named volume (optional):
      # - floci-data:/app/data

# volumes:
#  floci-data:
```

```bash
docker compose up -d
aws --endpoint-url http://localhost:4566 s3 mb s3://my-bucket
```

Los 68 servicios AWS están disponibles de inmediato en `http://localhost:4566`.

[Comenzar →](empezando/quick-start.md){ .md-button .md-button--primary }
[Ver servicios →](servicios/index.md){ .md-button }
