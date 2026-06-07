# Familia de transferencia

**Protocolo:** JSON 1.1  
**Punto final:** `http://localhost:4566/`  
**Prefijo X-Amz-Target:** `TransferService.`

AWS Transfer Family gestión de servidor de transferencia de archivos gestionado. Esta implementación cubre el plano de administración API para el ciclo de vida del servidor y del usuario, la administración de claves públicas SSH y el etiquetado. El manejo real del protocolo SFTP/FTP está fuera del alcance: el estado del servidor se simula durante el proceso.

## Acciones admitidas

### Servidores

| Acción | Descripción |
|---|---|
| `CreateServer` | Crear un servidor de transferencia de archivos administrado |
| `DescribeServer` | Obtener metadatos y configuración del servidor |
| `UpdateServer` | Protocolos de actualización, tipo de punto final, función de registro, política de seguridad |
| `DeleteServer` | Eliminar un servidor (debe estar en estado `OFFLINE`) |
| `ListServers` | Lista paginada de servidores |
| `StartServer` | Servidor de transición de `OFFLINE` a `ONLINE` |
| `StopServer` | Servidor de transición de `ONLINE` a `OFFLINE` |

### Usuarios de

| Acción | Descripción |
|---|---|
| `CreateUser` | Asociar un usuario a un servidor |
| `DescribeUser` | Obtener configuración de usuario y claves SSH |
| `UpdateUser` | Actualizar funciones, directorio de inicio o asignaciones de directorio de inicio |
| `DeleteUser` | Eliminar un usuario de un servidor |
| `ListUsers` | Lista paginada de usuarios en un servidor |

### Claves públicas SSH

| Acción | Descripción |
|---|---|
| `ImportSshPublicKey` | Adjuntar una clave pública SSH a un usuario |
| `DeleteSshPublicKey` | Eliminar una clave pública SSH de un usuario |

### Etiquetado

| Acción | Descripción |
|---|---|
| `TagResource` | Agregar o actualizar etiquetas en un servidor o usuario |
| `UntagResource` | Eliminar etiquetas de un servidor o usuario |
| `ListTagsForResource` | Listar etiquetas para un servidor o usuario |

## Configuración

| Variable de entorno | Predeterminado | Descripción |
|---|---|---|
| `FLOCI_SERVICES_TRANSFER_ENABLED` | `true` | Activar o desactivar Transferir familia |

## Formato ARN

```
arn:aws:transfer:{region}:{accountId}:server/{serverId}
arn:aws:transfer:{region}:{accountId}:user/{serverId}/{userName}
```

Los ID de servidor tienen el formato `s-` seguido de 17 caracteres alfanuméricos en minúscula (por ejemplo, `s-01234567890abcdef`).

## Ejemplo de uso de

```bash
export AWS_ENDPOINT_URL=http://localhost:4566

# Create a server
aws transfer create-server \
  --protocols SFTP \
  --endpoint-type PUBLIC

# List servers
aws transfer list-servers

# Stop a server (must be ONLINE)
aws transfer stop-server --server-id s-01234567890abcdef

# Start a server (must be OFFLINE)
aws transfer start-server --server-id s-01234567890abcdef

# Create a user
aws transfer create-user \
  --server-id s-01234567890abcdef \
  --user-name alice \
  --role arn:aws:iam::000000000000:role/transfer-role \
  --home-directory /uploads

# Import an SSH public key
aws transfer import-ssh-public-key \
  --server-id s-01234567890abcdef \
  --user-name alice \
  --ssh-public-key-body "ssh-rsa AAAA..."

# List users on a server
aws transfer list-users --server-id s-01234567890abcdef

# Tag a server
aws transfer tag-resource \
  --arn arn:aws:transfer:us-east-1:000000000000:server/s-01234567890abcdef \
  --tags Key=env,Value=dev

# Delete a user then the server
aws transfer delete-user \
  --server-id s-01234567890abcdef \
  --user-name alice
aws transfer stop-server --server-id s-01234567890abcdef
aws transfer delete-server --server-id s-01234567890abcdef
```

## Notas sobre

- **La fase 1** cubre únicamente el plano de gestión API. La conectividad SFTP del plano de datos (transferencia de archivos real) no se emula.
- El valor predeterminado del servidor `EndpointType` es `PUBLIC`. El campo `State` realiza la transición entre `ONLINE` y `OFFLINE` a través de `StartServer`/`StopServer`.
- Los cuerpos de las claves SSH se almacenan y devuelven tal cual; no se realiza ninguna validación criptográfica.
