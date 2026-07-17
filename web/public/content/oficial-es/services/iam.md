# IAM

**Protocolo:** Consulta (XML) — `POST http://localhost:4566/` con parámetro `Action=`

## Acciones compatibles con

### Usuarios de

| Acción | Descripción |
|--------|-------------|
| CreateUser | Crea un usuario IAM en la cuenta local. |
| GetUser | Devuelve un usuario IAM almacenado. |
| DeleteUser | Elimina un usuario IAM del almacén local IAM. |
| ListUsers | Enumera los usuarios de IAM en la cuenta local. |
| UpdateUser | Actualiza los campos de usuario mutables IAM. |
| TagUser | Agrega etiquetas a un usuario IAM. |
| UntagUser | Elimina etiquetas de un usuario IAM. |
| ListUserTags | Enumera las etiquetas almacenadas para un usuario IAM. |

### Grupos

| Acción | Descripción |
|--------|-------------|
| CreateGroup | Crea un grupo IAM. |
| GetGroup | Devuelve un grupo IAM y sus usuarios. |
| DeleteGroup | Elimina un grupo IAM del almacén local IAM. |
| ListGroups | Enumera los grupos IAM en la cuenta local. |
| AddUserToGroup | Agrega un usuario a un grupo IAM. |
| RemoveUserFromGroup | Elimina un usuario de un grupo IAM. |
| ListGroupsForUser | Enumera los grupos que contienen un usuario. |

### Funciones de

| Acción | Descripción |
|--------|-------------|
| CreateRole | Crea un rol IAM con una política de asumir rol. |
| GetRole | Devuelve un rol IAM almacenado. |
| DeleteRole | Elimina una función IAM del almacén local IAM. |
| ListRoles | Enumera los roles de IAM en la cuenta local. |
| UpdateRole | Actualiza los campos de función mutables IAM. |
| UpdateAssumeRolePolicy | Reemplaza el documento de política de asunción de roles de un rol. |
| TagRole | Agrega etiquetas a un rol IAM. |
| UntagRole | Elimina etiquetas de un rol IAM. |
| ListRoleTags | Enumera las etiquetas almacenadas para una función IAM. |

### Políticas de

| Acción | Descripción |
|--------|-------------|
| CreatePolicy | Crea una política IAM administrada por el cliente. |
| GetPolicy | Devuelve metadatos para una política IAM administrada. |
| DeletePolicy | Elimina una política IAM administrada. |
| ListPolicies | Enumera las políticas administradas de IAM, incluidas las políticas administradas de AWS inicializadas. |
| CreatePolicyVersion | Crea una nueva versión de una política administrada. |
| GetPolicyVersion | Devuelve un documento de versión de política administrada. |
| DeletePolicyVersion | Elimina una versión de política administrada no predeterminada. |
| ListPolicyVersions | Enumera las versiones de una política administrada. |
| SetDefaultPolicyVersion | Establece la versión predeterminada para una política administrada. |
| TagPolicy | Agrega etiquetas a una política administrada. |
| UntagPolicy | Elimina etiquetas de una política administrada. |
| ListPolicyTags | Enumera las etiquetas almacenadas para una política administrada. |

### Límites de permiso

| Acción | Descripción |
|--------|-------------|
| PutUserPermissionsBoundary | Establece una política administrada como límite de permisos de un usuario. |
| DeleteUserPermissionsBoundary | Elimina el límite de permisos de un usuario. |
| PutRolePermissionsBoundary | Establece una política administrada como límite de permisos de una función. |
| DeleteRolePermissionsBoundary | Elimina el límite de permisos de un rol. |

### Adjuntos de política

| Acción | Descripción |
|--------|-------------|
| AttachUserPolicy | Adjunta una política administrada a un usuario. |
| DetachUserPolicy | Separa una política administrada de un usuario. |
| ListAttachedUserPolicies | Enumera las políticas administradas adjuntas a un usuario. |
| AttachGroupPolicy | Adjunta una política administrada a un grupo. |
| DetachGroupPolicy | Separa una política administrada de un grupo. |
| ListAttachedGroupPolicies | Enumera las políticas administradas adjuntas a un grupo. |
| AttachRolePolicy | Adjunta una política administrada a un rol. |
| DetachRolePolicy | Separa una política administrada de un rol. |
| ListAttachedRolePolicies | Enumera las políticas administradas adjuntas a una función. |

### Políticas en línea

| Acción | Descripción |
|--------|-------------|
| PutUserPolicy | Almacena o reemplaza una política en línea de un usuario. |
| GetUserPolicy | Devuelve una política en línea almacenada en un usuario. |
| DeleteUserPolicy | Elimina una política en línea de un usuario. |
| ListUserPolicies | Enumera los nombres de políticas en línea almacenados en un usuario. |
| PutGroupPolicy | Almacena o reemplaza una política en línea en un grupo. |
| GetGroupPolicy | Devuelve una política en línea almacenada en un grupo. |
| DeleteGroupPolicy | Elimina una política en línea de un grupo. |
| ListGroupPolicies | Enumera los nombres de políticas en línea almacenados en un grupo. |
| PutRolePolicy | Almacena o reemplaza una política en línea en un rol. |
| GetRolePolicy | Devuelve una política en línea almacenada en un rol. |
| DeleteRolePolicy | Elimina una política en línea de un rol. |
| ListRolePolicies | Enumera los nombres de políticas en línea almacenados en un rol. |

### Perfiles de instancia

| Acción | Descripción |
|--------|-------------|
| CreateInstanceProfile | Crea un perfil de instancia IAM. |
| GetInstanceProfile | Devuelve un perfil de instancia y sus roles. |
| DeleteInstanceProfile | Elimina un perfil de instancia del almacén local IAM. |
| ListInstanceProfiles | Enumera los perfiles de instancia IAM. |
| AddRoleToInstanceProfile | Agrega un rol a un perfil de instancia. |
| RemoveRoleFromInstanceProfile | Elimina una función de un perfil de instancia. |
| ListInstanceProfilesForRole | Enumera los perfiles de instancia asociados con un rol. |

### Claves de acceso

| Acción | Descripción |
|--------|-------------|
| CreateAccessKey | Crea credenciales de clave de acceso para un usuario. |
| GetAccessKeyLastUsed | Devuelve los últimos metadatos utilizados almacenados para una clave de acceso. |
| ListAccessKeys | Muestra las claves de acceso de un usuario. |
| UpdateAccessKey | Actualiza el estado de una clave de acceso. |
| DeleteAccessKey | Elimina una clave de acceso de un usuario. |

### Perfiles de inicio de sesión de

| Acción | Descripción |
|--------|-------------|
| CreateLoginProfile | Crea un perfil de inicio de sesión con contraseña para un usuario. |
| DeleteLoginProfile | Elimina el perfil de inicio de sesión de un usuario. |
| UpdateLoginProfile | Actualiza la configuración de contraseña del perfil de inicio de sesión de un usuario. |

### Simulación de políticas

| Acción | Descripción |
|--------|-------------|
| SimulatePrincipalPolicy | Evalúa las acciones y recursos solicitados frente a las políticas del director resueltas. |

## AWS Políticas administradas

Floci genera un catálogo de políticas administradas AWS de uso común al inicio. Estos se pueden conectar inmediatamente sin ninguna configuración:

**Acceso general**
`AdministratorAccess` · `PowerUserAccess` · `ReadOnlyAccess` · `IAMFullAccess` · `AmazonS3FullAccess` · `AmazonS3ReadOnlyAccess` · `AmazonDynamoDBFullAccess` · `AmazonEC2FullAccess` · `AmazonSQSFullAccess` · `AmazonSNSFullAccess` · `AmazonVPCFullAccess` · `CloudWatchFullAccess` · `AWSLambdaFullAccess`

**Roles de ejecución Lambda** (`arn:aws:iam::aws:policy/service-role/...`)
`AWSLambdaBasicExecutionRole` · `AWSLambdaBasicDurableExecutionRolePolicy` · `AWSLambdaDynamoDBExecutionRole` · `AWSLambdaKinesisExecutionRole` · `AWSLambdaMSKExecutionRole` · `AWSLambdaSQSQueueExecutionRole` · `AWSLambdaVPCAccessExecutionRole`

**Roles de ejecución ECS / EKS**
`AmazonECSTaskExecutionRolePolicy` · `AmazonEKSFargatePodExecutionRolePolicy`

**Clúster EKS y grupos de nodos**
`AmazonEKSClusterPolicy` · `AmazonEKSServicePolicy` · `AmazonEKSVPCResourceController` · `AmazonEKSWorkerNodePolicy` · `AmazonEKS_CNI_Policy`

**Otros roles de ejecución**
`AmazonS3ObjectLambdaExecutionRolePolicy` · `CloudWatchLambdaInsightsExecutionRolePolicy` · `CloudWatchLambdaApplicationSignalsExecutionRolePolicy` · `AWSConfigRulesExecutionRole` · `AWSMSKReplicatorExecutionRole` · `AWS-SSM-DiagnosisAutomation-ExecutionRolePolicy` · `AWS-SSM-RemediationAutomation-ExecutionRolePolicy` · `AmazonSageMakerGeospatialExecutionRole` · `AmazonSageMakerCanvasEMRServerlessExecutionRolePolicy` · `SageMakerStudioBedrockFunctionExecutionRolePolicy` · `SageMakerStudioDomainExecutionRolePolicy` · `SageMakerStudioQueryExecutionRolePolicy` · `AmazonDataZoneDomainExecutionRolePolicy` · `AmazonBedrockAgentCoreMemoryBedrockModelInferenceExecutionRolePolicy` · `AWSPartnerCentralSellingResourceSnapshotJobExecutionRolePolicy`

Todas las políticas inicializadas utilizan un documento comodín permisivo ya que Floci no aplica la evaluación de políticas IAM de forma predeterminada.

## Principal de implementación local opcional

Floci puede generar un usuario local de IAM para flujos de trabajo de desarrollo que esperan una identidad concreta de la persona que llama antes de que comience el aprovisionamiento. Esto está deshabilitado de forma predeterminada.

Habilítelo con:

```bash
FLOCI_SERVICES_IAM_SEED_DEPLOYER_PRINCIPAL=true
```

Cuando está habilitado, Floci crea el usuario `floci-deployer` si aún no existe, adjunta `arn:aws:iam::aws:policy/AdministratorAccess` y crea credenciales de clave de acceso estáticas `floci`/`floci` si esa clave de acceso aún no existe. Se conservan los usuarios y claves de acceso existentes.

Las solicitudes firmadas con la clave de acceso inicializada devuelven al usuario implementador ARN de `sts:GetCallerIdentity`.

## IAM Modo de aplicación

De forma predeterminada, Floci acepta cualquier credencial sin aplicar las políticas de IAM: todas las solicitudes se permiten independientemente de las políticas adjuntas a la identidad de llamada. Esto preserva la compatibilidad con versiones anteriores y mantiene la configuración predeterminada sin problemas.

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

1. **Denegar** explícito en cualquier política de identidad, sesión o límite → se deniega la solicitud (HTTP 403 `AccessDeniedException`)
2. Un **Permitir** explícito en una política de identidad crea la concesión base.
3. Si hay una política de sesión presente, también debe permitir explícitamente la solicitud.
4. Si hay un límite de permiso presente, también debe permitir explícitamente la solicitud.
5. Ningún permiso efectivo coincidente → denegación implícita (HTTP 403)

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

**Aún no es compatible**: `NotPrincipal`, políticas basadas en recursos (política de depósito S3, política de recursos Lambda).

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
| `FLOCI_SERVICES_IAM_SEED_DEPLOYER_PRINCIPAL` | `false` | Sembrar el usuario opcional `floci-deployer` y la clave de acceso `floci` / `floci` |

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
