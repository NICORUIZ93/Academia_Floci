# Módulo 14 · Autenticación de usuarios con Cognito

## Cognito — autenticación de usuarios

Cognito es el servicio de AWS para gestionar usuarios, contraseñas y tokens de autenticación.

```bash
# Crea un User Pool (directorio de usuarios)
USER_POOL_ID=$(aws cognito-idp create-user-pool \
  --pool-name mi-app-usuarios \
  --auto-verified-attributes email \
  --password-policy '{
    "MinimumLength":8,
    "RequireUppercase":true,
    "RequireLowercase":true,
    "RequireNumbers":true
  }' \
  --query UserPool.Id --output text)

echo "User Pool: $USER_POOL_ID"

# Crea un App Client (para tu app web/mobile)
CLIENT_ID=$(aws cognito-idp create-user-pool-client \
  --user-pool-id $USER_POOL_ID \
  --client-name mi-app-cliente \
  --explicit-auth-flows ALLOW_USER_PASSWORD_AUTH ALLOW_REFRESH_TOKEN_AUTH \
  --query UserPoolClient.ClientId --output text)

echo "Client ID: $CLIENT_ID"

# Registra un usuario
aws cognito-idp sign-up \
  --client-id $CLIENT_ID \
  --username alice@ejemplo.com \
  --password "Contraseña123!" \
  --user-attributes Name=email,Value=alice@ejemplo.com

# Confirma el usuario (en producción llegaría un email)
aws cognito-idp admin-confirm-sign-up \
  --user-pool-id $USER_POOL_ID \
  --username alice@ejemplo.com

# Autentica al usuario (obtiene tokens JWT)
aws cognito-idp initiate-auth \
  --auth-flow USER_PASSWORD_AUTH \
  --client-id $CLIENT_ID \
  --auth-parameters USERNAME=alice@ejemplo.com,PASSWORD="Contraseña123!"
```

### Flujo de autenticación con tokens JWT

```python
import boto3, json

cognito = boto3.client("cognito-idp",
    endpoint_url="http://localhost:4566",
    region_name="us-east-1",
    aws_access_key_id="test",
    aws_secret_access_key="test"
)

def autenticar(client_id, username, password):
    resp = cognito.initiate_auth(
        AuthFlow="USER_PASSWORD_AUTH",
        ClientId=client_id,
        AuthParameters={"USERNAME": username, "PASSWORD": password}
    )
    tokens = resp["AuthenticationResult"]
    return {
        "access_token": tokens["AccessToken"],   # Para llamar APIs
        "id_token": tokens["IdToken"],            # Identidad del usuario
        "refresh_token": tokens["RefreshToken"],  # Para renovar sin login
        "expira_en": tokens["ExpiresIn"]          # Segundos (generalmente 3600)
    }
```

---

## Comparación con Azure y GCP

| | AWS | Azure | GCP |
|-|-----|-------|-----|
| Autenticación | Cognito | Azure AD B2C / Entra ID | Firebase Auth / Identity Platform |
| Mensajería fan-out | SNS | Event Grid | Cloud Pub/Sub |
| Bus de eventos | EventBridge | Azure Event Hub | Eventarc |
| Scheduling | EventBridge Scheduler | Logic Apps | Cloud Scheduler |

---

## Reto del módulo

1. Crea un topic SNS y dos colas SQS suscritas a él
2. Publica un mensaje al topic y verifica que ambas colas lo reciben
3. Crea un User Pool en Cognito, registra un usuario y autentica (obtén el JWT)
4. Crea una regla EventBridge que capture eventos de pedidos y los reenvíe a una Lambda
5. (Bonus) Configura un schedule que invoque tu Lambda cada minuto

## Preguntas de salida

1. ¿Cuál es la diferencia entre SNS y SQS?
2. ¿Por qué usar EventBridge en lugar de SNS para arquitecturas complejas?
3. ¿Qué es un token JWT y qué contiene?
4. ¿Cuándo usarías Cognito en lugar de implementar tu propio sistema de auth?

## Comparación de autenticación

| | AWS Cognito | Azure Entra ID B2C | GCP Identity Platform |
|-|-------------|--------------------|-----------------------|
| User directory | User Pool | B2C Tenant | Identity Provider |
| Tokens | JWT (OAuth 2.0) | JWT (OAuth 2.0) | JWT (OpenID Connect) |
| SDK | Amplify / aws-sdk | MSAL | Firebase Auth SDK |

## Reto del módulo

1. Crea un User Pool y un App Client en Cognito
2. Registra un usuario `alice@ejemplo.com` con contraseña y confírmalo
3. Autentica al usuario con `initiate-auth` y guarda el Access Token
4. Decodifica el JWT manualmente (base64 del segmento del medio) y observa los campos `sub`, `email`, `exp`
5. Protege un endpoint de tu API Gateway con un Cognito Authorizer
6. Invoca el endpoint sin token (debe dar 401) y con token (debe funcionar)

## Preguntas de salida

1. ¿Cuál es la diferencia entre Access Token, ID Token y Refresh Token?
2. ¿Por qué el token expira (campo `exp` en el JWT)?
3. ¿Por qué NO debes construir tu propio sistema de autenticación desde cero?
4. ¿Qué es PKCE y para qué sirve en aplicaciones móviles?
## Verificación del aprendizaje

Antes de marcar este módulo como completado, confirma esto con evidencia propia:

1. **Lo puedo explicar en una frase.** Escribe qué problema resuelve este módulo y para qué lo usarías en una aplicación real.
2. **Lo ejecuté, no solo lo leí.** Guarda el comando principal que corriste y una salida real de tu terminal.
3. **Lo puedo verificar.** Consulta el recurso con AWS CLI, Azure CLI, GCP CLI o StackPort cuando aplique. La evidencia debe mostrar nombre, estado o contenido del recurso.
4. **Entiendo un fallo común.** Provoca o identifica un error sencillo, copia el mensaje completo y explica cómo lo diagnosticaste.
5. **Sé cuándo avanzar.** Avanza solo si puedes repetir el laboratorio desde una carpeta limpia sin depender de copiar a ciegas.

Evidencia mínima sugerida:

```text
Comando ejecutado:
Salida obtenida:
Qué significa la salida:
Error o duda encontrada:
Cómo la resolví:
```

