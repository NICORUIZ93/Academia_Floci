# SSM

**Protocolo:** JSON 1.1 (`X-Amz-Target: AmazonSSM.*`)
**Punto final:** `POST http://localhost:4566/`

## Acciones compatibles con

### Almacén de parámetros

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
| `DescribePatchBaselines` | Listar las líneas base de parches predefinidas propiedad de AWS (filtrar por `OWNER`, `OPERATING_SYSTEM`, `NAME_PREFIX`) |
| `GetDefaultPatchBaseline` | Obtener el ID de referencia del parche predeterminado para un sistema operativo |

### Ejecutar comando

| Acción | Descripción |
|---|---|
| `UpdateInstanceInformation` | Registrar o actualizar un registro de agente SSM para una instancia |
| `DescribeInstanceInformation` | Listar instancias administradas SSM registradas |
| `SendCommand` | Crear invocaciones de comandos para instancias de destino |
| `GetCommandInvocation` | Devolver el resultado de una invocación de comando |
| `ListCommands` | Listar registros de comando |
| `ListCommandInvocations` | Listar registros de invocación de comandos |
| `CancelCommand` | Cancelar invocaciones de comandos pendientes o en curso |

### Protocolo del agente ec2messages

| Acción | Descripción |
|---|---|
| `GetMessages` | El agente sondea mensajes de comando pendientes |
| `AcknowledgeMessage` | Agente acusa recibo de un mensaje de comando |
| `SendReply` | El agente informa el estado y la salida del comando |

## Ejecución del comando Ejecutar

`SendCommand` admite el documento `AWS-RunShellScript`. Para las instancias EC2 lanzadas por Floci en modo Docker real, Floci crea la invocación del comando, devuelve la respuesta del comando y luego ejecuta el script de forma asincrónica dentro del contenedor de la instancia de destino. Las personas que llaman observan la finalización a través de `GetCommandInvocation`. `stdout`, `stderr`, el código de respuesta, la hora de inicio y la hora de finalización se registran en la invocación.

Si el destino no es un contenedor Floci EC2, o si el documento no es compatible con la ejecución directa, Floci recurre al flujo de sondeo del agente SSM. En ese modo, `SendCommand` pone en cola una carga útil de ec2messages y la invocación se completa después de que un agente llama a `SendReply`.

La salida del comando directo sigue los límites de salida en línea AWS: primeros 24.000 caracteres de stdout y primeros 8.000 caracteres de stderr. Los comandos que exceden `TimeoutSeconds` están restringidos dentro del contenedor de destino cuando el contenedor tiene el comando `timeout` disponible y los resultados del tiempo de espera del terminal están marcados como `TimedOut` con `StatusDetails` configurado en `Execution Timed Out`; Los comandos con códigos de salida distintos de cero están marcados como `Failed`.

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

# Run a shell command on a Floci EC2 instance
aws ssm send-command --endpoint-url $AWS_ENDPOINT_URL \
  --instance-ids i-0123456789abcdef0 \
  --document-name AWS-RunShellScript \
  --parameters commands='["echo hello"]'
```

## Tipos de parámetros

Se aceptan todos los tipos de parámetros AWS: `String`, `StringList`, `SecureString`.

!!! nota
    Los parámetros de `SecureString` se almacenan tal cual sin cifrado KMS real en Floci. El tipo se conserva y se devuelve correctamente, pero el valor no se cifra en reposo.
