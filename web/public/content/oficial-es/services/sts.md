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

## Aplicación de políticas de confianza

De forma predeterminada, `AssumeRole` tiene éxito para cualquier persona que llama. Cuando `FLOCI_SERVICES_IAM_ENFORCEMENT_ENABLED=true`,
`AssumeRole` evalúa la política de confianza del rol de destino (`AssumeRolePolicyDocument`) frente a la persona que llama
y devuelve `AccessDenied` si no está permitido. Los formularios principales de AWS coinciden: `"*"`, un
ID de cuenta, una raíz de cuenta ARN (`arn:aws:iam::<acct>:root`) y ARN principales exactos, y un
explícito `Deny` siempre gana. Tanto los elementos `Action` como `NotAction` se respetan al hacer coincidir
`sts:AssumeRole`. Los roles que Floci no tiene registro de permanencia permisivos, por lo que esto solo afecta a los roles
creado a través de IAM con una política de confianza real.

### Limitaciones conocidas

- **Los bloques `Condition` no se evalúan.** Una política de confianza que requiere `sts:ExternalId` (el
  guardia adjunto confundido) se corresponde solo con su director, por lo que el papel se puede asumir sin pasar
  `ExternalId` y se ignora el parámetro de solicitud `ExternalId`. Esto coincide con moto/LocalStack.
- **Solo se marca la política de confianza.** `AssumeRole` entre cuentas en AWS también requiere la
  propia política de identidad para permitir `sts:AssumeRole`; ese lado no se aplica.

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

Cuando `FLOCI_SERVICES_IAM_SEED_DEPLOYER_PRINCIPAL=true`, las solicitudes firmadas con la clave de acceso inicializada `floci` devuelven `arn:aws:iam::000000000000:user/floci-deployer`. Otras credenciales locales desconocidas continúan devolviendo la raíz de la cuenta ARN por motivos de compatibilidad con versiones anteriores.
