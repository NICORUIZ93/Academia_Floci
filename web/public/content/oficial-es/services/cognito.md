# Cognito

**Protocolo:** JSON 1.1 (`X-Amz-Target: AWSCognitoIdentityProviderService.*`)
**Punto final:** `POST http://localhost:4566/`

Floci ofrece descubrimiento específico de grupo y puntos finales JWKS, además de un punto final de token OAuth relajado, para que los clientes locales puedan acuñar y validar tokens de acceso tipo Cognito contra claves de firma RS256.

`CreateUserPool` admite la anulación de varios valores usando etiquetas de grupo de usuarios **solo** en el momento de la creación:
* `floci:override-id`, para fijar el `UserPool.Id` resultante. 
* `floci:override-cognito-client-id`
  * establecido en `use-name` para usar el nombre del cliente como ID del cliente.
  * establecido en `append-to-name:-somestring` para agregar una cadena al nombre del cliente que se utilizará como ID de cliente.
  * establecido en `prepend-to-name:somestring-` para anteponer una cadena al nombre del cliente que se utilizará como ID de cliente.
* `floci:override-cognito-client-secret`, para establecer el secreto para todos los clientes creados en este grupo de usuarios.  

Floci elimina las etiquetas `floci:*` reservadas de las `UserPoolTags` almacenadas y devueltas tanto en las rutas de creación como de actualización, por lo que el espacio de nombres de etiquetas actúa como un canal de control de solo entrada y nunca persiste como metadatos visibles para el usuario.

El `TagResource` independiente rechaza las claves `floci:*` reservadas. `ListTagsForResource` y `UntagResource` operan en el mapa de etiquetas persistentes del grupo de usuarios.

## Acciones admitidas

### Grupos de usuarios

| Acción | Descripción |
|--------|-------------|
| CreateUserPool | Crea un grupo de usuarios local, aplicando anulaciones de tiempo de creación compatibles con `floci:*` a partir de etiquetas. |
| DescribeUserPool | Devuelve la configuración del grupo de usuarios almacenado. |
| ListUserPools | Enumera los grupos de usuarios locales visibles en la región de solicitud. |
| UpdateUserPool | Actualiza la configuración del grupo de usuarios mutables y las etiquetas persistentes del grupo de usuarios. |
| DeleteUserPool | Elimina un grupo de usuarios local y su estado relacionado. |

### Etiquetas del grupo de usuarios

| Acción | Descripción |
|--------|-------------|
| TagResource | Agrega etiquetas visibles para el usuario a un grupo de usuarios y rechaza las claves de etiquetas `floci:*` reservadas. |
| UntagResource | Elimina etiquetas del mapa de etiquetas persistentes de un grupo de usuarios. |
| ListTagsForResource | Devuelve las etiquetas persistentes del grupo de usuarios. |

### Clientes del grupo de usuarios

| Acción | Descripción |
|--------|-------------|
| CreateUserPoolClient | Crea una aplicación cliente para un grupo de usuarios, incluido el manejo de secretos generados opcional. |
| DescribeUserPoolClient | Devuelve la configuración del cliente de la aplicación almacenada. |
| ListUserPoolClients | Enumera los clientes de aplicaciones para un grupo de usuarios. |
| DeleteUserPoolClient | Elimina un cliente de aplicación de un grupo de usuarios. |

### Servidores de recursos

| Acción | Descripción |
|--------|-------------|
| CreateResourceServer | Registra un servidor de recursos y ámbitos para un grupo de usuarios. |
| DescribeResourceServer | Devuelve un servidor de recursos registrado. |
| ListResourceServers | Enumera los servidores de recursos para un grupo de usuarios. |
| DeleteResourceServer | Elimina un servidor de recursos de un grupo de usuarios. |

### Gestión de usuarios administradores

| Acción | Descripción |
|--------|-------------|
| AdminCreateUser | Crea o reenvía la configuración para un usuario en un grupo de usuarios. |
| AdminGetUser | Devuelve el estado y los atributos almacenados de un usuario. |
| AdminDeleteUser | Elimina un usuario de un grupo de usuarios. |
| AdminSetUserPassword | Establece la contraseña de un usuario y el estado de la contraseña permanente. |
| AdminUpdateUserAttributes | Actualiza los atributos de un usuario en un grupo de usuarios. |

### Operaciones de usuario

| Acción | Descripción |
|--------|-------------|
| SignUp | Crea un usuario de autoservicio para un cliente de aplicación. |
| ConfirmSignUp | Confirma un registro de autoservicio pendiente. |
| GetUser | Devuelve atributos para el usuario del token de acceso autenticado. |
| UpdateUserAttributes | Actualiza los atributos del usuario del token de acceso autenticado. |
| ChangePassword | Cambia la contraseña del usuario autenticado. |
| ForgotPassword | Inicia el flujo local de contraseña olvidada para un usuario. |
| ConfirmForgotPassword | Completa el flujo de contraseña olvidada estableciendo una contraseña de reemplazo. |

### Autenticación

| Acción | Descripción |
|--------|-------------|
| InitiateAuth | Autentica a los usuarios de la aplicación-cliente a través de flujos de usuario-contraseña y estilo SRP compatibles. |
| AdminInitiateAuth | Inicia un flujo de autenticación de administrador para un usuario del grupo de usuarios. |
| RespondToAuthChallenge | Responde a los desafíos de autenticación de Cognito admitidos. |

### Listado de usuarios

| Acción | Descripción |
|--------|-------------|
| ListUsers | Enumera los usuarios almacenados en un grupo de usuarios. |

### Grupos

| Acción | Descripción |
|--------|-------------|
| CreateGroup | Crea un grupo en un grupo de usuarios. |
| GetGroup | Devuelve un grupo de grupo de usuarios. |
| UpdateGroup | Actualiza la configuración almacenada de un grupo de usuarios. |
| ListGroups | Enumera grupos en un grupo de usuarios. |
| ListUsersInGroup | Enumera los usuarios asignados a un grupo. |
| DeleteGroup | Elimina un grupo de un grupo de usuarios. |
| AdminAddUserToGroup | Agrega un usuario a un grupo. |
| AdminRemoveUserFromGroup | Elimina un usuario de un grupo. |
| AdminListGroupsForUser | Enumera los grupos asignados a un usuario. |

## Puntos finales conocidos y OAuth

| Punto final | Descripción |
|------------------------------------------------------|------------------------------------------------------------------|
| `GET /{userPoolId}/.well-known/openid-configuration` | Documento de descubrimiento OpenID |
| `GET /{userPoolId}/.well-known/jwks.json` | Conjunto de claves web JSON para validación JWT |
| `POST /cognito-idp/oauth2/token` | Punto final de token OAuth relajado para `grant_type=client_credentials` |

`POST /cognito-idp/oauth2/token` es intencionalmente compatible con el emulador en lugar de una paridad completa de Cognito:

- Requiere un `client_id` existente.
- Acepta `client_id` y `client_secret` desde el cuerpo del formulario o autenticación básica.
- Requiere una aplicación cliente confidencial creada con `GenerateSecret=true`.
- Requiere `AllowedOAuthFlowsUserPoolClient=true` y `AllowedOAuthFlows=["client_credentials"]`.
- No requiere un dominio Cognito.
- Devuelve únicamente `access_token`, `token_type` y `expires_in`.
- Valida los alcances OAuth solicitados con el `AllowedOAuthScopes` del cliente de la aplicación y los alcances del servidor de recursos registrado del grupo.
- Anuncia el punto final del token con prefijo en `/{userPoolId}/.well-known/openid-configuration`.

## Configuración

| Variables | Predeterminado | Descripción |
|----------------------------------|---------|-------------------------------|
| `FLOCI_SERVICES_COGNITO_ENABLED` | `true` | Activar o desactivar el servicio |

## Ejemplos

```bash
export AWS_ENDPOINT_URL=http://localhost:4566

# Create a user pool
POOL_ID=$(aws cognito-idp create-user-pool \
  --pool-name MyApp \
  --query UserPool.Id --output text \
  --endpoint-url $AWS_ENDPOINT_URL)

# Create an app client
CLIENT_ID=$(aws cognito-idp create-user-pool-client \
  --user-pool-id $POOL_ID \
  --client-name my-client \
  --generate-secret \
  --allowed-o-auth-flows-user-pool-client \
  --allowed-o-auth-flows client_credentials \
  --allowed-o-auth-scopes notes/read notes/write \
  --query UserPoolClient.ClientId --output text \
  --endpoint-url $AWS_ENDPOINT_URL)

# Retrieve the generated client secret
CLIENT_SECRET=$(aws cognito-idp describe-user-pool-client \
  --user-pool-id $POOL_ID \
  --client-id $CLIENT_ID \
  --query UserPoolClient.ClientSecret --output text \
  --endpoint-url $AWS_ENDPOINT_URL)

# Register a resource server and scopes
aws cognito-idp create-resource-server \
  --user-pool-id $POOL_ID \
  --identifier notes \
  --name "Notes API" \
  --scopes ScopeName=read,ScopeDescription="Read notes" ScopeName=write,ScopeDescription="Write notes" \
  --endpoint-url $AWS_ENDPOINT_URL

# Create a user
aws cognito-idp admin-create-user \
  --user-pool-id $POOL_ID \
  --username alice@example.com \
  --temporary-password Temp1234! \
  --endpoint-url $AWS_ENDPOINT_URL

# Set a permanent password
aws cognito-idp admin-set-user-password \
  --user-pool-id $POOL_ID \
  --username alice@example.com \
  --password Perm1234! \
  --permanent \
  --endpoint-url $AWS_ENDPOINT_URL

# Authenticate
aws cognito-idp initiate-auth \
  --auth-flow USER_PASSWORD_AUTH \
  --client-id $CLIENT_ID \
  --auth-parameters USERNAME=alice@example.com,PASSWORD=Perm1234! \
  --endpoint-url $AWS_ENDPOINT_URL

# Create a group
aws cognito-idp create-group \
  --user-pool-id $POOL_ID \
  --group-name admin \
  --description "Admin group" \
  --endpoint-url $AWS_ENDPOINT_URL

# Add user to group
aws cognito-idp admin-add-user-to-group \
  --user-pool-id $POOL_ID \
  --group-name admin \
  --username alice@example.com \
  --endpoint-url $AWS_ENDPOINT_URL

# List groups for user
aws cognito-idp admin-list-groups-for-user \
  --user-pool-id $POOL_ID \
  --username alice@example.com \
  --endpoint-url $AWS_ENDPOINT_URL

# Fetch the pool discovery document
curl -s "$AWS_ENDPOINT_URL/$POOL_ID/.well-known/openid-configuration"

# Get a machine access token from the OAuth endpoint
curl -s \
  -X POST "$AWS_ENDPOINT_URL/cognito-idp/oauth2/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -u "$CLIENT_ID:$CLIENT_SECRET" \
  --data-urlencode "grant_type=client_credentials" \
  --data-urlencode "scope=notes/read notes/write"
```

## Validación JWT

Los tokens emitidos por Floci se pueden validar utilizando los puntos finales de descubrimiento y JWKS:

```
http://localhost:4566/$POOL_ID/.well-known/openid-configuration
```

```
http://localhost:4566/$POOL_ID/.well-known/jwks.json
```

Los tokens incluyen el reclamo `cognito:groups` como una matriz JSON cuando el usuario autenticado pertenece a uno o más grupos.

Los tokens emitidos por los flujos de autenticación de Cognito y el punto final del token OAuth utilizan la URL base del emulador más la identificación del grupo:

```
http://localhost:4566/$POOL_ID
```

Esto mantiene la coherencia interna del emisor, el documento de descubrimiento, la URL de JWKS y el punto final del token para la validación local de JWT, al tiempo que admite clientes confidenciales de estilo LocalStack y ámbitos respaldados por servidores de recursos.
