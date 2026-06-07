# Cognito

**Protocolo:** JSON 1.1 (`X-Amz-Target: AWSCognitoIdentityProviderService.*`)
**Punto final:** `POST http://localhost:4566/`

Floci ofrece descubrimiento específico de grupo y puntos finales JWKS, además de un punto final de token OAuth relajado, para que los clientes locales puedan acuñar y validar tokens de acceso tipo Cognito contra claves de firma RS256.

`CreateUserPool` acepta una etiqueta reservada de grupo de usuarios, `floci:override-id`, para fijar el `UserPool.Id` resultante en el momento de la creación. Floci elimina las etiquetas `floci:*` reservadas de las `UserPoolTags` almacenadas y devueltas en las rutas de creación y actualización, por lo que el espacio de nombres de etiquetas actúa como un canal de control de solo entrada y nunca persiste como metadatos visibles para el usuario.

El `TagResource` independiente rechaza las claves `floci:*` reservadas. `ListTagsForResource` y `UntagResource` operan en el mapa de etiquetas persistentes del grupo de usuarios.

## Acciones admitidas

| Categoría | Acciones |
|---|---|
| **Grupos de usuarios** | CreateUserPool, DescribeUserPool, ListUserPools, UpdateUserPool, DeleteUserPool |
| **Etiquetas del grupo de usuarios** | TagResource, UntagResource, ListTagsForResource |
| **Clientes del grupo de usuarios** | CreateUserPoolClient, DescribeUserPoolClient, ListUserPoolClients, DeleteUserPoolClient |
| **Servidores de recursos** | CreateResourceServer, DescribeResourceServer, ListResourceServers, DeleteResourceServer |
| **Gestión de usuarios administradores** | AdminCreateUser (incluido `MessageAction=RESEND`), AdminGetUser, AdminDeleteUser, AdminSetUserPassword, AdminUpdateUserAttributes |
| **Operaciones de usuario** | SignUp, ConfirmSignUp, GetUser, UpdateUserAttributes, ChangePassword, ForgotPassword, ConfirmForgotPassword |
| **Autenticación** | InitiateAuth, AdminInitiateAuth, RespondToAuthChallenge (admite USER_PASSWORD_AUTH, USER_SRP_AUTH, ADMIN_USER_SRP_AUTH) |
| **Listado de usuarios** | ListUsers |
| **Grupos** | CreateGroup, GetGroup, UpdateGroup, ListGroups, ListUsersInGroup, DeleteGroup, AdminAddUserToGroup, AdminRemoveUserFromGroup, AdminListGroupsForUser |

## Puntos finales conocidos y OAuth

| Punto final | Descripción |
|---|---|
| `GET /{userPoolId}/.well-known/openid-configuration` | Documento de descubrimiento OpenID |
| `GET /{userPoolId}/.well-known/jwks.json` | Conjunto de claves web JSON para validación JWT |
| `POST /cognito-idp/oauth2/token` | Punto final de token OAuth relajado para `grant_type=client_credentials` |

`POST /cognito-idp/oauth2/token` es intencionalmente compatible con el emulador en lugar de una paridad completa de Cognito:

- Requiere un `client_id` existente.
- Acepta `client_id` y `client_secret` desde el cuerpo del formulario o autenticación básica.
- Requiere una aplicación cliente confidencial creada con `GenerateSecret=true`.
- Requiere `AllowedOAuthFlowsUserPoolClient=true` y `AllowedOAuthFlows=["client_credentials"]`.
- No requiere un dominio Cognito.
- Devuelve solo `access_token`, `token_type` y `expires_in`.
- Valida los alcances OAuth solicitados con el `AllowedOAuthScopes` del cliente de la aplicación y los alcances del servidor de recursos registrados del grupo.
- Anuncia el punto final del token con prefijo en `/{userPoolId}/.well-known/openid-configuration`.

## Configuración

| Variables | Predeterminado | Descripción |
|---|---|---|
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
