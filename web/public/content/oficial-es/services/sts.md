# STS

**Protocolo:** Consulta (XML) — `POST http://localhost:4566/` con parámetro `Action=`

## Acciones compatibles con

| Acción | Descripción |
|---|---|
| `GetCallerIdentity` | Devuelve el ID de cuenta, el ID de usuario y ARN |
| `AssumeRole` | Asume un rol IAM, devuelve credenciales temporales |
| `AssumeRoleWithWebIdentity` | Asuma un rol utilizando un token de identidad web (OIDC) |
| `AssumeRoleWithSAML` | Asuma un rol usando una aserción SAML |
| `GetSessionToken` | Obtenga credenciales temporales para un usuario de IAM |
| `GetFederationToken` | Obtener credenciales temporales para un usuario federado |
| `DecodeAuthorizationMessage` | Decodificar un mensaje de error de autorización codificado |

## Configuración

| Variables | Predeterminado | Descripción |
|---|---|---|
| `FLOCI_SERVICES_STS_ENABLED` | `true` | Activar o desactivar el servicio |

## Ejemplos

```bash
export AWS_ENDPOINT_URL=http://localhost:4566

# Get caller identity (always works, useful for smoke testing)
aws sts get-caller-identity --endpoint-url $AWS_ENDPOINT_URL

# Assume a role
aws sts assume-role \
  --role-arn arn:aws:iam::000000000000:role/my-role \
  --role-session-name dev-session \
  --endpoint-url $AWS_ENDPOINT_URL

# Get a session token
aws sts get-session-token --endpoint-url $AWS_ENDPOINT_URL
```

`GetCallerIdentity` se usa comúnmente en canalizaciones de CI y pruebas de integración como una verificación rápida de conectividad antes de ejecutar pruebas más complejas.
