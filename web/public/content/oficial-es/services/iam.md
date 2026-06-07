# IAM

**Protocolo:** Consulta (XML) — `POST http://localhost:4566/` con parámetro `Action=`

## Acciones compatibles con

### Usuarios de
`CreateUser` · `GetUser` · `DeleteUser` · `ListUsers` · `UpdateUser` · `TagUser` · `UntagUser` · `ListUserTags`

### Grupos
`CreateGroup` · `GetGroup` · `DeleteGroup` · `ListGroups` · `AddUserToGroup` · `RemoveUserFromGroup` · `ListGroupsForUser`

### Funciones de
`CreateRole` · `GetRole` · `DeleteRole` · `ListRoles` · `UpdateRole` · `UpdateAssumeRolePolicy` · `TagRole` · `UntagRole` · `ListRoleTags`

### Políticas de
`CreatePolicy` · `GetPolicy` · `DeletePolicy` · `ListPolicies` · `CreatePolicyVersion` · `GetPolicyVersion` · `DeletePolicyVersion` · `ListPolicyVersions` · `SetDefaultPolicyVersion` · `TagPolicy` · `UntagPolicy` · `ListPolicyTags`

### Límites de permiso
`PutUserPermissionsBoundary` · `DeleteUserPermissionsBoundary` · `PutRolePermissionsBoundary` · `DeleteRolePermissionsBoundary`

### Adjuntos de política
`AttachUserPolicy` · `DetachUserPolicy` · `ListAttachedUserPolicies`
`AttachGroupPolicy` · `DetachGroupPolicy` · `ListAttachedGroupPolicies`
`AttachRolePolicy` · `DetachRolePolicy` · `ListAttachedRolePolicies`

### Políticas en línea
`PutUserPolicy` · `GetUserPolicy` · `DeleteUserPolicy` · `ListUserPolicies`
`PutGroupPolicy` · `GetGroupPolicy` · `DeleteGroupPolicy` · `ListGroupPolicies`
`PutRolePolicy` · `GetRolePolicy` · `DeleteRolePolicy` · `ListRolePolicies`

### Perfiles de instancia
`CreateInstanceProfile` · `GetInstanceProfile` · `DeleteInstanceProfile` · `ListInstanceProfiles` · `AddRoleToInstanceProfile` · `RemoveRoleFromInstanceProfile` · `ListInstanceProfilesForRole`

### Claves de acceso
`CreateAccessKey` · `GetAccessKeyLastUsed` · `ListAccessKeys` · `UpdateAccessKey` · `DeleteAccessKey`

### Perfiles de inicio de sesión de
`CreateLoginProfile` · `DeleteLoginProfile` · `UpdateLoginProfile`

## AWS Políticas administradas

Floci genera un catálogo de políticas administradas AWS de uso común al inicio. Estos se pueden conectar inmediatamente sin ninguna configuración:

**Acceso general**
`AdministratorAccess` · `PowerUserAccess` · `ReadOnlyAccess` · `IAMFullAccess` · `AmazonS3FullAccess` · `AmazonS3ReadOnlyAccess` · `AmazonDynamoDBFullAccess` · `AmazonEC2FullAccess` · `AmazonSQSFullAccess` · `AmazonSNSFullAccess` · `AmazonVPCFullAccess` · `CloudWatchFullAccess` · `AWSLambdaFullAccess`

**Roles de ejecución Lambda** (`arn:aws:iam::aws:policy/service-role/...`)
`AWSLambdaBasicExecutionRole` · `AWSLambdaBasicDurableExecutionRolePolicy` · `AWSLambdaDynamoDBExecutionRole` · `AWSLambdaKinesisExecutionRole` · `AWSLambdaMSKExecutionRole` · `AWSLambdaSQSQueueExecutionRole` · `AWSLambdaVPCAccessExecutionRole`

**Roles de ejecución ECS / EKS**
`AmazonECSTaskExecutionRolePolicy` · `AmazonEKSFargatePodExecutionRolePolicy`

**Otros roles de ejecución**
`AmazonS3ObjectLambdaExecutionRolePolicy` · `CloudWatchLambdaInsightsExecutionRolePolicy` · `CloudWatchLambdaApplicationSignalsExecutionRolePolicy` · `AWSConfigRulesExecutionRole` · `AWSMSKReplicatorExecutionRole` · `AWS-SSM-DiagnosisAutomation-ExecutionRolePolicy` · `AWS-SSM-RemediationAutomation-ExecutionRolePolicy` · `AmazonSageMakerGeospatialExecutionRole` · `AmazonSageMakerCanvasEMRServerlessExecutionRolePolicy` · `SageMakerStudioBedrockFunctionExecutionRolePolicy` · `SageMakerStudioDomainExecutionRolePolicy` · `SageMakerStudioQueryExecutionRolePolicy` · `AmazonDataZoneDomainExecutionRolePolicy` · `AmazonBedrockAgentCoreMemoryBedrockModelInferenceExecutionRolePolicy` · `AWSPartnerCentralSellingResourceSnapshotJobExecutionRolePolicy`

Todas las políticas inicializadas utilizan un documento comodín permisivo ya que Floci no aplica la evaluación de políticas IAM de forma predeterminada.

## IAM Modo de aplicación

De forma predeterminada, Floci acepta cualquier credencial sin aplicar las políticas de IAM: se permiten todas las solicitudes independientemente de las políticas adjuntas a la identidad de llamada. Esto preserva la compatibilidad con versiones anteriores y mantiene la configuración predeterminada sin problemas.

La configuración de `enforcement-enabled: true` activa el evaluador de políticas como un filtro de solicitudes JAX-RS. Luego, cada solicitud entrante se evalúa según las políticas basadas en identidad del usuario IAM que llama o del rol asumido antes de llegar al controlador de servicios.

### Habilitar cumplimiento

**Variable de entorno:**
```bash
FLOCI_SERVICES_IAM_ENFORCEMENT_ENABLED=true
```

Docker Componer:
```yaml
environment:
  FLOCI_SERVICES_IAM_ENFORCEMENT_ENABLED: "true"
```

### Reglas de evaluación

La evaluación de políticas sigue la precedencia estándar AWS:

1. Un **Denegar** explícito en cualquier política → se deniega la solicitud (HTTP 403 `AccessDeniedException`)
2. **Permitir** explícito en cualquier política → se permite la solicitud
3. No hay declaración coincidente → denegación implícita (HTTP 403)

### Reglas de omisión

Estas identidades siempre pasan por alto la aplicación de la ley (valores predeterminados compatibles con versiones anteriores):

| Identidad | Comportamiento |
|---|---|
| Clave de acceso `test` (la credencial de desarrollo predeterminada) | Siempre permitido: sin búsqueda de políticas |
| Clave de acceso desconocida (no en la tienda IAM) | Siempre permitido: compatible con versiones anteriores con claves preexistentes |
| Sin encabezado `Authorization` | Permitido: ruta no autenticada (por ejemplo, comprobaciones de estado) |
| Acción IAM irresoluble para la solicitud | Permitido: las asignaciones desconocidas son permisivas |

### Funciones de política admitidas

- **Políticas basadas en identidad**: políticas de usuario/grupo/rol en línea y políticas adjuntas administradas.
- **Políticas de sesión**: políticas en línea aprobadas durante `sts:AssumeRole`.
- **Límites de permisos**: políticas administradas utilizadas para limitar los permisos máximos.
- **Patrones de acción/recurso**: coincidencias literales, comodines (`*`, `?`) y bloques `NotAction`/`NotResource`.
- **Condiciones**: soporte para bloques `Condition` con múltiples operadores.
- **Efectos**: `Allow` y `Deny`.

Operadores de condiciones admitidos ####:
- `StringEquals`, `StringNotEquals`, `StringEqualsIgnoreCase`, `StringNotEqualsIgnoreCase`
- `StringLike`, `StringNotLike`
- `ArnEquals`, `ArnLike`, `ArnNotEquals`, `ArnNotLike`
- `NumericEquals`, `NumericNotEquals`, `NumericLessThan`, `NumericGreaterThan` (y variantes iguales)
- `DateEquals`, `DateNotEquals`, `DateLessThan`, `DateGreaterThan` (y variantes iguales)
- `Bool`, `IpAddress`, `NotIpAddress`, `Null`
- Admite variantes `...IfExists` para todos los operadores.

**Aún no se admite**: `NotPrincipal`, políticas basadas en recursos (política de depósito S3, política de recursos Lambda).

### Roles asumidos

Cuando una persona que llama usa `sts:AssumeRole`, las credenciales de sesión devueltas se registran internamente. Las solicitudes posteriores firmadas con esas credenciales de sesión se evalúan con respecto a:
1. Las políticas adjuntas y en línea del **rol**.
2. La **política de sesión** (si se proporciona durante `AssumeRole`), que actúa como un filtro de intersección.

Ejemplo de ###: configuración de aplicación mínima

```bash
export AWS_ENDPOINT_URL=http://localhost:4566

# Create a user and get credentials
aws iam create-user --user-name alice
KEY=$(aws iam create-access-key --user-name alice --query 'AccessKey.[AccessKeyId,SecretAccessKey]' --output text)
AKID=$(echo $KEY | awk '{print $1}')
SECRET=$(echo $KEY | awk '{print $2}')

# Create and attach a policy that allows S3 list
POLICY_ARN=$(aws iam create-policy \
  --policy-name allow-s3-list \
  --policy-document '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Action":"s3:ListAllMyBuckets","Resource":"*"}]}' \
  --query 'Policy.Arn' --output text)

aws iam attach-user-policy --user-name alice --policy-arn $POLICY_ARN

# alice can now list buckets
AWS_ACCESS_KEY_ID=$AKID AWS_SECRET_ACCESS_KEY=$SECRET \
  aws s3 ls
```

## Configuración

| Variables | Predeterminado | Descripción |
|---|---|---|
| `FLOCI_SERVICES_IAM_ENABLED` | `true` | Activar o desactivar el servicio |
| `FLOCI_SERVICES_IAM_ENFORCEMENT_ENABLED` | `false` | Aplicar políticas IAM en todas las solicitudes entrantes |

## Ejemplos

```bash
export AWS_ENDPOINT_URL=http://localhost:4566

# Create a role
aws iam create-role \
  --role-name lambda-execution-role \
  --assume-role-policy-document '{
    "Version": "2012-10-17",
    "Statement": [{
      "Effect": "Allow",
      "Principal": {"Service": "lambda.amazonaws.com"},
      "Action": "sts:AssumeRole"
    }]
  }' \
  --endpoint-url $AWS_ENDPOINT_URL

# Attach a managed policy
aws iam attach-role-policy \
  --role-name lambda-execution-role \
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole \
  --endpoint-url $AWS_ENDPOINT_URL

# Create a user
aws iam create-user --user-name alice --endpoint-url $AWS_ENDPOINT_URL

# Create an access key
aws iam create-access-key --user-name alice --endpoint-url $AWS_ENDPOINT_URL

# List roles
aws iam list-roles --endpoint-url $AWS_ENDPOINT_URL
```
