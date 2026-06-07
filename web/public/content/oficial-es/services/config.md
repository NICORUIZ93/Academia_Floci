# Configuración de AWS

**Protocolo:** JSON 1.1 (`X-Amz-Target: StarlingDoveService.*`)
**Punto final:** `POST http://localhost:4566/`

## Acciones compatibles con

### Reglas de configuración de

| Acción | Descripción |
|---|---|
| `PutConfigRule` | Crear o actualizar una regla de configuración |
| `DeleteConfigRule` | Eliminar una regla de configuración |
| `DescribeConfigRules` | Lista de reglas de configuración, opcionalmente filtradas por nombre |
| `DescribeComplianceByConfigRule` | Obtenga un resumen de cumplimiento de las reglas de configuración |
| `DescribeConfigRuleEvaluationStatus` | Obtener el estado de evaluación de las reglas de configuración |
| `StartConfigRulesEvaluation` | Evaluación de desencadenadores para reglas de configuración |

### Grabador de configuración

| Acción | Descripción |
|---|---|
| `PutConfigurationRecorder` | Crear o actualizar un registrador de configuración |
| `DescribeConfigurationRecorders` | Listar grabadores de configuración |
| `StartConfigurationRecorder` | Iniciar grabación de cambios de configuración |
| `StopConfigurationRecorder` | Dejar de grabar cambios de configuración |
| `DescribeConfigurationRecorderStatus` | Obtener el estado de los registradores de configuración |

### Canal de entrega

| Acción | Descripción |
|---|---|
| `PutDeliveryChannel` | Crear o actualizar un canal de entrega |
| `DescribeDeliveryChannels` | Listar canales de entrega |

### Paquetes de conformidad

| Acción | Descripción |
|---|---|
| `PutConformancePack` | Crear o actualizar un paquete de conformidad |
| `DeleteConformancePack` | Eliminar un paquete de conformidad |
| `DescribeConformancePacks` | Listar paquetes de conformidad |
| `DescribeConformancePackStatus` | Obtenga el estado de implementación de los paquetes de conformidad |

### Etiquetado

| Acción | Descripción |
|---|---|
| `TagResource` | Agregar etiquetas a un recurso de configuración |
| `UntagResource` | Eliminar etiquetas de un recurso de configuración |
| `ListTagsForResource` | Listar etiquetas en un recurso de configuración |

## Configuración

| Variables | Predeterminado | Descripción |
|---|---|---|
| `FLOCI_SERVICES_CONFIGSERVICE_ENABLED` | `true` | Activar o desactivar el servicio |

## Ejemplos

```bash
export AWS_ENDPOINT_URL=http://localhost:4566

# Create a config rule
aws configservice put-config-rule --config-rule '{
  "ConfigRuleName": "s3-bucket-versioning",
  "Source": {
    "Owner": "AWS",
    "SourceIdentifier": "S3_BUCKET_VERSIONING_ENABLED"
  }
}'

# List config rules
aws configservice describe-config-rules

# Create a configuration recorder
aws configservice put-configuration-recorder --configuration-recorder '{
  "name": "default",
  "roleARN": "arn:aws:iam::012345678901:role/config-role",
  "recordingGroup": {
    "allSupported": true,
    "includeGlobalResourceTypes": true
  }
}'

# Start recording
aws configservice start-configuration-recorder --configuration-recorder-name default

# Check recorder status
aws configservice describe-configuration-recorder-status

# Create a conformance pack
aws configservice put-conformance-pack \
  --conformance-pack-name my-pack \
  --template-body "Resources: {}"

# List conformance packs
aws configservice describe-conformance-packs

# Tag a resource
aws configservice tag-resource \
  --resource-arn arn:aws:config:us-east-1:000000000000:config-rule/config-rule-abc123 \
  --tags Key=env,Value=dev

# Delete a config rule
aws configservice delete-config-rule --config-rule-name s3-bucket-versioning
```

!!! nota
    El estado de cumplimiento siempre devuelve `INSUFFICIENT_DATA` ya que Floci no realiza una evaluación de recursos real. Las reglas de configuración, los registradores y los paquetes de conformidad se almacenan y devuelven correctamente, pero no se realiza ningún registro de configuración real ni verificación de cumplimiento.
