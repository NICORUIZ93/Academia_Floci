# CodePipeline

Floci implementa AWS CodePipeline JSON 1.1 API y un motor de ejecución de canalización local.

**Protocolo:** `POST /` con `Content-Type: application/x-amz-json-1.1` y
`X-Amz-Target: CodePipeline_20150709.<Action>`.

## Operaciones admitidas (44 en total)

Se rutea la superficie completa CodePipeline 2015-07-09 API:

- Ciclo de vida de la canalización, estado, historial de ejecución, inicio, parada, reintento y reversión
- Transiciones de etapa, aprobaciones manuales, historial de ejecución de reglas y acciones
- Tipos de acciones personalizadas y AWS/sondeo de trabajos de trabajadores externos
- Registro de webhook y ciclo de vida de etiquetas.

Definiciones de canalizaciones, ejecuciones, tipos de acciones personalizadas, trabajos, webhooks, etiquetas y transiciones
El estado utiliza el backend de almacenamiento configurado de Floci.

## Ejecución

Las etapas se ejecutan en el orden de declaración. Las acciones con el mismo `runOrder` se ejecutan en paralelo.
Se reconocen los modos de ejecución `SUPERSEDED`, `QUEUED` y `PARALLEL`, con `QUEUED` y
`PARALLEL` restringido a canalizaciones V2.

Los siguientes proveedores se ejecutan en servicios Floci locales:

| Categoría | Proveedor | Comportamiento |
|---|---|---|
| Fuente | S3 | Lee el objeto configurado y publica el artefacto de salida |
| Construir/Probar | CodeBuild | Inicia y monitorea el proyecto CodeBuild local configurado |
| Implementar | S3 | Escribe el artefacto de entrada en el depósito y la clave configurados |
| Implementar | CodeDeploy | Inicia y monitorea una implementación local de CodeDeploy |
| Invocar | Lambda | Invoca la función Lambda local configurada |
| Invocar | CodePipeline | Inicia una ejecución de canalización local anidada |
| Aprobación | manuales | Espera `PutApprovalResult` |
| Personalizado/de terceros | Cualquier acción registrada | Utiliza API de trabajos de encuesta, reconocimiento, éxito y fracaso |

Los proveedores administrados por AWS sin un adaptador de ejecución Floci correspondiente fallan la acción con un
Error de acción en forma de AWS. Floci no llama a cuentas reales de AWS ni a proveedores externos de SaaS.

## Configuración

| Variables | Predeterminado | Descripción |
|---|---|---|
| `FLOCI_SERVICES_CODEPIPELINE_ENABLED` | `true` | Habilita el CodePipeline API |
| `FLOCI_STORAGE_SERVICES_CODEPIPELINE_MODE` | modo global | Anula el modo de almacenamiento CodePipeline |
| `FLOCI_STORAGE_SERVICES_CODEPIPELINE_FLUSH_INTERVAL_MS` | `5000` | Intervalo de descarga de almacenamiento híbrido |

## Ejemplo de

```bash
aws --endpoint-url http://localhost:4566 codepipeline create-pipeline \
  --pipeline file://pipeline.json

aws --endpoint-url http://localhost:4566 codepipeline start-pipeline-execution \
  --name local-release

aws --endpoint-url http://localhost:4566 codepipeline list-pipeline-executions \
  --pipeline-name local-release
```
