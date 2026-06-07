# AWS Copia de seguridad

**Protocolo:** REST JSON  
**Punto final:** `http://localhost:4566/`  
**Alcance de la credencial:** `backup`

## Acciones admitidas

### Bóvedas de respaldo

| Acción | Método | Camino | Descripción |
|---|---|---|---|
| `CreateBackupVault` | `PUT` | `/backup-vaults/{backupVaultName}` | Crear una bóveda de respaldo |
| `DescribeBackupVault` | `GET` | `/backup-vaults/{backupVaultName}` | Describir una bóveda de respaldo |
| `DeleteBackupVault` | `DELETE` | `/backup-vaults/{backupVaultName}` | Eliminar una bóveda de respaldo vacía |
| `ListBackupVaults` | `GET` | `/backup-vaults/` | Listar todas las bóvedas de respaldo |

### Planes de respaldo

| Acción | Método | Camino | Descripción |
|---|---|---|---|
| `CreateBackupPlan` | `PUT` | `/backup/plans/` | Crea un plan de respaldo con reglas |
| `GetBackupPlan` | `GET` | `/backup/plans/{backupPlanId}/` | Obtenga detalles del plan de respaldo |
| `UpdateBackupPlan` | `POST` | `/backup/plans/{backupPlanId}` | Actualizar un plan de respaldo |
| `DeleteBackupPlan` | `DELETE` | `/backup/plans/{backupPlanId}` | Eliminar un plan de respaldo (falla si existen selecciones) |
| `ListBackupPlans` | `GET` | `/backup/plans/` | Listar todos los planes de respaldo |

### Selecciones de copia de seguridad de

| Acción | Método | Camino | Descripción |
|---|---|---|---|
| `CreateBackupSelection` | `PUT` | `/backup/plans/{backupPlanId}/selections/` | Asignar recursos a un plan de respaldo |
| `GetBackupSelection` | `GET` | `/backup/plans/{backupPlanId}/selections/{selectionId}` | Obtener detalles de selección |
| `DeleteBackupSelection` | `DELETE` | `/backup/plans/{backupPlanId}/selections/{selectionId}` | Eliminar una selección de recursos |
| `ListBackupSelections` | `GET` | `/backup/plans/{backupPlanId}/selections/` | Listar selecciones para un plan |

### Trabajos de copia de seguridad de

| Acción | Método | Camino | Descripción |
|---|---|---|---|
| `StartBackupJob` | `PUT` | `/backup-jobs` | Iniciar una tarea de copia de seguridad bajo demanda |
| `DescribeBackupJob` | `GET` | `/backup-jobs/{backupJobId}` | Obtener el estado del trabajo de respaldo |
| `StopBackupJob` | `POST` | `/backup-jobs/{backupJobId}` | Detener una tarea de copia de seguridad en ejecución |
| `ListBackupJobs` | `GET` | `/backup-jobs/` | Listar trabajos de respaldo con filtros opcionales |

### Puntos de recuperación

| Acción | Método | Camino | Descripción |
|---|---|---|---|
| `DescribeRecoveryPoint` | `GET` | `/backup-vaults/{backupVaultName}/recovery-points/{recoveryPointArn}` | Describir un punto de recuperación |
| `ListRecoveryPointsByBackupVault` | `GET` | `/backup-vaults/{backupVaultName}/recovery-points/` | Enumerar puntos de recuperación en una bóveda |
| `DeleteRecoveryPoint` | `DELETE` | `/backup-vaults/{backupVaultName}/recovery-points/{recoveryPointArn}` | Eliminar un punto de recuperación |

### Etiquetado

| Acción | Método | Camino | Descripción |
|---|---|---|---|
| `ListTags` | `GET` | `/tags/{resourceArn}` | Listar etiquetas en un recurso de respaldo |
| `TagResource` | `POST` | `/tags/{resourceArn}` | Agregar etiquetas a un recurso de respaldo |
| `UntagResource` | `POST` | `/untag/{resourceArn}` | Eliminar etiquetas de un recurso de respaldo |

### Otro

| Acción | Método | Camino | Descripción |
|---|---|---|---|
| `GetSupportedResourceTypes` | `GET` | `/supported-resource-types` | Listar los tipos de recursos admitidos para la copia de seguridad |

## Ciclo de vida del trabajo

Los trabajos de copia de seguridad cambian de estado automáticamente después de `StartBackupJob`:

```
CREATED → RUNNING (after ~1 s) → COMPLETED (after job-completion-delay-seconds)
```

Cuando un trabajo llega a `COMPLETED`:
- Se crea un punto de recuperación en la bóveda de destino.
- Se incrementa el contador `NumberOfRecoveryPoints` de la bóveda.
- `StopBackupJob` en un trabajo `CREATED` o `RUNNING` lo transfiere a `ABORTING → ABORTED`

El retraso de finalización es configurable:

```bash
FLOCI_SERVICES_BACKUP_JOB_COMPLETION_DELAY_SECONDS=3
```

Utilice un retraso más corto (por ejemplo, `1`) en entornos de prueba para acelerar las afirmaciones de finalización del trabajo.

## Tipos de recursos admitidos

`GetSupportedResourceTypes` devuelve los siguientes códigos de tipo de recurso:

`S3`, `RDS`, `DynamoDB`, `EFS`, `EC2`, `EBS`, `Aurora`, `DocumentDB`, `Neptune`, `FSx`, `VirtualMachine`.

Se simula la copia de seguridad real: no se leen ni escriben datos en los recursos a los que se hace referencia.

## Restricciones de

- **DeleteBackupVault** devuelve `InvalidRequestException` (400) si la bóveda contiene puntos de recuperación.
- **DeleteBackupPlan** devuelve `InvalidRequestException` (400) si el plan tiene selecciones activas.
- **CreateBackupVault** devuelve `AlreadyExistsException` (400) en nombres de bóvedas duplicados dentro de la misma región.

## Configuración

| Propiedad | Var. ambiente | Predeterminado | Descripción |
|---|---|---|---|
| `floci.services.backup.enabled` | `FLOCI_SERVICES_BACKUP_ENABLED` | `true` | Activar/desactivar el servicio |
| `floci.services.backup.job-completion-delay-seconds` | `FLOCI_SERVICES_BACKUP_JOB_COMPLETION_DELAY_SECONDS` | `3` | Segundos desde el inicio del trabajo hasta `COMPLETED` |

## aún no es compatible

- Restaurar trabajos (`StartRestoreJob`, `DescribeRestoreJob`, `ListRestoreJobs`)
- Copia de seguridad de bóvedas con notificaciones (`PutBackupVaultNotifications`, `GetBackupVaultNotifications`)
- Bóvedas de respaldo con política de acceso (`PutBackupVaultAccessPolicy`, `GetBackupVaultAccessPolicy`)
- Copiar trabajos (`StartCopyJob`, `DescribeCopyJob`, `ListCopyJobs`)
- Planes de informes (`CreateReportPlan`, `DescribeReportPlan`, etc.)
- Operaciones del marco (`CreateFramework`, etc.)
- Retenciones legales
- Tokens de paginación en operaciones de lista.

## Ejemplos

```bash
export AWS_ENDPOINT_URL=http://localhost:4566

# Create a backup vault
aws backup create-backup-vault \
  --backup-vault-name my-vault \
  --backup-vault-tags env=dev

# Describe the vault
aws backup describe-backup-vault \
  --backup-vault-name my-vault

# Create a backup plan
aws backup create-backup-plan \
  --backup-plan '{
    "BackupPlanName": "daily-backup",
    "Rules": [{
      "RuleName": "daily",
      "TargetBackupVaultName": "my-vault",
      "ScheduleExpression": "cron(0 12 * * ? *)",
      "StartWindowMinutes": 60,
      "CompletionWindowMinutes": 120
    }]
  }'

# Assign resources to the plan
aws backup create-backup-selection \
  --backup-plan-id <plan-id> \
  --backup-selection '{
    "SelectionName": "my-tables",
    "IamRoleArn": "arn:aws:iam::000000000000:role/backup-role",
    "Resources": ["arn:aws:dynamodb:us-east-1:000000000000:table/my-table"]
  }'

# Start an on-demand backup job
aws backup start-backup-job \
  --backup-vault-name my-vault \
  --resource-arn arn:aws:dynamodb:us-east-1:000000000000:table/my-table \
  --iam-role-arn arn:aws:iam::000000000000:role/backup-role

# Poll job status
aws backup describe-backup-job --backup-job-id <job-id>

# List recovery points
aws backup list-recovery-points-by-backup-vault \
  --backup-vault-name my-vault

# Tag a vault
aws backup tag-resource \
  --resource-arn arn:aws:backup:us-east-1:000000000000:backup-vault:my-vault \
  --tags team=platform

# List tags
aws backup list-tags \
  --resource-arn arn:aws:backup:us-east-1:000000000000:backup-vault:my-vault

# Untag a vault
aws backup untag-resource \
  --resource-arn arn:aws:backup:us-east-1:000000000000:backup-vault:my-vault \
  --tag-key-list team
```
