# Módulo 4 · Secretos y configuración: Secrets Manager, KMS y SSM

## La regla más importante de seguridad

**Nunca guardes un secreto en el código fuente.** Ni en variables de entorno en el `Dockerfile`. Ni en el repositorio de git. Si lo haces y el repositorio se filtra (o un compañero lo ve), la brecha ya ocurrió.

La solución: los secretos viven en un servicio especializado y tu código los lee en tiempo de ejecución.

| AWS | Azure | GCP |
|-----|-------|-----|
| Secrets Manager + KMS | Key Vault (puerto 4577) | Secret Manager (puerto 4588) |
| SSM Parameter Store | App Configuration | Runtime Configurator |

---

## AWS Secrets Manager con Floci

```bash
eval $(floci env)

# Guarda un secreto (string simple)
aws secretsmanager create-secret \
  --name /app/db-password \
  --secret-string "mi-password-super-segura"

# Guarda un secreto como JSON (múltiples valores)
aws secretsmanager create-secret \
  --name /app/base-de-datos \
  --secret-string '{"host":"localhost","usuario":"admin","password":"s3cr3t0","base":"mi_app"}'

# Lee el secreto
aws secretsmanager get-secret-value \
  --secret-id /app/base-de-datos \
  --query SecretString --output text | jq .

# Lista secretos disponibles
aws secretsmanager list-secrets --query "SecretList[*].Name" --output table

# Actualiza un secreto (nueva versión, la anterior queda accesible por 7 días)
aws secretsmanager update-secret \
  --secret-id /app/base-de-datos \
  --secret-string '{"host":"prod.db","usuario":"admin","password":"nuevo-s3cr3t0","base":"mi_app"}'

# Elimina un secreto
aws secretsmanager delete-secret \
  --secret-id /app/db-password \
  --recovery-window-in-days 7
```

### Leer secretos desde Python (el patrón correcto)

```python
import boto3, json

def obtener_secreto(nombre_secreto: str) -> dict:
    client = boto3.client("secretsmanager",
        endpoint_url="http://localhost:4566",
        region_name="us-east-1",
        aws_access_key_id="test",
        aws_secret_access_key="test"
    )
    resp = client.get_secret_value(SecretId=nombre_secreto)
    return json.loads(resp["SecretString"])

# CORRECTO: lee el secreto al inicio, no en cada petición
config_db = obtener_secreto("/app/base-de-datos")

import psycopg2
conn = psycopg2.connect(
    host=config_db["host"],
    user=config_db["usuario"],
    password=config_db["password"],
    dbname=config_db["base"]
)
```

### Lambda que lee sus secretos automáticamente

```python
import boto3, json, os

# Caching: no llamar a Secrets Manager en cada invocación
_secreto_cache = {}

def obtener_secreto_cacheado(nombre):
    if nombre not in _secreto_cache:
        sm = boto3.client("secretsmanager",
            endpoint_url=os.environ.get("AWS_ENDPOINT_URL", "http://localhost:4566"),
            region_name="us-east-1",
            aws_access_key_id="test",
            aws_secret_access_key="test"
        )
        resp = sm.get_secret_value(SecretId=nombre)
        _secreto_cache[nombre] = json.loads(resp["SecretString"])
    return _secreto_cache[nombre]

def lambda_handler(event, context):
    config = obtener_secreto_cacheado(os.environ["SECRETO_DB"])
    # usa config["password"], config["host"], etc.
    return {"statusCode": 200, "body": "OK"}
```

---

## SSM Parameter Store — para configuración menos sensible

Parameter Store es más barato que Secrets Manager. Úsalo para configuración no-secreta.

```bash
# Guarda un parámetro simple (gratis)
aws ssm put-parameter \
  --name "/app/entorno" \
  --value "produccion" \
  --type String

# Guarda un parámetro cifrado (SecureString usa KMS)
aws ssm put-parameter \
  --name "/app/api-key-externa" \
  --value "abc123-clave-api" \
  --type SecureString

# Lee un parámetro
aws ssm get-parameter \
  --name "/app/entorno" \
  --query Parameter.Value --output text

# Lee un SecureString desencriptado
aws ssm get-parameter \
  --name "/app/api-key-externa" \
  --with-decryption \
  --query Parameter.Value --output text

# Lee todos los parámetros de un namespace
aws ssm get-parameters-by-path \
  --path "/app" \
  --with-decryption \
  --query "Parameters[*].[Name,Value]" --output table
```

### ¿Cuándo usar Secrets Manager vs SSM Parameter Store?

| | Secrets Manager | SSM Parameter Store |
|-|----------------|---------------------|
| Caso de uso | Contraseñas de DB, API keys sensibles | URLs, feature flags, config general |
| Rotación automática | Sí (Lambda que rota) | No |
| Costo (AWS real) | $0.40/secreto/mes | Gratis (Standard) |
| TTL / expiración | Sí | No |

---

## KMS — tus propias claves de cifrado

KMS crea y gestiona claves de cifrado. Los datos que guardas en S3, DynamoDB o Secrets Manager pueden cifrarse con tu propia clave KMS.

```bash
# Crea una clave KMS (Customer Managed Key)
KEY_ID=$(aws kms create-key \
  --description "Clave para datos de usuarios" \
  --query KeyMetadata.KeyId --output text)

echo "Key ID: $KEY_ID"

# Crea un alias para referirte a la clave por nombre
aws kms create-alias \
  --alias-name alias/clave-usuarios \
  --target-key-id $KEY_ID

# Cifra texto con la clave
TEXTO_CIFRADO=$(aws kms encrypt \
  --key-id alias/clave-usuarios \
  --plaintext "dato muy sensible" \
  --query CiphertextBlob --output text)

echo "Cifrado: $TEXTO_CIFRADO"

# Descifra
aws kms decrypt \
  --ciphertext-blob $TEXTO_CIFRADO \
  --query Plaintext --output text | base64 -d
```

---

## GCP Secret Manager con Floci-gcp

```bash
export SECRETMANAGER_EMULATOR_HOST=localhost:4588
export CLOUDSDK_CORE_PROJECT=floci-local

# Crea un secreto
gcloud secrets create db-password

# Añade una versión
echo -n "mi-password-gcp" | gcloud secrets versions add db-password --data-file=-

# Lee el secreto
gcloud secrets versions access latest --secret=db-password
```

```python
import os
os.environ["SECRETMANAGER_EMULATOR_HOST"] = "localhost:4588"

from google.cloud import secretmanager

client = secretmanager.SecretManagerServiceClient()
project = "floci-local"

# Crea y lee un secreto
name = f"projects/{project}/secrets/db-password/versions/latest"
response = client.access_secret_version(request={"name": name})
print(response.payload.data.decode())
```

---

## Azure Key Vault con Floci-az

```bash
eval $(floci az env)

# Crea un secreto en Key Vault
az keyvault secret set \
  --vault-name mi-keyvault \
  --name db-password \
  --value "mi-password-azure"

# Lee el secreto
az keyvault secret show \
  --vault-name mi-keyvault \
  --name db-password \
  --query value --output tsv
```

---

## Comparación de servicios de secretos

| Operación | AWS CLI | GCP CLI | Azure CLI |
|-----------|---------|---------|-----------|
| Crear secreto | `aws secretsmanager create-secret` | `gcloud secrets create` | `az keyvault secret set` |
| Leer secreto | `aws secretsmanager get-secret-value` | `gcloud secrets versions access` | `az keyvault secret show` |
| Puerto Floci | 4566 | 4588 | 4577 |

---

## Reto del módulo

1. Crea un secreto en Secrets Manager con host, usuario y password de una DB ficticia
2. Lee el secreto con la CLI y con Python, imprime solo el campo `host`
3. Crea un parámetro SSM tipo `SecureString` con una API key
4. Crea una clave KMS, cifra el texto "datos confidenciales" y descífralo
5. (Bonus) Replica el secreto en GCP Secret Manager con Floci-gcp

## Preguntas de salida

1. ¿Por qué nunca debes guardar un secreto en el código fuente ni en git?
2. ¿Cuándo elegirías Secrets Manager sobre SSM Parameter Store?
3. ¿Qué hace KMS que no hace Secrets Manager solo?
4. ¿Qué es el "principio de mínimo privilegio" y cómo se aplica aquí?
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

