# KMS

**Protocolo:** JSON 1.1 (`X-Amz-Target: TrentService.*`)
**Punto final:** `POST http://localhost:4566/`

## Acciones compatibles con

<!-- floci:actions:start -->
| Acción | Descripción |
| --- | --- |
| `CreateKey` | Cree una nueva clave KMS |
| `GenerateRandom` | Generar bytes aleatorios |
| `GetPublicKey` | Obtenga material de clave pública para claves asimétricas |
| `DescribeKey` | Obtener metadatos clave |
| `ListKeys` | Listar todas las claves |
| `CreateGrant` | Crear una concesión para una clave KMS |
| `ListGrants` | Lista de subvenciones para una clave KMS |
| `ListRetirableGrants` | Lista de subvenciones retirables por un principal |
| `RevokeGrant` | Revocar (eliminar administrativamente) una concesión |
| `RetireGrant` | Retirar una subvención (basada en token o clave+subvención) |
| `Encrypt` | Cifrar texto sin formato con una clave |
| `Decrypt` | Descifrar texto cifrado |
| `ReEncrypt` | Volver a cifrar con una clave diferente |
| `GenerateDataKey` | Generar una clave de datos (texto sin formato + cifrado) |
| `GenerateDataKeyWithoutPlaintext` | Generar sólo la clave de datos cifrados |
| `Sign` | Firmar un mensaje con clave asimétrica |
| `Verify` | Verificar una firma |
| `GenerateMac` | Generar una MAC con una clave HMAC |
| `VerifyMac` | Verificar una MAC con una clave HMAC |
| `CreateAlias` | Crear un nombre descriptivo para una clave |
| `DeleteAlias` | Eliminar un alias |
| `ListAliases` | Listar todos los alias |
| `ScheduleKeyDeletion` | Marcar una clave para eliminar |
| `CancelKeyDeletion` | Cancelar pendiente de eliminación |
| `TagResource` | Etiquetar una clave |
| `UntagResource` | Eliminar etiquetas |
| `ListResourceTags` | Etiquetas de lista |
| `GetKeyPolicy` | Obtenga la política de recursos de una clave |
| `PutKeyPolicy` | Actualizar la política de recursos de una clave |
| `UpdateKeyDescription` | Actualizar la descripción de una clave |
| `GetKeyRotationStatus` | Compruebe si la rotación automática de claves está habilitada |
| `EnableKeyRotation` | Habilitar la rotación automática de claves (solo claves simétricas) |
| `DisableKeyRotation` | Desactivar la rotación automática de claves |
| `EnableKey` | Habilitar una clave |
| `DisableKey` | Deshabilitar una clave |
| `RotateKeyOnDemand` | Rotar el material de clave según demanda (solo claves simétricas) |
<!-- floci:actions:end -->

## Alcance del soporte de subvención

Se admiten operaciones de ciclo de vida de concesión (`CreateGrant`, `ListGrants`, `ListRetirableGrants`, `RevokeGrant`, `RetireGrant`). Sin embargo, el soporte del ciclo de vida de la concesión **no** implica la aplicación de autorización basada en concesión en operaciones criptográficas (`Encrypt`, `Decrypt`, `Sign`, `Verify`, `GenerateDataKey`, etc.). Las subvenciones se almacenan y se pueden consultar, pero no se evalúan durante las operaciones criptográficas.

## Configuración

| Variables | Predeterminado | Descripción |
|---|---|---|
| `FLOCI_SERVICES_KMS_ENABLED` | `true` | Activar o desactivar el servicio |

## Ejemplos

```bash
export AWS_ENDPOINT_URL=http://localhost:4566

# Create a symmetric key
KEY_ID=$(aws kms create-key \
  --description "My encryption key" \
  --query KeyMetadata.KeyId --output text \
  --endpoint-url $AWS_ENDPOINT_URL)

# Create an alias
aws kms create-alias \
  --alias-name alias/my-key \
  --target-key-id $KEY_ID \
  --endpoint-url $AWS_ENDPOINT_URL

# Encrypt
CIPHER=$(aws kms encrypt \
  --key-id alias/my-key \
  --plaintext "Hello, World!" \
  --query CiphertextBlob --output text \
  --endpoint-url $AWS_ENDPOINT_URL)

# Decrypt
aws kms decrypt \
  --ciphertext-blob $CIPHER \
  --query Plaintext --output text \
  --endpoint-url $AWS_ENDPOINT_URL | base64 --decode

# Generate a data key (envelope encryption)
aws kms generate-data-key \
  --key-id alias/my-key \
  --key-spec AES_256 \
  --endpoint-url $AWS_ENDPOINT_URL
```
`CreateKey` también acepta una clave de etiqueta reservada en el momento de la creación, `floci:override-id`, cuando las pruebas necesitan un `KeyId` determinista. Floci utiliza el valor de la etiqueta como ID de clave creada, elimina la etiqueta reservada de las etiquetas de recursos almacenadas y rechaza los intentos de agregar etiquetas `floci:*` más adelante a través de `TagResource`.
