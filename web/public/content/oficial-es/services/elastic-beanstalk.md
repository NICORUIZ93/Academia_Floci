# Tallo de frijol elástico

Floci implementa la gestión de Elastic Beanstalk AWS API como un servicio de protocolo de consulta con aplicación almacenada, versión de la aplicación y estado del entorno.

**Protocolo:** Consulta: `POST /` con parámetro de formulario `Action=`, alcance de credencial `elasticbeanstalk`

El controlador también acepta el alias del parámetro `Operation=` documentado de Elastic Beanstalk.

## Operaciones admitidas (14 en total)

| Operación | Notas |
|---|---|
| `CreateApplication` | Crea una aplicación con la plantilla de configuración predeterminada |
| `DescribeApplications` | Enumera todas las aplicaciones o filtros de `ApplicationNames.member.N` |
| `UpdateApplication` | Actualiza la descripción de la aplicación |
| `DeleteApplication` | Elimina una aplicación; `TerminateEnvByForce=true` finaliza primero los entornos activos |
| `CreateApplicationVersion` | Almacena metadatos de la versión y `SourceBundle.S3Bucket` / `SourceBundle.S3Key` opcionales |
| `DescribeApplicationVersions` | Enumera versiones, opcionalmente filtradas por aplicación y etiquetas de versión |
| `DeleteApplicationVersion` | Elimina una versión almacenada de la aplicación |
| `CreateEnvironment` | Crea un entorno en estado inmediato `Ready` / `Green` |
| `DescribeEnvironments` | Enumera los entornos por aplicación, nombre, ID, versión y `IncludeDeleted` |
| `UpdateEnvironment` | Descripción de las actualizaciones, etiqueta de versión, campos de plataforma y configuración de opciones |
| `TerminateEnvironment` | Marca un entorno como `Terminated` |
| `DescribeConfigurationSettings` | Devuelve la configuración de opciones del entorno almacenado |
| `CheckDNSAvailability` | Comprueba la disponibilidad de CNAME en entornos almacenados |
| `ListAvailableSolutionStacks` | Devuelve una pequeña lista de plataformas integradas |

## Configuración

| Variables | Predeterminado | Descripción |
|---|---|---|
| `FLOCI_SERVICES_ELASTICBEANSTALK_ENABLED` | `true` | Activar o desactivar el servicio |

## Ejemplo de uso de

```bash
aws elasticbeanstalk create-application \
  --application-name sample-app

aws elasticbeanstalk create-application-version \
  --application-name sample-app \
  --version-label v1 \
  --source-bundle S3Bucket=source-bucket,S3Key=app-v1.zip

aws elasticbeanstalk create-environment \
  --application-name sample-app \
  --environment-name sample-env \
  --version-label v1 \
  --solution-stack-name "64bit Amazon Linux 2023 v4.3.0 running Docker"

aws elasticbeanstalk describe-environments \
  --application-name sample-app
```
