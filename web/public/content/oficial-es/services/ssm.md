# SSM Almacén de parámetros

**Protocolo:** JSON 1.1 (`X-Amz-Target: AmazonSSM.*`)
**Punto final:** `POST http://localhost:4566/`

## Acciones compatibles con

| Acción | Descripción |
|---|---|
| `PutParameter` | Crear o actualizar un parámetro |
| `GetParameter` | Obtener un único parámetro por nombre |
| `GetParameters` | Obtener múltiples parámetros por nombre |
| `GetParametersByPath` | Obtenga todos los parámetros bajo un prefijo de ruta |
| `DeleteParameter` | Eliminar un parámetro |
| `DeleteParameters` | Eliminar múltiples parámetros |
| `GetParameterHistory` | Listar todas las versiones de un parámetro |
| `DescribeParameters` | Listar parámetros con filtros opcionales |
| `LabelParameterVersion` | Adjuntar una etiqueta a una versión específica |
| `AddTagsToResource` | Etiquetar un parámetro |
| `ListTagsForResource` | Listar etiquetas en un parámetro |
| `RemoveTagsFromResource` | Eliminar etiquetas de un parámetro |

## Configuración

| Variables | Predeterminado | Descripción |
|---|---|---|
| `FLOCI_SERVICES_SSM_ENABLED` | `true` | Activar o desactivar el servicio |
| `FLOCI_SERVICES_SSM_MAX_PARAMETER_HISTORY` | `5` | Número de versiones de parámetros conservadas por parámetro |
| `FLOCI_STORAGE_SERVICES_SSM_MODE` | *(predeterminado global)* | Anulación del modo de almacenamiento para SSM (`memory`, `persistent`, `hybrid`, `wal`) |
| `FLOCI_STORAGE_SERVICES_SSM_FLUSH_INTERVAL_MS` | `5000` | Intervalo de descarga para modos de almacenamiento `hybrid`/`wal` (milisegundos) |

## Ejemplos

```bash
export AWS_ENDPOINT_URL=http://localhost:4566

# Store parameters
aws ssm put-parameter --endpoint-url $AWS_ENDPOINT_URL \
  --name /app/db/host --value "localhost" --type String

aws ssm put-parameter --endpoint-url $AWS_ENDPOINT_URL \
  --name /app/db/password --value "secret" --type SecureString

# Retrieve
aws ssm get-parameter --endpoint-url $AWS_ENDPOINT_URL \
  --name /app/db/host

aws ssm get-parameters-by-path --endpoint-url $AWS_ENDPOINT_URL \
  --path /app/ --recursive

# Delete
aws ssm delete-parameter --endpoint-url $AWS_ENDPOINT_URL \
  --name /app/db/host
```

## Tipos de parámetros

Se aceptan todos los tipos de parámetros AWS: `String`, `StringList`, `SecureString`.

!!! nota
    Los parámetros de `SecureString` se almacenan tal cual sin cifrado KMS real en Floci. El tipo se conserva y se devuelve correctamente, pero el valor no se cifra en reposo.