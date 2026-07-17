# Administrador de secretos

**Protocolo:** JSON 1.1 (`X-Amz-Target: secretsmanager.*`)
**Punto final:** `POST http://localhost:4566/`

## Acciones admitidas por

<!-- floci:actions:start -->
| Acción | Descripción |
| --- | --- |
| `CreateSecret` | Crear un nuevo secreto |
| `GetSecretValue` | Recuperar el valor secreto actual |
| `PutSecretValue` | Actualizar el valor secreto (nueva versión) |
| `UpdateSecret` | Actualizar metadatos o valores secretos |
| `DescribeSecret` | Obtenga metadatos secretos e información de versión |
| `ListSecrets` | Listar todos los secretos |
| `DeleteSecret` | Eliminar un secreto (con ventana de recuperación) |
| `RestoreSecret` | - |
| `RotateSecret` | Activar la rotación secreta a través de un Lambda |
| `TagResource` | Etiqueta un secreto |
| `UntagResource` | Eliminar etiquetas |
| `ListSecretVersionIds` | Listar todas las versiones de un secreto |
| `GetResourcePolicy` | Obtenga la política de recursos |
| `GetRandomPassword` | Generar una contraseña aleatoria |
| `BatchGetSecretValue` | Recuperar múltiples valores secretos en una sola llamada |
| `DeleteResourcePolicy` | Eliminar la política de recursos |
| `PutResourcePolicy` | Adjuntar una política de recursos |
| `UpdateSecretVersionStage` | Mover una etiqueta provisional entre versiones |
<!-- floci:actions:end -->

## Configuración

| Variables | Predeterminado | Descripción |
|---|---|---|
| `FLOCI_SERVICES_SECRETSMANAGER_ENABLED` | `true` | Activar o desactivar el servicio |
| `FLOCI_SERVICES_SECRETSMANAGER_DEFAULT_RECOVERY_WINDOW_DAYS` | `30` | Días antes de que un secreto eliminado sea eliminado permanentemente |

## Ejemplos

```bash
export AWS_ENDPOINT_URL=http://localhost:4566

# Create a string secret
aws secretsmanager create-secret \
  --name /app/database-url \
  --secret-string "postgresql://admin:secret@localhost/mydb" \
  --endpoint-url $AWS_ENDPOINT_URL

# Create a JSON secret
aws secretsmanager create-secret \
  --name /app/api-keys \
  --secret-string '{"stripe":"sk_test_xxx","sendgrid":"SG.xxx"}' \
  --endpoint-url $AWS_ENDPOINT_URL

# Retrieve a secret
aws secretsmanager get-secret-value \
  --secret-id /app/database-url \
  --endpoint-url $AWS_ENDPOINT_URL

# Update a secret
aws secretsmanager put-secret-value \
  --secret-id /app/database-url \
  --secret-string "postgresql://admin:new-password@localhost/mydb" \
  --endpoint-url $AWS_ENDPOINT_URL

# List secrets
aws secretsmanager list-secrets --endpoint-url $AWS_ENDPOINT_URL

# Delete (with recovery window)
aws secretsmanager delete-secret \
  --secret-id /app/database-url \
  --recovery-window-in-days 7 \
  --endpoint-url $AWS_ENDPOINT_URL

# Delete immediately (no recovery)
aws secretsmanager delete-secret \
  --secret-id /app/database-url \
  --force-delete-without-recovery \
  --endpoint-url $AWS_ENDPOINT_URL

# Generate a random password
aws secretsmanager get-random-password \
  --password-length 24 \
  --exclude-punctuation \
  --endpoint-url $AWS_ENDPOINT_URL

# Batch-fetch multiple secrets in one call
aws secretsmanager batch-get-secret-value \
  --secret-id-list /app/database-url /app/api-keys \
  --endpoint-url $AWS_ENDPOINT_URL

# Move the AWSCURRENT label to a different version (e.g. during a rotation)
aws secretsmanager update-secret-version-stage \
  --secret-id /app/database-url \
  --version-stage AWSCURRENT \
  --move-to-version-id <new-version-id> \
  --remove-from-version-id <old-version-id> \
  --endpoint-url $AWS_ENDPOINT_URL
```
